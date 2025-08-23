// src/components/KPICards.js
import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";

const KPICards = ({ bins = [] }) => {
    // Compute KPIs safely
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
            color: "#3b82f6",
            bgColor: "#eff6ff"
        },
        {
            label: "Full Bins (>=75%)",
            value: fullBins,
            color: "#ef4444",
            bgColor: "#fef2f2"
        },
        {
            label: "Avg Fullness (%)",
            value: `${avgFullness}%`,
            color: "#f59e0b",
            bgColor: "#fefbeb"
        },
        {
            label: "Avg Weight (kg)",
            value: `${avgWeight}`,
            color: "#10b981",
            bgColor: "#f0fdf4"
        },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={1.5} direction="column">
                {kpis.map((kpi, index) => (
                    <Grid item xs={12} key={kpi.label}>
                        <Paper
                            elevation={0}
                            sx={{
                                padding: 1.5,
                                textAlign: "center",
                                backgroundColor: kpi.bgColor,
                                border: `1px solid ${kpi.color}20`,
                                borderRadius: 2,
                                height: 65,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: `0 2px 8px ${kpi.color}15`,
                                }
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: kpi.color,
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                    lineHeight: 1,
                                    marginBottom: 0.5
                                }}
                            >
                                {kpi.label}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: kpi.color,
                                    fontSize: '1.25rem',
                                    lineHeight: 1,
                                }}
                            >
                                {kpi.value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default KPICards;