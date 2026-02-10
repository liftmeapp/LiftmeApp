import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Circle, Region } from 'react-native-maps';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const { width } = Dimensions.get('window');
const numColumns = 3; // Smaller cards
const DEFAULT_COORDS = { latitude: 12.9716, longitude: 77.5946 }; // Bangalore fallback
const DEFAULT_REGION: Region = {
    ...DEFAULT_COORDS,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    contentContainer: { padding: 8, paddingBottom: 100 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header & Search
    headerContainer: { padding: 16, backgroundColor: '#fff', marginBottom: 10, borderRadius: 0 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
    headerSubtitle: { fontSize: 13, color: '#666', marginBottom: 10, marginTop: 4 },

    locationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#005C70', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    locationButtonText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 },

    searchBoxContainer: { marginVertical: 10 },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f4', borderRadius: 12, paddingHorizontal: 12, height: 44
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },

    errorText: { color: 'red', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },

    // Product Card (3 Columns)
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 4, // Tighter margin
        flex: 1 / numColumns,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden', // Clip content
    },
    imageContainer: { height: (width / numColumns) - 10, backgroundColor: '#eee' },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    productInfo: { padding: 8 },
    productName: { fontSize: 12, fontWeight: '700', color: '#2c3e50', marginBottom: 2, height: 32 }, // Fixed height for 2 lines
    productPrice: { fontSize: 13, fontWeight: '800', color: '#005C70' },
    productLocationContainer: { display: 'none' }, // Hide location in small card to save space
});

const ProductCard = ({ item }: { item: any }) => {
    const router = useRouter();
    const imageUri = Array.isArray(item?.images) && item.images.length > 0
        ? item.images[0]
        : 'https://via.placeholder.com/150';

    return (
        <TouchableOpacity style={styles.productCard} activeOpacity={0.8} onPress={() => router.push(`/services/sparepart-detail?partId=${item.id}` as Href)}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.productImage} />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.partName}</Text>
                <Text style={styles.productPrice}>₹{item.price.toFixed(0)}</Text>
            </View>
        </TouchableOpacity>
    );
};


