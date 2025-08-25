import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../../hooks/useAppContext';
import { Landmark } from '../../types';
import PinMyLocationButton from './PinMyLocationButton';
import CenterMapButton from './CenterMapButton';
import { getColorForUser } from '../../constants';

// SVG strings for icons, as React components cannot be directly used in Leaflet's L.divIcon
const pinSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-3.036 0-5.5 2.464-5.5 5.5 0 1.901.978 3.593 2.479 4.592L12 21.75l3.021-9.408A5.505 5.505 0 0017.5 7.75c0-3.036-2.464-5.5-5.5-5.5zM12 10a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" /></svg>`;

const createLandmarkIcon = (color: string) => {
    return L.divIcon({
        html: `<div style="background-color: ${color};" class="p-1 rounded-full shadow-lg transform transition-transform hover:scale-110">
            <div class="w-5 h-5 text-white">${pinSVG}</div>
        </div>`,
        className: 'bg-transparent border-0', // important to avoid default leaflet styles
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });
};

const MapEventsHandler = () => {
    const { currentUser, setShowAddLandmarkModal, setNewLandmarkCoords, setIsFollowingUser } = useAppContext();

    useMapEvents({
        click(e) {
            if (currentUser) {
                // Let leaflet handle its own event propagation
                if (e.originalEvent.defaultPrevented) return;
                setNewLandmarkCoords({ x: e.latlng.lng, y: e.latlng.lat });
                setShowAddLandmarkModal(true);
            }
        },
        dragstart() {
            setIsFollowingUser(false);
        }
    });
    return null;
};

const RecenterAutomatically = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    const { isFollowingUser } = useAppContext();
    useEffect(() => {
        if (isFollowingUser) {
            // Using flyTo for a smoother transition
            map.flyTo([lat, lng], map.getZoom());
        }
    }, [lat, lng, map, isFollowingUser]);
    return null;
};

// This component ensures the map recalculates its size when the container changes.
const MapResize = () => {
    const map = useMap();
    useEffect(() => {
        // A slight delay is sometimes needed for the container to report its final size.
        const timer = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};


const MapDisplay: React.FC = () => {
    const { landmarks, setSelectedLandmark, currentUserLocation } = useAppContext();
    
    const visibleLandmarks = landmarks.filter(lm => !lm.expiresAt || lm.expiresAt > Date.now());

    const defaultPosition: [number, number] = [40.7128, -74.0060]; // Default to NYC
    const userPosition: [number, number] | null = currentUserLocation ? [currentUserLocation.y, currentUserLocation.x] : null;

    return (
        <MapContainer
            center={userPosition || defaultPosition}
            zoom={userPosition ? 13 : 5}
            scrollWheelZoom={true}
            className="w-full h-full"
        >
            <MapResize />
            {userPosition && <RecenterAutomatically lat={userPosition[0]} lng={userPosition[1]} />}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEventsHandler />

            {visibleLandmarks.map(landmark => (
                <Marker
                    key={landmark.id}
                    position={[landmark.latitude, landmark.longitude]}
                    icon={createLandmarkIcon(getColorForUser(landmark.addedByUserId))}
                    eventHandlers={{
                        click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            setSelectedLandmark(landmark);
                        },
                    }}
                >
                </Marker>
            ))}
            <PinMyLocationButton />
            <CenterMapButton />
        </MapContainer>
    );
};

export default MapDisplay;