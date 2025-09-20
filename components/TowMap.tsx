    import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'; // Import Polyline
import RotatingLoader from './RotatingLoader';


    // --- CONFIGURATION & CONSTANTS ---
    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    const FALLBACK_REGION: Region = { latitude: 11.2588, longitude: 75.7804, latitudeDelta: 0.5, longitudeDelta: 0.5 };
    const MAP_STYLE = [ 
        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] }, 
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] }, 
        { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, 
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] }, 
        { featureType: "administrative.land_parcel", elementType: "labels", stylers: [{ visibility: "off" }] }, 
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
        { featureType: "poi", elementType: "labels.text", stylers: [{ visibility: "off" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, 
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }, 
        { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, 
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] }, 
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, 
        { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "off" }] }, 
        { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, 
        { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, 
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }, 
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] 
    }];

import { TowingBookingStage } from '../context/TowingBookingContext';

    // --- INTERFACES ---
    export interface PinnedLocationData {
        latitude: number;
        longitude: number;
        description: string;
        place_id?: string;
    }

    // --- FIX START: Update MapProps to accept the new markers ---
    export interface MapProps {
        isPinningLocation: boolean;
        onPinLocationChange: (location: PinnedLocationData) => void;
        onMapReady?: (mapRef: React.RefObject<MapView | null>) => void;
        pickupMarker?: PinnedLocationData | null;
        destinationMarker?: PinnedLocationData | null;
        currentStage?: TowingBookingStage; // UPDATED LINE
    }
    // --- FIX END ---

    // --- HELPER FUNCTIONS ---
    const getAddressFromCoords = async (latitude: number, longitude: number): Promise<string> => {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`);
            const json = await response.json();
            return json.results?.[0]?.formatted_address || "Unknown Location";
        } catch (error) { console.error("Geocoding Error:", error); return "Could not fetch address"; }
    };

    const fetchNearbyData = async (url: string, token: string) => {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
        return response.json();
    };

    // --- CHILD COMPONENTS ---
    const CustomMapMarker = React.memo(
        ({ coordinate, name, type }: { coordinate: {latitude: number, longitude: number},
            name: string, type: 'garage' | 'truck' }) => {
        const iconName = type === 'garage' ? 'build' : 'car-sport'; // Changed truck icon for clarity
        const markerColor = type === 'garage' ? '#b95528' : '#2980b9';

        return (
            <Marker coordinate={coordinate}>
                <View style={styles.markerContainer}>
                    <View style={[styles.markerPin, { backgroundColor: markerColor }]}><Ionicons name={iconName} size={16} color="white" /></View>
                </View>
            </Marker>
        );
    });


    // --- MAIN COMPONENT ---
    export default function Map({
        isPinningLocation,
        onPinLocationChange,
        onMapReady,
        pickupMarker,
        destinationMarker,
        currentStage   // ADD THIS LINE
    }: MapProps) {
        const { getToken, isSignedIn } = useAuth();
        const mapRef = useRef<MapView>(null);
        
        const [region, setRegion] = useState<Region | null>(null);
        const [isFetchingProviders, setIsFetchingProviders] = useState(true);
        const [garages, setGarages] = useState<any[]>([]);
        const [towTrucks, setTowTrucks] = useState<any[]>([]);

        const debouncedGetAddress = useCallback(debounce(async (lat: number, lon: number) => {
            const address = await getAddressFromCoords(lat, lon);
            onPinLocationChange({ latitude: lat, longitude: lon, description: address });
        }, 500), [onPinLocationChange]);

        const fetchProvidersForRegion = useCallback(debounce(async (currentRegion: Region) => {
            if (!isSignedIn || !currentRegion) return;
            setIsFetchingProviders(true);
            try {
                const token = await getToken();
                if (!token) return;
                
                const lat = currentRegion.latitude;
                const lon = currentRegion.longitude;

                const [garagesData, towTrucksData] = await Promise.all([
                    fetchNearbyData(`${API_BASE_URL}/api/garages/nearby?lat=${lat}&lon=${lon}`, token),
                    fetchNearbyData(`${API_BASE_URL}/api/tow-trucks/nearby?lat=${lat}&lon=${lon}&vehicleType=BIKE`, token),
                ]);
                
                setGarages(Array.isArray(garagesData) ? garagesData : []);
                setTowTrucks(Array.isArray(towTrucksData) ? towTrucksData : []);
            } catch (error) {
                console.error("Failed to fetch nearby providers:", error);
            } finally {
                setIsFetchingProviders(false);
            }
        }, 1000), [isSignedIn]);

        useEffect(() => {
            const initializeMap = async () => {
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') throw new Error('Location permission denied.');
                    const location = await Location.getCurrentPositionAsync({});
                    const initialRegion = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.025 };
                    setRegion(initialRegion);
                    fetchProvidersForRegion(initialRegion);
                    if (isPinningLocation) {
                        debouncedGetAddress(initialRegion.latitude, initialRegion.longitude);
                    }
                } catch (error: any) {
                    setRegion(FALLBACK_REGION);
                    fetchProvidersForRegion(FALLBACK_REGION);
                } finally {
                if (onMapReady && mapRef.current) {
                        onMapReady(mapRef);
                    }
                }
            };
            initializeMap();
        }, []); // Removed dependencies to prevent re-running on every change

        const handleRegionChangeComplete = (newRegion: Region) => {
            setRegion(newRegion);
            if (isPinningLocation) {
                debouncedGetAddress(newRegion.latitude, newRegion.longitude);
            } else {
                fetchProvidersForRegion(newRegion);
            }
        };
        
        const recenterMap = async () => { /* ... implementation is correct ... */ };
        
        if (!region) {
            return (
                <View style={styles.centered}>
                    <RotatingLoader size={40} color="#b95528" />
                    <Text style={styles.loadingText}>Initializing Map...</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFill}
                initialRegion={region}
                onRegionChangeComplete={handleRegionChangeComplete}
                customMapStyle={MAP_STYLE}
                showsUserLocation={true}
                showsMyLocationButton={false}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={!isPinningLocation}
                rotateEnabled={!isPinningLocation}
            >
                    {/* --- Provider Markers (Existing Logic) --- */}
                    {garages.map((g) => g.location?.coordinates && <CustomMapMarker key={`g-${g._id}`} coordinate={{latitude: g.location.coordinates[1], longitude: g.location.coordinates[0]}} name={g.name} type="garage" /> )}
                    {towTrucks.map(t => t.location?.coordinates && <CustomMapMarker key={`t-${t._id}`} coordinate={{latitude: t.location.coordinates[1], longitude: t.location.coordinates[0]}} name={t.name} type="truck" /> )}
                    
                                        {/* --- Pickup Marker --- */}
                                        {pickupMarker && (currentStage === TowingBookingStage.DESTINATION_SELECTION || currentStage === TowingBookingStage.VEHICLE_SELECTION || currentStage === TowingBookingStage.SEARCHING_FOR_PROVIDER || currentStage === TowingBookingStage.CONFIRMED) && (
                                            <Marker coordinate={pickupMarker} zIndex={10}>
                                                <View style={styles.bookingMarkerContainer}>
                                                <Text style={styles.bookingMarkerText}>P</Text>
                                                <Ionicons name="location-sharp" size={40} color="#27ae60" />
                                                </View>
                                            </Marker>
                                        )}
                                        {/* --- Destination Marker --- */}
                                        {destinationMarker && (currentStage === TowingBookingStage.VEHICLE_SELECTION || currentStage === TowingBookingStage.SEARCHING_FOR_PROVIDER || currentStage === TowingBookingStage.CONFIRMED) && (
                                            <Marker coordinate={destinationMarker} zIndex={10}>
                                                <View style={styles.bookingMarkerContainer}>
                                                <Text style={styles.bookingMarkerText}>D</Text>
                                                <Ionicons name="location-sharp" size={40} color="#c0392b" />
                                                </View>
                                            </Marker>
                                        )}
                                </MapView>
            {isFetchingProviders && !isPinningLocation && (
                <View style={styles.refreshIndicator}>
                    <ActivityIndicator size={20} color="#000" /><Text style={styles.refreshText}>Finding providers...</Text></View>
            )}

            {isPinningLocation && (
                <>
                    <View style={styles.pinContainer} pointerEvents="none">
                        <Ionicons 
                            name="location" 
                            size={48} 
                            color={currentStage === TowingBookingStage.PICKUP_SELECTION ? '#27ae60' : '#c0392b'} // Dynamic color
                        />
                    </View>
                    <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
                        <Ionicons name="locate-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </>
            )}
        </View>

        );
    }

    // --- STYLESHEET ---
    const styles = StyleSheet.create({
        container: { flex: 1 },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
        loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
        recenterButton: {
            position: 'absolute', top: 60, right: 20, backgroundColor: 'white',
            borderRadius: 20, padding: 8, elevation: 5, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 2,
        },
        pinContainer: {
            position: 'absolute', top: '50%', left: '50%',
            marginLeft: -24, // Half of icon size
            marginTop: -48, // Full icon size to have the tip at the center
        },
        // Custom Marker Styles
        markerContainer: { alignItems: 'center' },
        markerPin: { 
            width: 32, height: 32, borderRadius: 16, 
            justifyContent: 'center', alignItems: 'center', 
            borderWidth: 2, borderColor: 'white', 
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4 
        },
        // Booking (P & D) Marker Styles
        bookingMarkerContainer: { alignItems: 'center', justifyContent: 'center', },
        bookingMarkerText: {
            position: 'absolute', top: 6, color: 'white',
            fontWeight: 'bold', fontSize: 14, zIndex: 1,
        },
        // Refresh Indicator
        refreshIndicator: { 
            position: 'absolute', top: 50, alignSelf: 'center', 
            backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 15, 
            paddingVertical: 8, borderRadius: 20, flexDirection: 'row', 
            alignItems: 'center', elevation: 5 
        },
        refreshText: { marginLeft: 8, fontWeight: '500' },
    });