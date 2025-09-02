import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { supabase } from "../supabaseClient";

const CHANGE_THRESHOLD = {
    weight: 5,
    fullness: 3,
};

export const useMQTT = (topic = "smartbin/data") => {
    const [bins, setBins] = useState([]);
    const binMapRef = useRef(new Map());
    const queueRef = useRef([]);
    const clientRef = useRef(null);

    useEffect(() => {
        const client = mqtt.connect(
            "wss://c1f5ac9342c94c8483a19f93a4baff51.s1.eu.hivemq.cloud:8884/mqtt",
            {
                username: "mqtt_admin",
                password: "Mqttadmin123",
                keepalive: 60,
            }
        );

        clientRef.current = client;

        client.on("connect", () => {
            console.log("Connected to HiveMQ Cloud");
            client.subscribe(topic);
        });

        client.on("message", async (_, payload) => {
            try {
                const data = JSON.parse(payload.toString());
                queueRef.current.push(data);

                // Insert/update in Supabase
                const { data: binData } = await supabase
                    .from("bins")
                    .select("id")
                    .eq("id", data.id)
                    .single();

                if (!binData) {
                    await supabase.from("bins").insert([
                        {
                            id: data.id,
                            location_name: data.location_name,
                            latitude: data.latitude,
                            longitude: data.longitude,
                        },
                    ]);
                }

                await supabase.from("readings").insert([
                    {
                        bin_id: data.id,
                        weight_kg: data.weight,
                        fullness_percent: data.fullness,
                    },
                ]);
            } catch (err) {
                console.error("MQTT parse or Supabase error", err);
            }
        });

        return () => client.end(true);
    }, [topic]);

    // batch updates every 2s for dashboard performance
    useEffect(() => {
        const interval = setInterval(() => {
            if (queueRef.current.length > 0) {
                const updates = [];
                queueRef.current.forEach((bin) => {
                    const prev = binMapRef.current.get(bin.id);
                    if (
                        !prev ||
                        Math.abs(bin.weight - prev.weight) >= CHANGE_THRESHOLD.weight ||
                        Math.abs(bin.fullness - prev.fullness) >= CHANGE_THRESHOLD.fullness
                    ) {
                        updates.push(bin);
                        binMapRef.current.set(bin.id, bin);
                    }
                });
                queueRef.current = [];

                if (updates.length > 0) {
                    setBins((prev) => {
                        const map = new Map(prev.map((b) => [b.id, b]));
                        updates.forEach((b) => map.set(b.id, b));
                        return Array.from(map.values());
                    });
                }
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return bins;
};
