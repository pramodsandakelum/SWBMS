import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";

const CHANGE_THRESHOLD = {
    weight: 5,
    fullness: 3,
};

const BinTable = () => {
    const [bins, setBins] = useState([]);
    const binMapRef = useRef(new Map());
    const queueRef = useRef([]);
    const clientRef = useRef(null);

    useEffect(() => {
        const client = mqtt.connect("wss://c1f5ac9342c94c8483a19f93a4baff51.s1.eu.hivemq.cloud:8884/mqtt", {
            username: "mqtt_admin",
            password: "Mqttadmin123",
            keepalive: 60,
        });

        clientRef.current = client;

        client.on("connect", () => {
            console.log("Connected to HiveMQ Cloud");
            client.subscribe("smartbin/data", { qos: 0 });
        });

        client.on("message", (_, payload) => {
            try {
                const data = JSON.parse(payload.toString());
                queueRef.current.push(data);
            } catch (err) {
                console.error("Error parsing MQTT message:", err);
            }
        });

        return () => client.end(true);
    }, []);

    // Batch updates every 2s to update state
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

    if (bins.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-300 text-lg font-medium">Smart Bins Overview</p>
                    <p className="text-slate-400 text-sm mt-1">Waiting for live data...</p>
                </div>
            </div>
        );
    }

    const getFullnessColor = (fullness) => {
        if (fullness >= 80) return "bg-red-600/20 text-red-400 border border-red-500/30";
        if (fullness >= 60) return "bg-orange-600/20 text-orange-400 border border-orange-500/30";
        if (fullness >= 40) return "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30";
        return "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30";
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Smart Bins Overview</h2>

            <div className="flex-1 overflow-hidden rounded-lg border border-slate-700/50">
                <div className="overflow-x-auto overflow-y-auto h-full">
                    <table className="min-w-full">
                        <thead className="bg-slate-800/80 border-b border-slate-700/50 sticky top-0">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Fullness
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Weight
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900/40 divide-y divide-slate-700/30">
                            {bins.map((bin) => (
                                <tr key={bin.id} className="hover:bg-slate-800/50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 opacity-80"></div>
                                            <div className="text-sm font-medium text-slate-200">{bin.location_name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFullnessColor(bin.fullness)}`}>
                                            {bin.fullness.toFixed(0)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-slate-300 font-mono text-sm">{bin.weight.toFixed(1)} kg</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BinTable;
