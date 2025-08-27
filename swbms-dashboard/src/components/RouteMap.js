// src/components/RouteMap.js
import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button, Card, CardContent, Typography, Chip } from "@mui/material";
import { LocationOn, LocalShipping } from "@mui/icons-material";

// -------------------
// Fix Leaflet default icon issue
// -------------------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// -------------------
// Custom bin marker based on fullness
// -------------------
const createCustomIcon = (fullness) => {
    const getColor = (f) => {
        if (f >= 80) return "#EF4444"; // Red
        if (f >= 50) return "#F59E0B"; // Amber
        return "#3ECF8E"; // Emerald
    };
    return L.divIcon({
        html: `<div style="
        background-color: ${getColor(fullness)};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #F8FAFC;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:bold;
        font-size:10px;
    ">${Math.round(fullness)}%</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
};

// -------------------
// Custom truck marker icon
// -------------------
const truckIcon = L.divIcon({
    html: `<div style="
      background-color: #3ECF8E;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      font-weight:bold;
      font-size:12px;
  "><svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="16" height="16">
      <path d="M3 3h18v14H3z" fill="none"/>
      <path d="M3 3h18v14H3V3zm4 11c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm10 0c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
  </svg></div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const RouteMap = ({ bins }) => {
    const mapRef = useRef();
    const [route, setRoute] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0);
    const truckStart = [7.094028, 79.997123];

    const handleGenerateRoute = async () => {
        try {
            const res = await fetch(
                "https://swbms-route-generator.onrender.com/generate_route",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        truck_start: truckStart,
                        bins: bins.map((b) => ({
                            id: b.id,
                            latitude: b.latitude,
                            longitude: b.longitude,
                            fullness: b.fullness,
                        })),
                    }),
                }
            );
            const data = await res.json();
            setRoute(data.route);
            setTotalDistance(data.total_distance_km);

            if (mapRef.current && data.route.length > 0) {
                const bounds = data.route.map((b) => [b.latitude, b.longitude]);
                bounds.push(truckStart);
                mapRef.current.fitBounds(bounds, { padding: [40, 40] });
            }
        } catch (err) {
            console.error("Failed to generate route", err);
        }
    };

    return (
        <Card className="bg-slate-900/80 border border-slate-700 rounded-lg shadow-2xl">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6" className="text-slate-50 font-semibold">
                        Bin Map & Route
                    </Typography>
                    <Button variant="contained" onClick={handleGenerateRoute}>
                        Generate Route
                    </Button>
                </div>

                <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-700 shadow-inner bg-slate-900/50 backdrop-blur-sm">
                    <MapContainer
                        center={truckStart}
                        zoom={14}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                        whenCreated={(mapInstance) => {
                            mapRef.current = mapInstance;
                        }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        {/* Truck Start */}
                        <Marker position={truckStart} icon={truckIcon}>
                            <Popup>
                                <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 shadow-md">
                                    <div className="flex items-center space-x-2">
                                        <LocalShipping className="text-emerald-400 text-base" />
                                        <span className="text-slate-50 font-semibold">Truck Start</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Bins */}
                        {bins.map((bin) => (
                            <Marker
                                key={bin.id}
                                position={[bin.latitude, bin.longitude]}
                                icon={createCustomIcon(bin.fullness)}
                            >
                                <Popup>
                                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 shadow-md space-y-2 min-w-[220px]">
                                        <div className="flex items-center space-x-2">
                                            <LocationOn className="text-emerald-400 text-base" />
                                            <span className="text-slate-50 font-semibold">{bin.location_name}</span>
                                        </div>
                                        <Chip
                                            label={`Fullness: ${bin.fullness}%`}
                                            size="small"
                                            className={`bg-slate-800/50 text-emerald-400 border border-slate-700 text-xs font-medium`}
                                        />
                                        <div className="text-slate-300 text-sm">Weight: {bin.weight} kg</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Route Polyline */}
                        {route.length > 0 && (
                            <Polyline
                                positions={[truckStart, ...route.map((r) => [r.latitude, r.longitude])]}
                                color="#3ECF8E"
                                weight={5}
                            />
                        )}
                    </MapContainer>
                </div>

                {route.length > 0 && (
                    <div className="mt-2 text-slate-300">
                        Total Route Distance:{" "}
                        <span className="font-semibold text-emerald-400">{totalDistance} km</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RouteMap;
