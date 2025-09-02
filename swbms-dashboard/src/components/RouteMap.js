import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button, Card, CardContent, Typography, Chip } from "@mui/material";
import { LocationOn, LocalShipping } from "@mui/icons-material";


// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});


// Custom bin marker based on fullness
const createCustomIcon = (fullness) => {
    const getColor = (f) => {
        if (f >= 80) return "#EF4444";
        if (f >= 50) return "#F59E0B";
        return "#3ECF8E";
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


// Custom depot marker icon
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
    const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjBjYjkyNWQzMzZjNDQ2OThhMTk0NTQ2YjNjNWRhZjgxIiwiaCI6Im11cm11cjY0In0=";



    // Fetch route from OpenRouteService
    const fetchORSRoute = async (start, end) => {
        const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": ORS_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    coordinates: [
                        [start[1], start[0]],
                        [end[1], end[0]]
                    ]
                })
            });
            const data = await res.json();
            return data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        } catch (err) {
            console.error("ORS route fetch failed", err);
            return [start, end];
        }
    };

    const handleGenerateRoute = async () => {
        try {
            // Filter bins >=75% fullness
            const binsToVisit = bins.filter(b => b.fullness >= 75);

            if (!binsToVisit.length) {
                setRoute([]);
                setTotalDistance(0);
                return;
            }

            let currentPos = truckStart;
            const fullRoute = [];
            let distanceSum = 0;

            for (let b of binsToVisit) {
                // Get ORS route for each segment
                const segment = await fetchORSRoute(currentPos, [b.latitude, b.longitude]);
                fullRoute.push(...segment);

                // calculate simple distance sum (straight-line)
                const dx = currentPos[0] - b.latitude;
                const dy = currentPos[1] - b.longitude;
                distanceSum += Math.sqrt(dx * dx + dy * dy) * 111;

                currentPos = [b.latitude, b.longitude];
            }

            setRoute(fullRoute);
            setTotalDistance(distanceSum.toFixed(2));

            if (mapRef.current && fullRoute.length > 0) {
                mapRef.current.fitBounds(fullRoute, { padding: [40, 40] });
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
                        whenCreated={map => mapRef.current = map}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        {/* Depot Start */}
                        <Marker position={truckStart} icon={truckIcon}>
                            <Popup>Depot</Popup>
                        </Marker>

                        {/* Bins */}
                        {bins.map(b => (
                            <Marker
                                key={b.id}
                                position={[b.latitude, b.longitude]}
                                icon={createCustomIcon(b.fullness)}
                            >
                                <Popup>
                                    <div>
                                        <strong>{b.location_name}</strong><br />
                                        Fullness: {b.fullness}%<br />
                                        Weight: {b.weight} kg
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Route */}
                        {route.length > 0 && (
                            <Polyline positions={route} color="#ee0808ff" weight={5} />
                        )}
                    </MapContainer>
                </div>

                {route.length > 0 && (
                    <div className="mt-2 text-slate-300">
                        Total Route Distance: <span className="font-semibold text-emerald-400">{totalDistance} km</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RouteMap;
