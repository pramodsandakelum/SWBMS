import React from "react";
import { Container, Typography } from "@mui/material";
import BinMap from "./components/MapContainer";

function App() {
  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        SWBMS Live Bin Map
      </Typography>
      <BinMap />
    </Container>
  );
}

export default App;
