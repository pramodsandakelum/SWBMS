import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, Chip } from "@mui/material";
import { LocationOn, Delete, Scale, Visibility } from "@mui/icons-material";
import L from "leaflet";

// Fix default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom bin status icons based on fullness - matching app theme
const createCustomIcon = (fullness) => {
    const getColor = (fullness) => {
        if (fullness >= 80) return '#EF4444';
        if (fullness >= 50) return '#F59E0B';
        return '#3ECF8E';
    };

    return L.divIcon({
        html: `
            <div style="
                background-color: ${getColor(fullness)};
                width: 28px;
                height: 32px;
                border-radius: 4px 4px 2px 2px;
                border: 2px solid #F8FAFC;
                box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                font-family: 'Inter', sans-serif;
            ">
                <div style="
                    width: 20px;
                    height: 20px;
                    background-color: rgba(255,255,255,0.2);
                    border-radius: 2px 2px 1px 1px;
                    margin-bottom: 2px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        width: 14px;
                        height: 14px;
                        background-color: rgba(255,255,255,0.3);
                        border-radius: 1px;
                        position: relative;
                    ">
                        <div style="
                            position: absolute;
                            top: 2px;
                            left: 2px;
                            right: 2px;
                            height: ${Math.max(2, (fullness / 100) * 10)}px;
                            background-color: rgba(255,255,255,0.8);
                            border-radius: 1px;
                        "></div>
                    </div>
                </div>
                <div style="
                    font-size: 8px;
                    color: white;
                    font-weight: 600;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                ">
                    ${Math.round(fullness)}%
                </div>
                <div style="
                    position: absolute;
                    bottom: -4px;
                    width: 16px;
                    height: 4px;
                    background-color: ${getColor(fullness)};
                    border-radius: 2px;
                    opacity: 0.8;
                "></div>
            </div>
        `,
        className: 'custom-bin-marker',
        iconSize: [32, 36],
        iconAnchor: [16, 36],
    });
};

const getStatusColor = (fullness) => {
    if (fullness >= 80) return {
        bg: 'bg-red-900/20',
        text: 'text-red-400',
        border: 'border-red-700/50',
        chip: 'bg-red-900/30 text-red-300 border-red-700/40'
    };
    if (fullness >= 50) return {
        bg: 'bg-amber-900/20',
        text: 'text-amber-400',
        border: 'border-amber-700/50',
        chip: 'bg-amber-900/30 text-amber-300 border-amber-700/40'
    };
    return {
        bg: 'bg-emerald-900/20',
        text: 'text-emerald-400',
        border: 'border-emerald-700/50',
        chip: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40'
    };
};

const getStatusText = (fullness) => {
    if (fullness >= 80) return 'Critical';
    if (fullness >= 50) return 'Moderate';
    return 'Low';
};

