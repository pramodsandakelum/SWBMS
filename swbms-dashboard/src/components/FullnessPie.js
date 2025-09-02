import { Typography } from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const FullnessPie = ({ bins = [] }) => {
    // Categorize bins by fullness
    const categories = {
        empty: bins.filter((b) => b.fullness < 25).length,
        partial: bins.filter((b) => b.fullness >= 25 && b.fullness < 75).length,
        full: bins.filter((b) => b.fullness >= 75).length,
    };

    const data = [
        { name: "Empty", label: "Empty (<25%)", value: categories.empty, color: "#10b981" },
        { name: "Partial", label: "Partial (25–74%)", value: categories.partial, color: "#f59e0b" },
        { name: "Full", label: "Full (≥75%)", value: categories.full, color: "#ef4444" },
    ];

    const filteredData = data.filter((item) => item.value > 0);
    const totalBins = bins.length;

    // Custom label inside slices
    const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.08) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#f8fafc"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize="10"
                fontWeight="600"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div
                    className="bg-slate-900/90 backdrop-blur-md border rounded-lg p-2 shadow-lg"
                    style={{ borderColor: data.payload.color }}
                >
                    <p className="font-semibold text-slate-100 mb-1 text-xs" style={{ color: data.payload.color }}>
                        {data.payload.label}
                    </p>
                    <p className="text-slate-300 text-xs">
                        {data.value} bins ({((data.value / totalBins) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom legend
    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex flex-wrap justify-center gap-3 mt-2">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full shadow"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-300 text-xs font-medium">
                            {entry.payload.name} ({entry.payload.value})
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    if (totalBins === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="relative w-10 h-10 mb-3">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-600"></div>
                    <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400 animate-spin"></div>
                </div>
                <Typography variant="h6" className="font-semibold text-slate-300 mb-1 text-sm">
                    Bin Fullness Distribution
                </Typography>
                <Typography variant="body2" className="text-slate-400 text-xs">
                    Waiting for data...
                </Typography>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">

            {/* Chart */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="48%"
                            outerRadius="70%"
                            innerRadius="35%"
                            paddingAngle={2}
                            labelLine={false}
                            label={renderLabel}
                            stroke="rgba(148, 163, 184, 0.4)"
                            strokeWidth={1}
                            isAnimationActive={true}
                            animationDuration={800}
                        >
                            {filteredData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    className="transition-transform duration-300 hover:scale-105 cursor-pointer"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FullnessPie;