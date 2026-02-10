import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { TowingBookingStage } from '../context/TowingBookingContext';
import MapSkeletonLoader from './MapSkeletonLoader';


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const FALLBACK_REGION: Region = { latitude: 11.2588, longitude: 75.7804, latitudeDelta: 0.5, longitudeDelta: 0.5 };
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

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
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#ADD8E6" }] },
    {
        featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }]
    }];

// --- INTERFACES ---
export interface PinnedLocationData {
    latitude: number;
    longitude: number;
    description: string;
    place_id?: string;
}

export interface DriverLocation {
    latitude: number;
    longitude: number;
    timestamp?: string;
}

// --- FIX START: Update MapProps to accept the new markers ---
export interface MapProps {
    isPinningLocation: boolean;
    onPinLocationChange: (location: PinnedLocationData) => void;
    onMapReady?: (mapRef: React.RefObject<MapView | null>) => void;
    pickupMarker?: PinnedLocationData | null;
    destinationMarker?: PinnedLocationData | null;
    currentStage?: TowingBookingStage; // UPDATED LINE
    driverLocation?: DriverLocation | null; // Live driver location for Uber-like tracking
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
    ({ coordinate, name, type }: {
        coordinate: { latitude: number, longitude: number },
        name: string, type: 'garage' | 'truck'
    }) => {
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

CustomMapMarker.displayName = 'CustomMapMarker';

// Animated Driver Marker Component (Uber-like)
const DriverMarker = React.memo(({ coordinate }: { coordinate: { latitude: number, longitude: number } }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <Marker coordinate={coordinate} zIndex={100} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.driverMarkerContainer}>
                {/* Pulsing ring */}
                <Animated.View
                    style={[
                        styles.driverPulseRing,
                        { transform: [{ scale: pulseAnim }] }
                    ]}
                />
                {/* Driver icon */}
                <View style={styles.driverMarkerPin}>
                    <Ionicons name="car" size={20} color="#fff" />
                </View>
            </View>
        </Marker>
    );
});
DriverMarker.displayName = 'DriverMarker';

