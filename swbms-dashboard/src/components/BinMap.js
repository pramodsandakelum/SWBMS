// src/components/BinMap.js
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMQTT } from "../hooks/useMQTT";

const binIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/679/679720.png",
    iconSize: [30, 30],
});

export default function BinMap() {
    const bins = useMQTT("smartbin/data");

    return (
        <MapContainer
            center={[7.8731, 80.7718]} // Sri Lanka center
            zoom={7}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            {bins.map((bin) => (
                <Marker
                    key={bin.id}
                    position={[bin.latitude, bin.longitude]}
                    icon={binIcon}
                >
                    <Popup>
                        <h3>{bin.location_name}</h3>
                        <p><b>Weight:</b> {bin.weight} kg</p>
                        <p><b>Fullness:</b> {bin.fullness}%</p>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
