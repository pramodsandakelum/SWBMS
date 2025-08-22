// src/components/Dashboard.js
import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";

import KPICards from "./KPICards";
import FullnessPie from "./FullnessPie";
import BinMap from "./BinMap";
import BinTable from "./BinTable";
import TrendsChart from "./TrendsChart";

const Dashboard = ({ bins }) => {
    return (
        <Box sx={{
            backgroundColor: "#f1f5f9",
            minHeight: "100vh",
            padding: { xs: 2, md: 3 }
        }}>
            {/* ROW 1: Map Section - Full Width */}
            <Box sx={{ marginBottom: 4 }}>
                <Paper
                    elevation={1}
                    sx={{
                        height: { xs: 400, md: 500, lg: 600 },
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff'
                    }}
                >
                    {/* Map Header */}
                    <Box sx={{
                        padding: 3,
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff'
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: { xs: '1.5rem', md: '2rem' }
                            }}
                        >
                            Real-time Bin Map
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: "#64748b",
                                marginTop: 0.5
                            }}
                        >
                            Live monitoring of all waste bins
                        </Typography>
                    </Box>

                    {/* Map Content */}
                    <Box sx={{
                        height: 'calc(100% - 100px)',
                        padding: 2
                    }}>
                        <BinMap bins={bins} />
                    </Box>
                </Paper>
            </Box>

            {/* ROW 2: Three Columns - KPI Cards, Pie Chart, Trends Chart */}
            <Grid container spacing={4} sx={{ marginBottom: 4 }}>

                {/* Column 1: KPI Cards */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={1}
                        sx={{
                            height: 450,
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{
                            padding: 3,
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                                }}
                            >
                                Key Metrics
                            </Typography>
                        </Box>
                        <Box sx={{
                            padding: 3,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <KPICards bins={bins} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Column 2: Pie Chart */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={1}
                        sx={{
                            height: 450,
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{
                            flex: 1,
                            padding: 3,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FullnessPie bins={bins} />
                        </Box>
                    </Paper>
                </Grid>


            </Grid>

            {/* ROW 3: Bin Status Table - Full Width */}
            <Box>
                <Paper
                    elevation={1}
                    sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff'
                    }}
                >
                    {/* Table Header */}
                    <Box sx={{
                        padding: 3,
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff'
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: { xs: '1.5rem', md: '2rem' }
                            }}
                        >
                            Bin Status Overview
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: "#64748b",
                                marginTop: 0.5
                            }}
                        >
                            Detailed status and metrics for all bins
                        </Typography>
                    </Box>

                    {/* Table Content */}
                    <Box sx={{
                        padding: 3,
                        minHeight: 400
                    }}>
                        <BinTable bins={bins} />
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashboard;