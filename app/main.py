import asyncio
import paho.mqtt.client as mqtt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

app = FastAPI()

# --- MQTT CONFIG ---
MQTT_BROKER = "c1f5ac9342c94c8483a19f93a4baff51.s1.eu.hivemq.cloud"
MQTT_PORT = 8883  # TLS Port
MQTT_USER = "mqttadmin"
MQTT_PASS = "Mqttadmin123"
MQTT_TOPIC = "smartbin/data"

# --- MQTT CLIENT ---
client = mqtt.Client()
client.username_pw_set(MQTT_USER, MQTT_PASS)
client.tls_set()  # enable TLS (required for port 8883)

# --- Connected WebSocket Clients ---
websocket_clients: List[WebSocket] = []

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to HiveMQ")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"❌ Failed to connect: {rc}")

def on_message(client, userdata, msg):
    message = f"{msg.topic}: {msg.payload.decode()}"
    print(f"📩 {message}")
    # Send message to all connected WebSocket clients
    for ws in websocket_clients:
        asyncio.run_coroutine_threadsafe(ws.send_text(message), asyncio.get_event_loop())

client.on_connect = on_connect
client.on_message = on_message

# --- STARTUP ---
@app.on_event("startup")
async def startup_event():
    loop = asyncio.get_event_loop()
    # connect MQTT in background
    loop.run_in_executor(None, client.connect, MQTT_BROKER, MQTT_PORT, 60)
    loop.run_in_executor(None, client.loop_forever)

# --- ROUTES ---
@app.get("/")
def root():
    return {"status": "FastAPI running", "mqtt": "connected"}

@app.post("/publish/{message}")
def publish(message: str):
    client.publish(MQTT_TOPIC, message)
    return {"published": message}

# --- WEBSOCKET ROUTE ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_clients.append(websocket)
    try:
        while True:
            # Keep connection alive (client may also send messages)
            data = await websocket.receive_text()
            print(f"🌐 WS Received: {data}")
            # Optional: publish incoming WS messages to MQTT
            client.publish(MQTT_TOPIC, data)
    except WebSocketDisconnect:
        websocket_clients.remove(websocket)
        print("❌ WebSocket client disconnected")
