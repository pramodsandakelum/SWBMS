from flask import Flask, Response
import paho.mqtt.client as mqtt
import ssl
import threading

app = Flask(__name__)

# MQTT settings
MQTT_BROKER = "c1f5ac9342c94c8483a19f93a4baff51.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_TOPIC = "smartbin/data"   
MQTT_USER = "mqtt_admin"    
MQTT_PASS = "Mqttadmin123"     

latest_message = "No data yet"

# MQTT callbacks
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to HiveMQ Cloud!")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"❌ Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    global latest_message
    latest_message = f"{msg.topic}: {msg.payload.decode()}"
    print("📩", latest_message)

def mqtt_thread():
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASS)
    client.tls_set(cert_reqs=ssl.CERT_NONE)  # TLS required for port 8883
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()

# Flask route
@app.route("/")
def index():
    return f"<h2>Smart Bin MQTT Viewer</h2><p>Latest message: {latest_message}</p>"

if __name__ == "__main__":
    threading.Thread(target=mqtt_thread, daemon=True).start()
    app.run(host="0.0.0.0", port=5000)