export default function SparePartsMarketplace() {
    const { getToken } = useAuth();
    const mapRef = useRef<MapView | null>(null);
    const [parts, setParts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [manualLocation, setManualLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [pendingLocation, setPendingLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [pickerRegion, setPickerRegion] = useState<Region>(DEFAULT_REGION);
    const [displayLocation, setDisplayLocation] = useState<string | null>(null);
    const [showLocationSearch, setShowLocationSearch] = useState(false);
    const [searchRadius, setSearchRadius] = useState(20); // Default 20km

    // Use a ref to hold the latest getToken function without causing re-renders
    const getTokenRef = useRef(getToken);
    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    const getAddressLabel = useCallback(async (latitude: number, longitude: number) => {
        try {
            const address = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (address.length > 0) {
                const first = address[0];
                return [first.name, first.street, first.city, first.region].filter(Boolean).join(', ');
            }
        } catch (e) {
            console.warn('Reverse geocoding failed:', e);
        }
        return 'Pinned Location';
    }, []);

    const initializeLocationPicker = useCallback(async () => {
        let selected = manualLocation;

        if (!selected) {
            try {
                let { status } = await Location.getForegroundPermissionsAsync();
                if (status !== 'granted') {
                    const permissionResponse = await Location.requestForegroundPermissionsAsync();
                    status = permissionResponse.status;
                }

                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    selected = { latitude: location.coords.latitude, longitude: location.coords.longitude };
                    setCurrentLocation(selected);
                }
            } catch (e) {
                console.warn('Could not get current location for picker:', e);
            }
        }

        const base = selected || DEFAULT_COORDS;
        setPendingLocation(base);
        setPickerRegion({
            latitude: base.latitude,
            longitude: base.longitude,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
        });
        requestAnimationFrame(() => {
            mapRef.current?.animateToRegion({
                latitude: base.latitude,
                longitude: base.longitude,
                latitudeDelta: 0.12,
                longitudeDelta: 0.12,
            }, 250);
        });

        if (!displayLocation) {
            const label = await getAddressLabel(base.latitude, base.longitude);
            setDisplayLocation(label);
        }
    }, [manualLocation, displayLocation, getAddressLabel]);

    useEffect(() => {
        if (showLocationSearch) {
            initializeLocationPicker();
        }
    }, [showLocationSearch, initializeLocationPicker]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let latitude, longitude;

            if (manualLocation) {
                // Use manually selected location
                latitude = manualLocation.latitude;
                longitude = manualLocation.longitude;
            } else {
                // ... (existing automated location logic) ...
                // 1. Check existing permission first to avoid prompting every time
                let { status } = await Location.getForegroundPermissionsAsync();
                if (status !== 'granted') {
                    const permissionResponse = await Location.requestForegroundPermissionsAsync();
                    status = permissionResponse.status;
                }

                if (status !== 'granted') {
                    setError('Permission to access location was denied.');
                    setLoading(false);
                    return;
                }

                let location = await Location.getLastKnownPositionAsync();
                if (!location) {
                    try {
                        const locationPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 4000));
                        location = await Promise.race([locationPromise, timeoutPromise]);
                    } catch (e) { location = null; }
                }

                if (location) {
                    latitude = location.coords.latitude;
                    longitude = location.coords.longitude;
                }
            }

            // Fallback
            if (!latitude || !longitude) {
                latitude = DEFAULT_COORDS.latitude;
                longitude = DEFAULT_COORDS.longitude;
            }

            // 3. Get Auth Token
            const token = await getTokenRef.current();

            // 4. Fetch parts with RADIUS
            const url = `${API_BASE_URL}/api/spare-parts/nearby?lat=${latitude}&lon=${longitude}&radius=${searchRadius}`;

            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch parts.');
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response. Check API URL/backend availability.');
            }
            const data = await response.json();
            setParts(data);
        } catch (e: any) {
            console.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [manualLocation, searchRadius]); // Re-fetch on location or radius change

    useFocusEffect(useCallback(() => {
        fetchData();
    }, [fetchData]));

    // ... (renderItem, etc) ...

    return (
        <View style={styles.container}>
            {/* ... FlatList ... */}
            <FlatList
                data={parts}
                renderItem={({ item }) => <ProductCard item={item} />}
                keyExtractor={item => item.id}
                numColumns={numColumns}
                columnWrapperStyle={{ gap: 8 }}
                contentContainerStyle={styles.contentContainer}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.headerTitle}>Spare Parts</Text>
                            <TouchableOpacity onPress={() => setShowLocationSearch(true)} style={styles.locationButton}>
                                <Ionicons name="map" size={16} color="#fff" />
                                <Text style={styles.locationButtonText}>{displayLocation ? displayLocation.split(',')[0] : "Area"} • {searchRadius}km</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.headerSubtitle}>
                            Showing results near <Text style={{ fontWeight: 'bold', color: '#005C70' }}>{displayLocation || "Current Location"}</Text>
                        </Text>

                        {/* Search Input (Disabled, acts as trigger) */}
                        <TouchableOpacity onPress={() => setShowLocationSearch(true)} style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                            <Text style={{ color: '#999', fontSize: 14 }}>{displayLocation ? `Searching in ${displayLocation}` : "Search parts..."}</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={!loading ? <View style={styles.centered}><Text style={{ color: '#666', marginTop: 20 }}>No parts found within {searchRadius}km.</Text></View> : null}
            />

            {/* FULL SCREEN MAP MODAL */}
            {showLocationSearch && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', zIndex: 1000 }]}>
                    <MapView
                        ref={mapRef}
                        style={StyleSheet.absoluteFill}
                        initialRegion={pickerRegion}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        onRegionChangeComplete={(region) => {
                            setPickerRegion(region);
                            setPendingLocation({ latitude: region.latitude, longitude: region.longitude });
                        }}
                    >
                        {pendingLocation && (
                            <Circle
                                center={pendingLocation}
                                radius={searchRadius * 1000}
                                fillColor="rgba(0, 92, 112, 0.2)"
                                strokeColor="rgba(0, 92, 112, 0.5)"
                            />
                        )}
                    </MapView>

                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                        <Ionicons name="location" size={46} color="#005C70" />
                    </View>

                    {/* TOP BAR: Search & Close */}
                    <View style={{ position: 'absolute', top: 40, left: 10, right: 10, flexDirection: 'row' }}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            {GOOGLE_API_KEY && (
                                <GooglePlacesAutocomplete
                                    placeholder='Search City/Area'
                                    fetchDetails={true}
                                    onPress={(data, details = null) => {
                                        if (details) {
                                            const lat = details.geometry.location.lat;
                                            const lng = details.geometry.location.lng;
                                            const nextRegion = {
                                                latitude: lat,
                                                longitude: lng,
                                                latitudeDelta: pickerRegion.latitudeDelta,
                                                longitudeDelta: pickerRegion.longitudeDelta,
                                            };
                                            setPendingLocation({ latitude: lat, longitude: lng });
                                            setPickerRegion(nextRegion);
                                            mapRef.current?.animateToRegion(nextRegion, 300);
                                            setDisplayLocation(data.description);
                                        }
                                    }}
                                    query={{ key: GOOGLE_API_KEY, language: 'en', components: 'country:in' }}
                                    styles={{ textInput: { height: 44, borderRadius: 8 } }}
                                    debounce={300}
                                    minLength={2}
                                    onFail={(error) => console.error('GooglePlacesAutocomplete Error:', error)}
                                    onNotFound={() => console.warn('GooglePlacesAutocomplete: Location not found')}
                                    enablePoweredByContainer={false}
                                    predefinedPlaces={[]}
                                    keyboardShouldPersistTaps="handled"
                                    textInputProps={{
                                        placeholderTextColor: '#999',
                                    }}
                                />
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={async () => {
                                let location = currentLocation;
                                if (!location) {
                                    try {
                                        const fresh = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                                        location = { latitude: fresh.coords.latitude, longitude: fresh.coords.longitude };
                                        setCurrentLocation(location);
                                    } catch {
                                        return;
                                    }
                                }
                                const nextRegion = {
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    latitudeDelta: pickerRegion.latitudeDelta,
                                    longitudeDelta: pickerRegion.longitudeDelta,
                                };
                                setPendingLocation(location);
                                setPickerRegion(nextRegion);
                                mapRef.current?.animateToRegion(nextRegion, 300);
                            }}
                            style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8, height: 44, justifyContent: 'center', marginRight: 8 }}
                        >
                            <Ionicons name="locate" size={22} color="#005C70" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowLocationSearch(false)} style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8, height: 44, justifyContent: 'center' }}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* BOTTOM BAR: Radius Selector & Confirm */}
                    <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 5 }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 10, color: '#333' }}>Search Radius: {searchRadius} km</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            {[10, 20, 30, 40, 50].map(km => (
                                <TouchableOpacity
                                    key={km}
                                    onPress={() => setSearchRadius(km)}
                                    style={{
                                        paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
                                        backgroundColor: searchRadius === km ? '#005C70' : '#f0f0f0'
                                    }}
                                >
                                    <Text style={{ color: searchRadius === km ? '#fff' : '#333', fontWeight: '600' }}>{km}km</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            onPress={async () => {
                                if (!pendingLocation) return;
                                setManualLocation(pendingLocation);
                                const label = await getAddressLabel(pendingLocation.latitude, pendingLocation.longitude);
                                setDisplayLocation(label);
                                setShowLocationSearch(false);
                            }}
                            style={{ backgroundColor: '#005C70', padding: 15, borderRadius: 12, alignItems: 'center' }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Confirm Location</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {/* ... existing loader ... */}
            {loading && (
                <View style={[styles.centered, { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                    <ActivityIndicator size="large" color="#005C70" />
                </View>
            )}
        </View>
    );
}