// --- MAIN COMPONENT ---
export default function Map({
    isPinningLocation,
    onPinLocationChange,
    onMapReady,
    pickupMarker,
    destinationMarker,
    currentStage,
    driverLocation  // Live driver location prop
}: MapProps) {
    const { getToken, isSignedIn } = useAuth();
    const mapRef = useRef<MapView>(null);

    const [region, setRegion] = useState<Region | null>(null);
    const [isFetchingProviders, setIsFetchingProviders] = useState(true);
    const [garages, setGarages] = useState<any[]>([]);
    const [towTrucks, setTowTrucks] = useState<any[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isProgrammaticChange, setIsProgrammaticChange] = useState(false);
    const [loadingStage, setLoadingStage] = useState<'permissions' | 'location' | 'map' | 'providers'>('permissions');

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

    const handleLocationSelect = (data: any, details: any = null) => {
        console.log('🔍 [Map.tsx] Google Places Autocomplete - Location selected');
        console.log('Data:', data);
        console.log('Details:', details);

        setSearchError(null);

        // Clear any existing errors
        if (searchError) {
            setSearchError(null);
        }

        // Check if we have location details
        if (details?.geometry?.location) {
            const { lat, lng } = details.geometry.location;
            console.log(`📍 [Map.tsx] Animating to coordinates: ${lat}, ${lng}`);

            // Set programmatic change flag to prevent conflicts
            setIsProgrammaticChange(true);

            // Create the new region
            const newRegion = {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.01,
            };

            // Update region state immediately
            setRegion(newRegion);

            // Animate map to the selected location
            mapRef.current?.animateToRegion(newRegion, 1000);

            // If in pinning mode, update the pin location
            if (isPinningLocation) {
                debouncedGetAddress(lat, lng);
            } else {
                // If in discovery mode, fetch providers for new location
                fetchProvidersForRegion(newRegion);
            }

        } else if (data?.description) {
            // Fallback: try to geocode the description
            console.log(`🔄 [Map.tsx] No coordinates found, attempting to geocode: ${data.description}`);
            geocodeAndNavigate(data.description);
        } else {
            console.warn('⚠️ [Map.tsx] No location data found in search result');
            setSearchError('Location not found');
        }
    };

    const geocodeAndNavigate = async (address: string) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
            );
            const json = await response.json();

            if (json.results && json.results.length > 0) {
                const { lat, lng } = json.results[0].geometry.location;
                console.log(`📍 [Map.tsx] Geocoded coordinates: ${lat}, ${lng}`);

                setIsProgrammaticChange(true);

                const newRegion = {
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.01,
                };

                setRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 1000);

                if (isPinningLocation) {
                    debouncedGetAddress(lat, lng);
                } else {
                    fetchProvidersForRegion(newRegion);
                }
            } else {
                setSearchError('Location not found');
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
            setSearchError('Failed to find location');
        }
    };

    useEffect(() => {
        const initializeMap = async () => {
            try {
                setLoadingStage('permissions');
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') throw new Error('Location permission denied.');

                setLoadingStage('location');
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const initialRegion = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.025 };

                setLoadingStage('map');
                setRegion(initialRegion);

                setLoadingStage('providers');
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
    }, []);

    // Auto-fit camera to show driver and pickup when driver location updates
    useEffect(() => {
        if (driverLocation && pickupMarker && mapRef.current &&
            (currentStage === TowingBookingStage.CONFIRMED || currentStage === TowingBookingStage.PAYMENT)) {
            const coordinates = [
                { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
                { latitude: pickupMarker.latitude, longitude: pickupMarker.longitude },
            ];

            // Only add destination if it exists
            if (destinationMarker) {
                coordinates.push({ latitude: destinationMarker.latitude, longitude: destinationMarker.longitude });
            }

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
                animated: true,
            });
        }
    }, [driverLocation, pickupMarker, destinationMarker, currentStage]);

    const handleRegionChangeComplete = (newRegion: Region) => {
        setRegion(newRegion);
        if (isPinningLocation) {
            debouncedGetAddress(newRegion.latitude, newRegion.longitude);
        } else {
            fetchProvidersForRegion(newRegion);
        }
    };

    const recenterMap = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Location permission not granted');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };

            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);
        } catch (error) {
            console.error('Error recentering map:', error);
        }
    };

    if (!region) {
        return <MapSkeletonLoader stage={loadingStage} />;
    }

    return (
        <View style={styles.container}>
            {GOOGLE_API_KEY && GOOGLE_API_KEY.length > 20 && (
                <GooglePlacesAutocomplete
                    placeholder="Search for a place"
                    fetchDetails={true}
                    enablePoweredByContainer={false}
                    minLength={2}
                    debounce={300}
                    timeout={20000}
                    enableHighAccuracyLocation={true}
                    // Main search handler
                    onPress={handleLocationSelect}

                    // Error handlers
                    onFail={(error) => {
                        console.error('🔴 [Map.tsx] Google Places Autocomplete error:', error);
                        setSearchError('Search temporarily unavailable');
                    }}
                    onTimeout={() => {
                        console.log('⏰ [Map.tsx] Google Places request timed out');
                        setSearchError('Search timed out, please try again');
                    }}
                    onNotFound={() => {
                        console.log('🔍 [Map.tsx] No results found');
                        setSearchError('No results found');
                    }}

                    // Search configuration
                    query={{
                        key: GOOGLE_API_KEY,
                        language: 'en',
                        components: 'country:in',
                        // types: '(cities)', // Focus on cities, establishments, and geocoding
                        fields: 'formatted_address,geometry,name,place_id'
                    }}

                    // Enhanced request configuration
                    requestUrl={{
                        url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
                        useOnPlatform: 'web'
                    }}

                    styles={{
                        container: styles.searchContainer,
                        textInput: styles.searchInput,
                        listView: styles.searchResults,
                        row: styles.searchResultRow,
                        description: styles.searchResultText,
                    }}

                    textInputProps={{
                        placeholderTextColor: '#999',
                        returnKeyType: 'search',
                        clearButtonMode: 'while-editing',
                        autoCapitalize: 'words',
                        autoCorrect: false
                    }}

                    // Enhanced search options
                    predefinedPlaces={[]}
                    currentLocation={false}
                    nearbyPlacesAPI="GooglePlacesSearch"
                    GooglePlacesSearchQuery={{
                        rankby: 'distance',
                    }}
                    GooglePlacesDetailsQuery={{
                        fields: 'formatted_address,geometry,name,place_id'
                    }}

                    // Additional props for better functionality
                    suppressDefaultStyles={false}
                    keyboardShouldPersistTaps="handled"
                    listEmptyComponent={() => (
                        <View style={styles.noResults}>
                            <Text style={styles.noResultsText}>No results found</Text>
                        </View>
                    )}
                />
            )}
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
                {garages.map((g, index) => g.location?.coordinates && <CustomMapMarker key={`g-${g._id}-${index}`} coordinate={{ latitude: g.location.coordinates[1], longitude: g.location.coordinates[0] }} name={g.name} type="garage" />)}
                {towTrucks.map((t, index) => t.location?.coordinates && <CustomMapMarker key={`t-${t._id}-${index}`} coordinate={{ latitude: t.location.coordinates[1], longitude: t.location.coordinates[0] }} name={t.name} type="truck" />)}

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

                {/* --- Live Driver Marker (Uber-like tracking) --- */}
                {driverLocation && (currentStage === TowingBookingStage.CONFIRMED || currentStage === TowingBookingStage.PAYMENT) && (
                    <DriverMarker
                        coordinate={{
                            latitude: driverLocation.latitude,
                            longitude: driverLocation.longitude
                        }}
                    />
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
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2,
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
    searchContainer: {
        position: 'absolute',
        top: 20,
        left: 10,
        right: 10,
        zIndex: 1,
    },
    searchInput: {
        height: 44,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchResults: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        maxHeight: 200,
    },
    searchResultRow: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchResultText: {
        fontSize: 16,
        color: '#333',
    },
    noResults: {
        padding: 20,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
    },
    searchError: {
        position: 'absolute',
        top: 90,
        left: 10,
        right: 10,
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        zIndex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchErrorText: {
        color: '#c62828',
        flex: 1,
        fontSize: 14,
    },
    // Live Driver Marker Styles (Uber-like)
    driverMarkerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    driverPulseRing: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(41, 128, 185, 0.2)',
        borderWidth: 2,
        borderColor: 'rgba(41, 128, 185, 0.4)',
    },
    driverMarkerPin: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2980b9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
});
