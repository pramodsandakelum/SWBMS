// src/hooks/useBinStats.js
import { useEffect, useMemo, useState } from "react";
import { subHours, formatISO, parseISO } from "date-fns";
import { supabase } from "../supabaseClient";

// how often to refresh chart data (ms)
const REFRESH_EVERY = 15000;

export default function useBinStats(hoursBack = 12) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bins, setBins] = useState([]);
    const [readings, setReadings] = useState([]);

    async function fetchAll() {
        try {
            setError(null);
            const sinceISO = formatISO(subHours(new Date(), hoursBack));

            const [{ data: binsData, error: binsErr }, { data: readingsData, error: readingsErr }] =
                await Promise.all([
                    supabase.from("bins").select("id,location_name,latitude,longitude"),
                    supabase
                        .from("readings")
                        .select("bin_id,fullness_percent,weight_kg,recorded_at")
                        .gte("recorded_at", sinceISO)
                        .order("recorded_at", { ascending: true }),
                ]);

            if (binsErr) throw binsErr;
            if (readingsErr) throw readingsErr;

            setBins(binsData || []);
            setReadings(readingsData || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed loading stats");
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAll();
        const id = setInterval(fetchAll, REFRESH_EVERY);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoursBack]);

    // compute latest status per bin + pie + trend
    const { kpis, pieData, trendData } = useMemo(() => {
        // latest reading per bin
        const latestByBin = new Map();
        for (const r of readings) {
            latestByBin.set(r.bin_id, r);
        }

        let full = 0, half = 0, normal = 0;
        bins.forEach((b) => {
            const r = latestByBin.get(b.id);
            const f = r ? Number(r.fullness_percent || 0) : 0;
            if (f >= 80) full += 1;
            else if (f >= 40) half += 1;
            else normal += 1;
        });

        const kpis = {
            totalBins: bins.length,
            full,
            half,
            normal,
        };

        const pieData = [
            { name: "Full (≥80%)", value: full },
            { name: "Half (40–79%)", value: half },
            { name: "Normal (<40%)", value: normal },
        ];

        // trend: average fullness per hour bucket
        const buckets = new Map(); // hourKey -> {sum, count}
        readings.forEach((r) => {
            const d = parseISO(r.recorded_at);
            const key = d.toISOString().slice(0, 13) + ":00"; // YYYY-MM-DDTHH:00
            const row = buckets.get(key) || { sum: 0, count: 0 };
            row.sum += Number(r.fullness_percent || 0);
            row.count += 1;
            buckets.set(key, row);
        });

        const trendData = Array.from(buckets.entries())
            .sort((a, b) => (a[0] < b[0] ? -1 : 1))
            .map(([key, { sum, count }]) => ({
                time: key.slice(11, 16), // HH:00
                avgFullness: count ? +(sum / count).toFixed(1) : 0,
            }));

        return { kpis, pieData, trendData };
    }, [bins, readings]);

    return { loading, error, bins, readings, kpis, pieData, trendData, refresh: fetchAll };
}
