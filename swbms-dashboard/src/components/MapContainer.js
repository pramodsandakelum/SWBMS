import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMQTT } from "../hooks/useMQTT";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BinMap = () => {
    const messages = useMQTT();

    return (
        <MapContainer center={[7.08, 80.035]} zoom={14} style={{ height: "80vh", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {messages.map((bin) => (
                <Marker
                    key={bin.id}
                    position={[bin.latitude, bin.longitude]}
                    // color red if fullness >= 75
                    icon={
                        new L.Icon({
                            iconUrl:
                                bin.fullness >= 75
                                    ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                                    : "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41],
                        })
                    }
                >
                    <Popup>
                        <b>{bin.location_name}</b> <br />
                        Weight: {bin.weight} kg <br />
                        Fullness: {bin.fullness}%
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default BinMap;
