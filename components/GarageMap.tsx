// components/Map.tsx
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
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
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] }, 
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, 
    { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "off" }] }, 
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, 
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, 
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#ADD8E6" }] }, 
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#a0c8ff" }] }
];

// --- INTERFACES ---
export interface PinnedLocationData {
    latitude: number;
    longitude: number;
    description: string;
    place_id?: string;
}
interface MapProps {
    isPinningLocation: boolean;
    onPinLocationChange: (location: PinnedLocationData) => void;
    onMapReady?: (mapRef: React.RefObject<MapView | null>) => void;
    providerType?: 'garage' | 'tow-truck' | 'ev' | 'all';
    filters?: {
        category?: string | null;
        services?: string[];
    };
}

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

const fetchNearbyEVStations = async (lat: number, lon: number) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=25000&keyword=ev%20charging%20station&key=${GOOGLE_API_KEY}`;
        console.log("[Map.tsx] Fetching EV Stations from URL:", url);
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("[Map.tsx] Google Places API Error:", response.status, errorBody);
            throw new Error('Failed to fetch EV stations from Google Places API');
        }
        const data = await response.json();
        console.log(`[Map.tsx] Google Places API found ${data.results?.length || 0} EV stations with status: ${data.status}`);
        if (data.status === 'ZERO_RESULTS') {
            console.log('[Map.tsx] Note: Google Places returned ZERO_RESULTS. This means the search worked but found nothing in the area.');
        } else if (data.status !== 'OK') {
            console.warn(`[Map.tsx] Google Places API returned status: ${data.status}. This may indicate an issue with the API key or request.`);
        }
        return data.results || [];
    } catch (error) {
        console.error("Failed to fetch EV stations:", error);
        return [];
    }
};


// --- CHILD COMPONENTS ---
const CustomMapMarker = React.memo(
    ({ coordinate, name, type, onPress }: { 
        coordinate: {latitude: number, longitude: number},
        name: string, 
        type: 'garage' | 'truck' | 'ev',
        onPress: () => void
    }) => {
    const iconName = type === 'garage' ? 'build' : type === 'truck' ? 'car' : 'flash';
    const markerColor = type === 'garage' ? '#b95528' : type === 'truck' ? '#2980b9' : '#27ae60';

    return (
        <Marker coordinate={coordinate} title={name} onPress={onPress}>
            <View style={styles.markerContainer}>
                <View style={[styles.markerPin, { backgroundColor: markerColor }]}><Ionicons name={iconName} size={16} color="white" /></View>
            </View>
        </Marker>
    );
});

// --- MAIN COMPONENT ---
export default function GarageMap({ isPinningLocation, onPinLocationChange, onMapReady, providerType = 'all', filters }: MapProps) {
    const { getToken, isSignedIn } = useAuth();
    const mapRef = useRef<MapView>(null);
    
    const [region, setRegion] = useState<Region | null>(null);
    const [isFetchingProviders, setIsFetchingProviders] = useState(true);
    const [garages, setGarages] = useState<any[]>([]);
    const [towTrucks, setTowTrucks] = useState<any[]>([]);
    const [chargingStations, setChargingStations] = useState<any[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [pinAddress, setPinAddress] = useState<string>('Move the map to set location...');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [pinnedLocation, setPinnedLocation] = useState<PinnedLocationData | null>(null);

    const [selectedMarker, setSelectedMarker] = useState<{name: string, latitude: number, longitude: number} | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleGetDirections = (latitude: number, longitude: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url).catch(err => console.error('An error occurred opening maps', err));
    };

    const handleMarkerPress = (markerData: {name: string, latitude: number, longitude: number}) => {
        setSelectedMarker(markerData);
        setIsModalVisible(true);
    };

    const debouncedGetAddress = useCallback(debounce(async (lat: number, lon: number) => {
        console.log("[Map.tsx] Debounced geocode triggered.");
        const address = await getAddressFromCoords(lat, lon);
        onPinLocationChange({ latitude: lat, longitude: lon, description: address });
    }, 500), [onPinLocationChange]);

    const fetchProvidersForRegion = useCallback(debounce(async (currentRegion: Region) => {
        if (!isSignedIn || !currentRegion) return;
        setIsFetchingProviders(true);
        console.log("[Map.tsx] Fetching providers for region:", currentRegion);
        try {
            const token = await getToken();
            if (!token) return;
            
            const lat = currentRegion.latitude;
            const lon = currentRegion.longitude;

            const queryParams = new URLSearchParams();
            if (filters?.category) {
                queryParams.append('category', filters.category);
            }
            if (filters?.services && filters.services.length > 0) {
                filters.services.forEach(service => queryParams.append('services', service));
            }
            const queryString = queryParams.toString();

            const fetchGarages = providerType === 'garage' || providerType === 'all';
            const fetchTowTrucks = providerType === 'tow-truck' || providerType === 'all';

            const promises = [];

            if (fetchGarages) {
                promises.push(fetchNearbyData(`${API_BASE_URL}/api/garages/nearby?lat=${lat}&lon=${lon}&${queryString}`, token));
            } else {
                promises.push(Promise.resolve([]));
            }

            if (fetchTowTrucks) {
                promises.push(fetchNearbyData(`${API_BASE_URL}/api/tow-trucks/nearby?lat=${lat}&lon=${lon}&vehicleType=BIKE`, token));
            } else {
                promises.push(Promise.resolve([]));
            }

            promises.push(fetchNearbyEVStations(lat, lon));

            const [garagesData, towTrucksData, evStationsData] = await Promise.all(promises);
            
            setGarages(Array.isArray(garagesData) ? garagesData : []);
            setTowTrucks(Array.isArray(towTrucksData) ? towTrucksData : []);
            setChargingStations(Array.isArray(evStationsData) ? evStationsData : []);
        } catch (error) {
            console.error("Failed to fetch nearby providers:", error);
        } finally {
            setIsFetchingProviders(false);
        }
    }, 1000), [isSignedIn, providerType, filters]);

    useEffect(() => {
        console.log("[Map.tsx] Initial useEffect is running...");
        const initializeMap = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') throw new Error('Location permission denied.');
                
                console.log("[Map.tsx] Location permission granted. Getting current position...");
                const location = await Location.getCurrentPositionAsync({});
                const initialRegion = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.025 };
                
                console.log("[Map.tsx] Setting initial region:", initialRegion);
                setRegion(initialRegion);

                if (isPinningLocation) {
                    console.log("[Map.tsx] Pinning mode is active, getting initial address.");
                    debouncedGetAddress(initialRegion.latitude, initialRegion.longitude);
                } else {
                    console.log("[Map.tsx] Discovery mode is active, fetching initial providers.");
                    fetchProvidersForRegion(initialRegion);
                }
            } catch (error: any) {
                console.error("🔴 [Map.tsx] Map Init Error:", error.message);
                setRegion(FALLBACK_REGION);
            } finally {
               if (onMapReady && mapRef.current) {
                    onMapReady(mapRef);
                }
            }
        };
        initializeMap();
    }, []);

    const [isProgrammaticChange, setIsProgrammaticChange] = useState(false);

    const handleRegionChangeComplete = (newRegion: Region) => {
        console.log("[Map.tsx] Region change complete.", { isProgrammaticChange });
        
        if (isProgrammaticChange) {
            setIsProgrammaticChange(false);
            setRegion(newRegion);
            return;
        }
        
        setRegion(newRegion);
        if (isPinningLocation) {
            debouncedGetAddress(newRegion.latitude, newRegion.longitude);
        } else {
            fetchProvidersForRegion(newRegion);
        }
    };
    
    const recenterMap = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.01
            }, 300);
        } catch (error) {
            console.error("Failed to recenter map:", error);
            alert("Could not get your current location.");
        }
    };
    
    const handleRefresh = () => {
        if (region) {
            fetchProvidersForRegion(region);
        }
    };

    const handleLocationSelect = (data: any, details: any = null) => {
        console.log('🔍 [Map.tsx] Google Places Autocomplete - Location selected');
        console.log('Data:', data);
        console.log('Details:', details);
        
        setSearchError(null);
        
        if (searchError) {
            setSearchError(null);
        }

        if (details?.geometry?.location) {
            const { lat, lng } = details.geometry.location;
            console.log(`📍 [Map.tsx] Animating to coordinates: ${lat}, ${lng}`);
            
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
            
        } else if (data?.description) {
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
            {GOOGLE_API_KEY && GOOGLE_API_KEY.length > 20 && (
                <GooglePlacesAutocomplete
                    placeholder="Search for a place"
                    fetchDetails={true}
                    enablePoweredByContainer={false}
                    minLength={2}
                    debounce={300}
                    timeout={20000}
                    enableHighAccuracyLocation={true}                    
                    onPress={handleLocationSelect}
                    
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
                    
                    query={{
                        key: GOOGLE_API_KEY,
                        language: 'en',
                        components: 'country:in',
                        types: '(cities)', 
                        fields: 'formatted_address,geometry,name,place_id'
                    }}
                    
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
                    
                    predefinedPlaces={[]}
                    currentLocation={false}
                    nearbyPlacesAPI="GooglePlacesSearch"
                    GooglePlacesSearchQuery={{
                        rankby: 'distance',
                    }}
                    GooglePlacesDetailsQuery={{
                        fields: 'formatted_address,geometry,name,place_id'
                    }}
                    
                    suppressDefaultStyles={false}
                    keyboardShouldPersistTaps="handled"
                    listEmptyComponent={() => (
                        <View style={styles.noResults}>
                            <Text style={styles.noResultsText}>No results found</Text>
                        </View>
                    )}
                />
            )}
            
            {searchError && (
                <View style={styles.searchError}>
                    <Text style={styles.searchErrorText}>{searchError}</Text>
                    <TouchableOpacity 
                        onPress={() => setSearchError(null)}
                        style={styles.dismissButton}
                    >
                        <Text style={styles.dismissButtonText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            )}

            {(!GOOGLE_API_KEY || GOOGLE_API_KEY.length <= 20) && (
                <View style={styles.searchError}>
                    <Text style={styles.searchErrorText}>Search unavailable - API key needed</Text>
                </View>
            )}

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFill}
                customMapStyle={MAP_STYLE}
                initialRegion={region}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation={true}
                showsMyLocationButton={false}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={!isPinningLocation}
                rotateEnabled={!isPinningLocation}
            >
                <>
                    {garages.filter(g => g.location?.coordinates).map((g, index) => 
                        <CustomMapMarker 
                            key={`g-${g.id}-${index}`} 
                            coordinate={{
                                latitude: g.location.coordinates[1], 
                                longitude: g.location.coordinates[0]
                            }} 
                            name={g.name} 
                            type="garage" 
                            onPress={() => handleMarkerPress({name: g.name, latitude: g.location.coordinates[1], longitude: g.location.coordinates[0]})}
                        />
                    )}
                    {towTrucks.filter(t => t.location?.coordinates).map((t, index) => 
                        <CustomMapMarker 
                            key={`t-${t.id}-${index}`} 
                            coordinate={{
                                latitude: t.location.coordinates[1], 
                                longitude: t.location.coordinates[0]
                            }} 
                            name={t.name} 
                            type="truck" 
                            onPress={() => handleMarkerPress({name: t.name, latitude: t.location.coordinates[1], longitude: t.location.coordinates[0]})}
                        />
                    )}
                    {chargingStations.map((station, index) => 
                        <CustomMapMarker 
                            key={`ev-${station.place_id}-${index}`}
                            coordinate={{
                                latitude: station.geometry.location.lat, 
                                longitude: station.geometry.location.lng
                            }} 
                            name={station.name} 
                            type="ev" 
                            onPress={() => handleMarkerPress({name: station.name, latitude: station.geometry.location.lat, longitude: station.geometry.location.lng})}
                        />
                    )}
                </>
            </MapView>

            {isFetchingProviders && !isPinningLocation && (
                <View style={styles.refreshIndicator}>
                    <ActivityIndicator size={20} color="#000" />
                    <Text style={styles.refreshText}>Finding providers...</Text>
                </View>
            )}

            {isPinningLocation && (
                <>
                    <View style={styles.pinContainer} pointerEvents="none">
                        <Ionicons name="location" size={48} color={'#e63946'} /> 
                    </View>
                     <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
                        <Ionicons name="locate-outline" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                        <Ionicons name="refresh" size={24} color="#333" />
                    </TouchableOpacity>
                </>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedMarker?.name}</Text>
                        <Text style={styles.modalSubtitle}>Would you like to get directions to this location?</Text>
                        <TouchableOpacity 
                            style={styles.directionsButton} 
                            onPress={() => {
                                if (selectedMarker) {
                                    handleGetDirections(selectedMarker.latitude, selectedMarker.longitude);
                                }
                                setIsModalVisible(false);
                            }}
                        >
                            <Text style={styles.directionsButtonText}>Get Directions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    searchContainer: {
        position: 'absolute',
        top: 40,
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
    dismissButton: {
        backgroundColor: '#c62828',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    dismissButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    recenterButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },

    // Pinning Mode Styles
    pinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -24 }, { translateY: -48 }],
        zIndex: 99,
    },
    pinIcon: {
        color: '#e63946',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4
    },
    refreshButton: {
        position: 'absolute',
        top: 120,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    
    // Custom Marker Styles
    markerContainer: { alignItems: 'center' },
    markerPin: { 
        width: 45, 
        height: 45, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 2, 
        borderColor: 'white', 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.23, 
        shadowRadius: 2.62, 
        elevation: 4 
    },
    
    // Refresh Indicator
    refreshIndicator: { 
        position: 'absolute', 
        top: 50, 
        alignSelf: 'center', 
        backgroundColor: 'rgba(255,255,255,0.9)', 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        borderRadius: 20, 
        flexDirection: 'row', 
        alignItems: 'center', 
        elevation: 5 
    },
    refreshText: { marginLeft: 8, fontWeight: '500' },

    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    directionsButton: {
        backgroundColor: '#27ae60',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    directionsButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#f1f1f1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: '500',
    },
});