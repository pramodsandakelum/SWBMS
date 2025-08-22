// src/components/FullnessPie.js
import React from "react";
import { Typography, Box } from "@mui/material";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const FullnessPie = ({ bins = [] }) => {
    // Categorize bins by fullness
    const categories = {
        empty: bins.filter((b) => b.fullness < 25).length,
        partial: bins.filter((b) => b.fullness >= 25 && b.fullness < 75).length,
        full: bins.filter((b) => b.fullness >= 75).length,
    };

    const data = [
        { name: "Empty", label: "Empty (<25%)", value: categories.empty, color: "#10b981" },
        { name: "Partial", label: "Partial (25-74%)", value: categories.partial, color: "#f59e0b" },
        { name: "Full", label: "Full (≥75%)", value: categories.full, color: "#ef4444" },
    ];

    // Filter out categories with 0 values
    const filteredData = data.filter(item => item.value > 0);
    const totalBins = bins.length;

    // Custom label function
    const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null; // Hide labels for very small slices

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="12"
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
                <Box
                    sx={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        padding: 1.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: data.payload.color }}>
                        {data.payload.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {data.value} bins ({((data.value / totalBins) * 100).toFixed(1)}%)
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    // Custom legend
    const CustomLegend = ({ payload }) => {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                {payload.map((entry, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: entry.color
                            }}
                        />
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                            {entry.payload.name} ({entry.payload.value})
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    if (totalBins === 0) {
        return (
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
                    Bin Fullness Distribution
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    No data available
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 0
        }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                    Bin Fullness Distribution
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {totalBins} bins total
                </Typography>
            </Box>

            {/* Chart */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            innerRadius="30%"
                            paddingAngle={2}
                            labelLine={false}
                            label={renderLabel}
                        >
                            {filteredData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke={entry.color}
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default FullnessPie;