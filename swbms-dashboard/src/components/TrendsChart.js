import { useState, useEffect } from "react";
import {
    ResponsiveContainer,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
    AreaChart,
} from "recharts";
import { Typography } from "@mui/material";
import { Timeline, Scale, BatteryFull } from "@mui/icons-material";

export default function TrendsChart({ bins = [] }) {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Generate initial historical data (last 12 hours)
        const generateInitialData = () => {
            const data = [];
            const now = new Date();

            for (let i = 11; i >= 0; i--) {
                const time = new Date(now - i * 60 * 60 * 1000);
                const timeString = time.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

                const avgWeight =
                    bins.length > 0
                        ? bins.reduce((sum, bin) => sum + bin.weight, 0) / bins.length +
                        (Math.random() - 0.5) * 10
                        : Math.random() * 50 + 20;

                const avgFullness =
                    bins.length > 0
                        ? bins.reduce((sum, bin) => sum + bin.fullness, 0) / bins.length +
                        (Math.random() - 0.5) * 15
                        : Math.random() * 40 + 30;

                data.push({
                    time: timeString,
                    avgWeight: Math.max(0, parseFloat(avgWeight.toFixed(1))),
                    avgFullness: Math.max(0, Math.min(100, parseFloat(avgFullness.toFixed(1)))),
                });
            }
            return data;
        };

        setChartData(generateInitialData());
        setIsLoading(false);

        // Update every 5 seconds
        const interval = setInterval(() => {
            setChartData((prevData) => {
                const now = new Date();
                const timeString = now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

                const currentAvgWeight =
                    bins.length > 0
                        ? bins.reduce((sum, bin) => sum + bin.weight, 0) / bins.length
                        : 0;

                const currentAvgFullness =
                    bins.length > 0
                        ? bins.reduce((sum, bin) => sum + bin.fullness, 0) / bins.length
                        : 0;

                const newDataPoint = {
                    time: timeString,
                    avgWeight: parseFloat(currentAvgWeight.toFixed(1)),
                    avgFullness: parseFloat(currentAvgFullness.toFixed(1)),
                };

                return [...prevData.slice(1), newDataPoint];
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [bins]);

    // tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="bg-slate-900/90 backdrop-blur-md border rounded-lg p-3 shadow-lg min-w-32"
                    style={{ borderColor: payload[0].color }}
                >
                    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-600">
                        <Timeline className="text-xs text-emerald-400" />
                        <span className="text-emerald-400 font-mono font-semibold text-xs">
                            {label}
                        </span>
                    </div>

                    {payload.map((entry, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center mb-1 last:mb-0"
                        >
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-slate-300 text-xs">
                                    {entry.dataKey === "avgWeight" ? "Weight" : "Fullness"}:
                                </span>
                            </div>
                            <span
                                className="font-mono font-semibold text-xs ml-2"
                                style={{ color: entry.color }}
                            >
                                {entry.value}
                                {entry.dataKey === "avgWeight" ? " kg" : "%"}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3"></div>
                    <Typography variant="body2" className="text-slate-400 text-xs">
                        Loading analytics...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            {/* Header*/}
            <div className="flex justify-between items-center mb-2">
                <div>

                    <Typography variant="caption" className="text-slate-400 text-xs">
                        12-hour window
                    </Typography>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-md px-2 py-1 border border-slate-700/50">
                        <Scale fontSize="small" className="text-slate-500 text-sm" />
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">Weight</p>
                            <p className="text-emerald-400 font-mono font-semibold text-xs">
                                {chartData.at(-1)?.avgWeight ?? 0} kg
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-md px-2 py-1 border border-slate-700/50">
                        <BatteryFull fontSize="small" className="text-slate-500 text-sm" />
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">Capacity</p>
                            <p className="text-blue-400 font-mono font-semibold text-xs">
                                {chartData.at(-1)?.avgFullness ?? 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart*/}
            <div className="h-full min-h-32 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/40 rounded-lg border border-slate-700/30"></div>

                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="fullnessGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="2 4"
                            stroke="rgba(51, 65, 85, 0.3)"
                            horizontal={true}
                            vertical={false}
                        />

                        <XAxis
                            dataKey="time"
                            stroke="#94A3B8"
                            fontSize={9}
                            interval="preserveStartEnd"
                            tickLine={false}
                            axisLine={{ stroke: "rgba(51, 65, 85, 0.5)" }}
                        />

                        <YAxis
                            stroke="#94A3B8"
                            fontSize={9}
                            tickLine={false}
                            axisLine={{ stroke: "rgba(51, 65, 85, 0.5)" }}
                            domain={[0, "dataMax + 10"]}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Area
                            type="monotone"
                            dataKey="avgWeight"
                            stroke="#3ECF8E"
                            strokeWidth={2}
                            fill="url(#weightGradient)"
                            dot={false}
                            activeDot={{
                                r: 4,
                                stroke: "#3ECF8E",
                                strokeWidth: 2,
                                fill: "#1E293B",
                                filter: "drop-shadow(0 0 4px rgba(62,207,142,0.8))",
                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey="avgFullness"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            dot={false}
                            activeDot={{
                                r: 4,
                                stroke: "#3B82F6",
                                strokeWidth: 2,
                                fill: "#1E293B",
                                filter: "drop-shadow(0 0 4px rgba(59,130,246,0.8))",
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Live Indicator*/}
                <div className="absolute top-1 right-1 flex items-center bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5">
                    <div className="relative w-1.5 h-1.5 mr-1">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 bg-emerald-400 rounded-full"></div>
                    </div>
                    <span className="text-emerald-400 text-xs font-medium uppercase tracking-wide">
                        Live
                    </span>
                </div>
            </div>
        </div>
    );
}