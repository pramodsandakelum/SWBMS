// src/components/TrendsChart.js
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Paper, Typography, Box } from "@mui/material";

export default function TrendsChart({ data }) {
    return (
        <Paper elevation={4} sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>Average Fullness (last 12h)</Typography>
            <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgFullness" stroke="#1976d2" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}