const BinMap = ({ bins }) => {
    // Filter bins with valid coordinates
    const validBins = bins.filter(
        (bin) =>
            bin.latitude !== undefined &&
            bin.longitude !== undefined &&
            !isNaN(bin.latitude) &&
            !isNaN(bin.longitude)
    );

    // Calculate map center and bounds based on bin locations
    const getMapCenter = () => {
        if (validBins.length === 0) {
            return [7.086789, 80.038834];
        }

        const latSum = validBins.reduce((sum, bin) => sum + bin.latitude, 0);
        const lngSum = validBins.reduce((sum, bin) => sum + bin.longitude, 0);

        return [latSum / validBins.length, lngSum / validBins.length];
    };

    // Calculate appropriate zoom level based on bin spread
    const getMapZoom = () => {
        if (validBins.length <= 1) return 15;

        const lats = validBins.map(bin => bin.latitude);
        const lngs = validBins.map(bin => bin.longitude);

        const latRange = Math.max(...lats) - Math.min(...lats);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        const maxRange = Math.max(latRange, lngRange);

        if (maxRange > 0.1) return 10;
        if (maxRange > 0.05) return 12;
        if (maxRange > 0.02) return 13;
        if (maxRange > 0.01) return 14;
        return 15;
    };

    // Calculate statistics
    const criticalBins = validBins.filter(bin => bin.fullness >= 80).length;
    const moderateBins = validBins.filter(bin => bin.fullness >= 50 && bin.fullness < 80).length;
    const lowBins = validBins.filter(bin => bin.fullness < 50).length;

    return (
        <Card className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/30 rounded-lg shadow-2xl">
            <CardContent className="p-0">
                <div className="bg-slate-900/50 backdrop-blur-sm px-6 py-4 border-b border-slate-700/30">
                    <div className="flex justify-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span className="text-slate-400 text-sm font-medium">Critical: </span>
                            <span className="text-red-400 font-semibold">{criticalBins}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-slate-400 text-sm font-medium">Moderate: </span>
                            <span className="text-amber-400 font-semibold">{moderateBins}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span className="text-slate-400 text-sm font-medium">Low: </span>
                            <span className="text-emerald-400 font-semibold">{lowBins}</span>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="p-6">
                    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-700/30 shadow-inner">
                        <MapContainer
                            center={[7.083, 80.033]}
                            zoom={14}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            touchZoom={false}
                            boxZoom={false}
                            keyboard={false}
                            dragging={true}
                            zoomControl={false}
                            attributionControl={false}
                            style={{ height: "100%", width: "100%" }}
                            className="rounded-lg"
                            whenCreated={(mapInstance) => {
                                mapInstance.scrollWheelZoom.disable();
                                mapInstance.doubleClickZoom.disable();
                                mapInstance.touchZoom.disable();
                                mapInstance.boxZoom.disable();
                                mapInstance.keyboard.disable();
                                const focusedBounds = [
                                    [7.068, 80.020],
                                    [7.098, 80.046]
                                ];

                                setTimeout(() => {
                                    mapInstance.fitBounds(focusedBounds, {
                                        padding: [30, 30]
                                    });
                                }, 100);
                            }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />

                            {validBins.map((bin) => (
                                <Marker
                                    key={bin.id}
                                    position={[bin.latitude, bin.longitude]}
                                    icon={createCustomIcon(bin.fullness)}
                                >
                                    <Popup className="custom-popup">
                                        <div className="min-w-[220px] p-3 bg-slate-900 rounded-lg border border-slate-700">
                                            {/* Location Header */}
                                            <div className="flex items-center space-x-2 mb-3">
                                                <LocationOn className="text-emerald-400 text-lg" />
                                                <h3 className="font-semibold text-slate-50 text-base">
                                                    {bin.location_name}
                                                </h3>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="mb-3">
                                                <Chip
                                                    label={`${getStatusText(bin.fullness)} - ${bin.fullness}%`}
                                                    size="small"
                                                    className={`${getStatusColor(bin.fullness).chip} border font-medium text-xs`}
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Delete className="text-slate-400 text-sm" />
                                                        <span className="text-slate-400 text-sm font-medium">Fullness</span>
                                                    </div>
                                                    <span className="font-semibold text-slate-50">
                                                        {bin.fullness}%
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Scale className="text-slate-400 text-sm" />
                                                        <span className="text-slate-400 text-sm font-medium">Weight</span>
                                                    </div>
                                                    <span className="font-semibold text-slate-50">
                                                        {bin.weight} kg
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-3">
                                                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all duration-500 ${bin.fullness >= 80 ? 'bg-red-400' :
                                                            bin.fullness >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                                                            }`}
                                                        style={{ width: `${bin.fullness}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>

                    {/* Footer*/}
                    <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
                        <div className="font-medium">
                            Last updated: {new Date().toLocaleTimeString()}
                        </div>
                        <div className="font-medium">
                            Coordinates: 7.086789°N, 80.038834°E
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BinMap;