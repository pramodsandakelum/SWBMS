import os
import json
import asyncio
import logging
from collections import deque

import paho.mqtt.client as mqtt
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("swbms-mqtt-sse")

app = FastAPI()

# --------- Configuration (from env) ----------
MQTT_HOST = os.getenv("MQTT_HOST", "c1f5ac9342c94c8483a19f93a4baff51.s1.eu.hivemq.cloud")
MQTT_PORT = int(os.getenv("MQTT_PORT", "8883"))
MQTT_USER = os.getenv("MQTT_USER", "mqtt_admin")
MQTT_PASS = os.getenv("MQTT_PASS", "Mqttadmin123")
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "smartbin/data")
MQTT_TLS = os.getenv("MQTT_TLS", "true").lower() in ("1", "true", "yes")
MQTT_TLS_INSECURE = os.getenv("MQTT_TLS_INSECURE", "true").lower() in ("1", "true", "yes")  # skip cert verify (dev)
RECENT_MAX = int(os.getenv("RECENT_MAX", "200"))

# --------- Runtime structures ----------
broadcast_queue: asyncio.Queue = asyncio.Queue()   # messages from MQTT -> broadcaster
recent_messages = deque(maxlen=RECENT_MAX)        # store recent messages (strings)
clients = set()                                   # not per-client queue here — broadcaster distributes

# --------- MQTT callbacks (runs in paho thread) ----------
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("Connected to MQTT broker")
        client.subscribe(MQTT_TOPIC)
        logger.info(f"Subscribed to topic: {MQTT_TOPIC}")
    else:
        logger.error(f"MQTT connection failed with rc={rc}")

def on_message(client, userdata, msg):
    try:
        payload_raw = msg.payload.decode("utf-8", errors="replace")
        # try to format JSON nicely; if not JSON, forward raw
        try:
            parsed = json.loads(payload_raw)
            payload = json.dumps(parsed, separators=(",", ":"), ensure_ascii=False)
        except Exception:
            payload = payload_raw

        logger.debug("MQTT received: %s", payload)
        loop = asyncio.get_event_loop()
        # push into broadcast queue safely from paho thread
        loop.call_soon_threadsafe(broadcast_queue.put_nowait, payload)

        # also keep in recent_messages (threadsafe via call_soon_threadsafe)
        loop.call_soon_threadsafe(lambda p=payload: recent_messages.appendleft(p))
    except Exception as e:
        logger.exception("Error in on_message: %s", e)

# --------- Background broadcaster (async) ----------
async def broadcaster_task():
    """Read messages from broadcast_queue and push to all client queues."""
    logger.info("Broadcaster task started")
    while True:
        msg = await broadcast_queue.get()
        # broadcast to all client-specific queues
        for q in list(clients):
            try:
                q.put_nowait(msg)
            except asyncio.QueueFull:
                # drop message for slow client
                logger.debug("Dropping message for slow client")
        broadcast_queue.task_done()

# --------- Setup MQTT client on startup ----------
mqtt_client = mqtt.Client()

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up: configuring MQTT and broadcaster")
    mqtt_client.username_pw_set(MQTT_USER, MQTT_PASS)
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message

    if MQTT_TLS:
        # If you want to verify certs in production, remove tls_insecure_set or set it to False
        mqtt_client.tls_set()  # uses system CA certs
        if MQTT_TLS_INSECURE:
            mqtt_client.tls_insecure_set(True)

    try:
        mqtt_client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)
    except Exception as e:
        logger.exception("MQTT connect failed: %s", e)
    mqtt_client.loop_start()

    # start broadcaster
    asyncio.create_task(broadcaster_task())
    logger.info("Startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down MQTT client")
    mqtt_client.loop_stop()
    mqtt_client.disconnect()

# --------- SSE stream endpoint ----------
@app.get("/stream")
async def stream():
    """
    Server-Sent Events endpoint that streams MQTT messages to the browser.
    Each connected client gets its own asyncio.Queue.
    """
    client_queue: asyncio.Queue = asyncio.Queue(maxsize=50)
    clients.add(client_queue)
    logger.info("Client connected to /stream (total clients=%d)", len(clients))

    # generator that yields SSE data
    async def event_generator():
        try:
            # first send the recent messages (most-recent-first)
            for msg in list(recent_messages):
                yield f"data: {msg}\n\n"
            # then stream new messages
            while True:
                data = await client_queue.get()
                yield f"data: {data}\n\n"
        except asyncio.CancelledError:
            logger.info("Event generator cancelled for a client")
        finally:
            # cleanup
            try:
                clients.remove(client_queue)
            except Exception:
                pass
            logger.info("Client disconnected from /stream (total clients=%d)", len(clients))

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# --------- Recent JSON endpoint ----------
@app.get("/recent")
async def recent():
    return JSONResponse(list(recent_messages))

# --------- Simple HTML UI to view messages in browser ----------
INDEX_HTML = """
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>SWBMS Live MQTT Viewer</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; margin: 16px; }
    h1 { font-size: 20px; }
    #log { white-space: pre-wrap; background:#111; color:#0f0; padding:10px; height:60vh; overflow:auto; border-radius:6px;}
    .meta { color:#666; font-size:13px; margin-bottom:6px; }
  </style>
</head>
<body>
  <h1>SWBMS Live MQTT Viewer</h1>
  <div class="meta">Topic: <b>%s</b>  —  Broker: <b>%s:%s</b></div>
  <div id="log"></div>

<script>
  const log = document.getElementById('log');
  function appendLine(s){
    const now = new Date().toLocaleTimeString();
    log.textContent = now + " | " + s + "\\n" + log.textContent;
  }

  // load recent messages
  fetch('/recent').then(r=>r.json()).then(arr=>{
    arr.forEach(m => appendLine(m));
  });

  // connect SSE
  const evtSource = new EventSource('/stream');
  evtSource.onmessage = function(e) {
    appendLine(e.data);
  };
  evtSource.onerror = function(e) {
    appendLine('--- connection error (reconnecting) ---');
  };
</script>
</body>
</html>
""" % (MQTT_TOPIC, MQTT_HOST, MQTT_PORT)

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return HTMLResponse(INDEX_HTML)

# --------- health check ----------
@app.get("/health")
async def health():
    return {"status": "ok", "mqtt_connected": mqtt_client.is_connected()}
