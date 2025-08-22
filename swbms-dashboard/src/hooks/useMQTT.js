import { useEffect, useState } from "react";
import mqtt from "mqtt";

const MQTT_BROKER = "wss://c1f5ac9342c94c8483a19f93a4baff51.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_USER = "mqtt_admin";
const MQTT_PASS = "Mqttadmin123";
const MQTT_TOPIC = "smartbin/data";

export const useMQTT = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const client = mqtt.connect(MQTT_BROKER, {
            username: MQTT_USER,
            password: MQTT_PASS,
        });

        client.on("connect", () => {
            console.log("Connected to HiveMQ MQTT WebSocket");
            client.subscribe(MQTT_TOPIC);
        });

        client.on("message", (topic, payload) => {
            try {
                const data = JSON.parse(payload.toString());
                setMessages((prev) => [data, ...prev].slice(0, 200)); // keep last 200
            } catch (err) {
                console.error("Invalid MQTT message:", err);
            }
        });

        client.on("error", (err) => {
            console.error("MQTT Error:", err);
        });

        return () => {
            client.end();
        };
    }, []);

    return messages;
};
