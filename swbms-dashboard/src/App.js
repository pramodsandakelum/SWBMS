// src/App.js
import React from "react";
import { CssBaseline, Container, Typography } from "@mui/material";
import { useMQTT } from "./hooks/useMQTT";
import Dashboard from "./components/Dashboard";

function App() {
  const bins = useMQTT(); // real-time MQTT updates

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          sx={{
            marginY: 4,
            padding: 2,
            backgroundColor: "#1976d2",
            color: "white",
            borderRadius: 2,
          }}
        >
          Smart Waste Bin Dashboard
        </Typography>

        {/* Dashboard: Map + Bin Cards */}
        <Dashboard bins={bins} />
      </Container>
    </>
  );
}

export default App;
