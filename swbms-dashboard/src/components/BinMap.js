// src/components/BinMap.js
import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Snackbar, Alert, Box, Typography } from "@mui/material";

import { useMQTT } from "../hooks/useMQTT";

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BinMap = () => {
    const bins = useMQTT();
    const [alertBin, setAlertBin] = useState(null);

    // Calculate map center and bounds based on bin locations
    const mapConfig = useMemo(() => {
        if (!bins || bins.length === 0) {
            return {
                center: [7.08, 80.035], // Default Sri Lanka coordinates
                zoom: 14,
                bounds: null
            };
        }

        // Calculate center point from all bins
        const validBins = bins.filter(bin =>
            bin.latitude && bin.longitude &&
            !isNaN(bin.latitude) && !isNaN(bin.longitude)
        );

        if (validBins.length === 0) {
            return {
                center: [7.08, 80.035],
                zoom: 14,
                bounds: null
            };
        }

        if (validBins.length === 1) {
            return {
                center: [validBins[0].latitude, validBins[0].longitude],
                zoom: 16,
                bounds: null
            };
        }

        // Calculate bounds for multiple bins
        const lats = validBins.map(bin => bin.latitude);
        const lngs = validBins.map(bin => bin.longitude);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Add padding to bounds (10% of the range)
        const latPadding = (maxLat - minLat) * 0.1;
        const lngPadding = (maxLng - minLng) * 0.1;

        const bounds = [
            [minLat - latPadding, minLng - lngPadding],
            [maxLat + latPadding, maxLng + lngPadding]
        ];

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        return {
            center: [centerLat, centerLng],
            zoom: 14,
            bounds: bounds
        };
    }, [bins]);

    // Create custom icons with better styling
    const createCustomIcon = (fullness) => {
        let iconColor = 'blue';
        let iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";

        if (fullness >= 75) {
            iconColor = 'red';
            iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
        } else if (fullness >= 50) {
            iconColor = 'orange';
            iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png";
        } else if (fullness >= 25) {
            iconColor = 'yellow';
            iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png";
        } else {
            iconColor = 'green';
            iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";
        }

        return new L.Icon({
            iconUrl: iconUrl,
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });
    };

    // Show alert when a bin reaches >=75% fullness
    useEffect(() => {
        const fullBin = bins.find((b) => b.fullness >= 75);
        if (fullBin && (!alertBin || alertBin.id !== fullBin.id)) {
            setAlertBin(fullBin);
        }
    }, [bins, alertBin]);

    const handleClose = () => setAlertBin(null);

    // Custom popup content
    const getPopupContent = (bin) => {
        const getStatusColor = (fullness) => {
            if (fullness >= 75) return '#ef4444';
            if (fullness >= 50) return '#f59e0b';
            if (fullness >= 25) return '#eab308';
            return '#10b981';
        };

        const getStatusText = (fullness) => {
            if (fullness >= 75) return 'Full';
            if (fullness >= 50) return 'Half Full';
            if (fullness >= 25) return 'Partial';
            return 'Empty';
        };

        return (
            <div style={{ minWidth: '200px', padding: '8px' }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#1f2937'
                }}>
                    📍 {bin.location_name}
                </div>

                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    <strong>Weight:</strong> {bin.weight} kg
                </div>

                <div style={{
                    fontSize: '12px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <strong>Fullness:</strong>
                    <span style={{
                        color: getStatusColor(bin.fullness),
                        fontWeight: 'bold'
                    }}>
                        {bin.fullness}%
                    </span>
                    <span style={{
                        backgroundColor: getStatusColor(bin.fullness),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }}>
                        {getStatusText(bin.fullness)}
                    </span>
                </div>

                <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                    ID: {bin.id}
                </div>
            </div>
        );
    };

    if (!bins || bins.length === 0) {
        return (
            <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                backgroundColor: '#f8fafc',
                borderRadius: 2
            }}>
                <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                    🗺️ Loading Map...
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Waiting for bin data
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', position: 'relative' }}>
            <MapContainer
                center={mapConfig.center}
                zoom={mapConfig.zoom}
                bounds={mapConfig.bounds}
                style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                dragging={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {bins
                    .filter(bin => bin.latitude && bin.longitude)
                    .map((bin) => (
                        <Marker
                            key={bin.id}
                            position={[bin.latitude, bin.longitude]}
                            icon={createCustomIcon(bin.fullness)}
                        >
                            <Popup>
                                <div dangerouslySetInnerHTML={{
                                    __html: getPopupContent(bin)
                                }} />
                            </Popup>
                        </Marker>
                    ))}
            </MapContainer>

            {/* Enhanced Snackbar alert */}
            <Snackbar
                open={!!alertBin}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {alertBin && (
                    <Alert
                        onClose={handleClose}
                        severity="error"
                        variant="filled"
                        sx={{
                            width: "100%",
                            '& .MuiAlert-message': {
                                fontSize: '14px'
                            }
                        }}
                    >
                        <strong>🚨 Alert!</strong><br />
                        Bin "{alertBin.location_name}" is {alertBin.fullness}% full!
                    </Alert>
                )}
            </Snackbar>
        </Box>
    );
};

export default BinMap;