// src/pages/Dashboard.js
import { Grid, Paper, Typography } from "@mui/material";
import BinMap from "../components/BinMap";
import BinTable from "../components/BinTable";

export default function Dashboard() {
    return (
        <div style={{ padding: 20 }}>
            <Typography variant="h4" align="center" gutterBottom>
                🗑️ Smart Waste Bin Monitoring
            </Typography>
            <Grid container spacing={2}>
                {/* Map Section */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={4} sx={{ height: "600px" }}>
                        <BinMap />
                    </Paper>
                </Grid>

                {/* Table Section */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={4} sx={{ padding: 2, height: "600px", overflow: "auto" }}>
                        <Typography variant="h6" gutterBottom>
                            Bin Status Overview
                        </Typography>
                        <BinTable />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
