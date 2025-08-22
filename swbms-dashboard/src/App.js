import React from "react";
import { useMQTT } from "./hooks/useMQTT";
import Dashboard from "./components/Dashboard";

function App() {
  const bins = useMQTT();

  return (
    <div>
      <h1 className="text-2xl font-bold text-center p-4 bg-green-600 text-white">
        Smart Waste Bin Dashboard
      </h1>
      <Dashboard bins={bins} />
    </div>
  );
}

export default App;
