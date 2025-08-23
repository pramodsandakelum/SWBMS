// src/components/TrendsChart.js
import React, { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Paper, Typography, Box } from "@mui/material";

export default function TrendsChart({ bins = [] }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Generate initial historical data (last 24 hours)
        const generateInitialData = () => {
            const data = [];
            const now = new Date();

            for (let i = 23; i >= 0; i--) {
                const time = new Date(now - i * 60 * 60 * 1000);
                const timeString = time.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                // Calculate average weight from current bins (simulate historical data)
                const avgWeight = bins.length > 0
                    ? bins.reduce((sum, bin) => sum + bin.weight, 0) / bins.length +
                    (Math.random() - 0.5) * 10 // Add some variation
                    : Math.random() * 50 + 20; // Random baseline if no bins

                data.push({
                    time: timeString,
                    avgWeight: Math.max(0, parseFloat(avgWeight.toFixed(1)))
                });
            }
            return data;
        };

        setChartData(generateInitialData());

        // Update chart data every 5 seconds with current average weight
        const interval = setInterval(() => {
            setChartData(prevData => {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                // Calculate current average weight
                const currentAvgWeight = bins.length > 0
                    ? bins.reduce((sum, bin) => sum + bin.weight, 0) / bins.length
                    : 0;

                const newDataPoint = {
                    time: timeString,
                    avgWeight: parseFloat(currentAvgWeight.toFixed(1))
                };

                // Keep only last 24 data points (rolling window)
                const updatedData = [...prevData.slice(1), newDataPoint];
                return updatedData;
            });
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [bins]);

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    padding: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {`Time: ${label}`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1976d2' }}>
                        {`Avg Weight: ${payload[0].value} kg`}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Typography
                variant="h6"
                sx={{
                    marginBottom: 2,
                    fontWeight: 600,
                    color: '#000000ff'
                }}
            >
                Average Weight Trends (24h)
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e0e0e0"
                        />
                        <XAxis
                            dataKey="time"
                            stroke="#666"
                            fontSize={12}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={12}
                            label={{
                                value: 'Weight (kg)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="avgWeight"
                            stroke="#1976d2"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, stroke: '#1976d2', strokeWidth: 2, fill: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}