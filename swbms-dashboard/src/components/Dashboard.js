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
            backgroundColor: "transparent",
            minHeight: "auto",
            padding: 0
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
                        borderBottom: '1px solid #30363d',
                        backgroundColor: '#161b22'
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 600,
                                color: "#f0f6fc",
                                fontSize: { xs: '1.25rem', md: '1.5rem' }
                            }}
                        >
                            Real-time Bin Map
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: "#7c8591",
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
                            padding: 3,
                            borderBottom: '1px solid #30363d'
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: "#f0f6fc",
                                    fontSize: '1.125rem'
                                }}
                            >
                                Fullness Distribution
                            </Typography>
                        </Box>
                        <Box sx={{
                            padding: 3,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FullnessPie bins={bins} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Column 3: Trends Chart */}
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
                                Usage Trends
                            </Typography>
                        </Box>
                        <Box sx={{
                            padding: 3,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <TrendsChart bins={bins} />
                        </Box>
                    </Paper>
                </Grid>

            </Grid>

            {/* ROW 3: Bin Status Table - Full Width */}
            <Box>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid #30363d',
                        backgroundColor: '#161b22'
                    }}
                >
                    {/* Table Header */}
                    <Box sx={{
                        padding: 3,
                        borderBottom: '1px solid #30363d',
                        backgroundColor: '#161b22'
                    }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                color: "#f0f6fc",
                                fontSize: { xs: '1.25rem', md: '1.375rem' }
                            }}
                        >
                            Bin Status Overview
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#7c8591",
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