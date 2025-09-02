import { Paper, Typography } from "@mui/material";
import {
    Assessment,
    Delete,
    TrendingUp,
    Scale,
} from "@mui/icons-material";

const KPICards = ({ bins = [] }) => {
    // Compute KPIs
    const totalBins = bins.length;
    const fullBins = bins.filter((b) => b.fullness >= 75).length;
    const avgFullness =
        totalBins > 0
            ? (bins.reduce((sum, b) => sum + b.fullness, 0) / totalBins).toFixed(1)
            : 0;
    const avgWeight =
        totalBins > 0
            ? (bins.reduce((sum, b) => sum + b.weight, 0) / totalBins).toFixed(1)
            : 0;

    const kpis = [
        {
            label: "Total Bins",
            value: totalBins,
            color: "text-blue-400",
            bg: "bg-blue-500/20",
            border: "border-blue-500/30",
            bar: "bg-blue-400",
            icon: Assessment,
        },
        {
            label: "Full Bins",
            value: fullBins,
            color: "text-red-400",
            bg: "bg-red-500/20",
            border: "border-red-500/30",
            bar: "bg-red-400",
            icon: Delete,
        },
        {
            label: "Avg Fullness",
            value: `${avgFullness}%`,
            color: "text-yellow-400",
            bg: "bg-yellow-500/20",
            border: "border-yellow-500/30",
            bar: "bg-yellow-400",
            icon: TrendingUp,
        },
        {
            label: "Avg Weight",
            value: `${avgWeight} kg`,
            color: "text-emerald-400",
            bg: "bg-emerald-500/20",
            border: "border-emerald-500/30",
            bar: "bg-emerald-400",
            icon: Scale,
        },
    ];

    return (
        <div className="w-full h-full">
            <div className="grid grid-cols-2 gap-3 h-full">
                {kpis.map((kpi) => {
                    const IconComponent = kpi.icon;
                    return (
                        <div key={kpi.label} className="h-full">
                            <Paper
                                elevation={0}
                                className={`
                  relative bg-slate-800/80 backdrop-blur-sm 
                  border ${kpi.border} rounded-xl p-3 h-full
                  flex items-center gap-3 overflow-hidden
                  transition-all duration-300 cursor-pointer
                  group hover:scale-[1.02]
                `}
                            >
                                {/* Glow overlay */}
                                <div
                                    className={`absolute inset-0 ${kpi.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                />

                                {/* Icon */}
                                <div
                                    className={`
                    w-10 h-10 rounded-lg ${kpi.bg} border ${kpi.border} 
                    flex items-center justify-center
                    transition-transform duration-300 group-hover:scale-110 relative z-10
                  `}
                                >
                                    <IconComponent className={`text-lg ${kpi.color}`} />
                                </div>

                                {/* Text Content */}
                                <div className="flex-1 relative z-10">
                                    <Typography
                                        variant="body2"
                                        className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1"
                                    >
                                        {kpi.label}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        className={`font-bold ${kpi.color} text-lg font-mono leading-tight`}
                                    >
                                        {kpi.value}
                                    </Typography>
                                </div>

                                {/* Status bar */}
                                <div className={`w-1 h-8 rounded-full ${kpi.bar} opacity-70 relative z-10`} />
                            </Paper>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KPICards;