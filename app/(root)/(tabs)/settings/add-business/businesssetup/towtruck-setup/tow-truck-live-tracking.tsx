import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RotatingLoader from '@/components/RotatingLoader'; // Assuming you have this custom loader
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router'; // <-- ADD THIS


// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function TowTruckLiveTrackingScreen() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const [isAvailable, setIsAvailable] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const locationSubscription = useRef<{ remove: () => void } | null>(null);
    const isUpdating = useRef(false);
    const { towTruckId, towTruckName } = useLocalSearchParams<{ towTruckId: string, towTruckName: string }>();

    // This function securely sends the driver's location and status to your backend.
    const updateLocationOnServer = async (location: Location.LocationObject, availability: boolean) => {
        if (isUpdating.current) return;
        isUpdating.current = true;
        
        try {
            const token = await getToken();
            if (!token) return console.warn("Auth token not available, skipping location update.");
            
            fetch(`${API_BASE_URL}/api/tow-trucks/location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    isAvailable: availability,
                }),
            });
            console.log(`Location update sent: available=${availability} at ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error('Failed to send location update:', error);
        } finally {
            isUpdating.current = false;
        }
    };

    // This effect runs when the component mounts to start tracking the driver's location.
    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        const startWatching = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Live location tracking is required for driver mode. Please enable location permissions in your device settings.");
                router.back();
                return;
            }

            locationSubscription.current = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 15000, // Update every 15 seconds
                distanceInterval: 50,  // Or every 50 meters
            }, (location) => {
                setCurrentLocation(location);
                updateLocationOnServer(location, isAvailable);
            });
        };

        startWatching();

        // Cleanup function: This runs when the user navigates away.
        return () => {
            if (locationSubscription.current) {
                console.log("Driver leaving live mode. Stopping location updates.");
                locationSubscription.current.remove();
            }
        };
    }, [isLoaded, isSignedIn, isAvailable]);

    const handleAvailabilityChange = (value: boolean) => {
        setIsAvailable(value);
        if (currentLocation) {
            updateLocationOnServer(currentLocation, value);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{ 
                    title: 'Live Driver Mode',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                            <Ionicons name="chevron-back" size={28} color="#ed8b65" />
                        </TouchableOpacity>
                    ),
                    headerTitleAlign: 'center',
                }} 
            />
            {currentLocation ? (
                <MapView 
                    style={styles.map} 
                    provider={PROVIDER_GOOGLE}
                    region={{
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                    showsUserLocation={false}
                >
                    <Marker coordinate={currentLocation.coords} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={styles.truckMarker}>
                            <Ionicons name="car-sport" size={24} color="#fff" />
                        </View>
                    </Marker>
                </MapView>
            ) : (
                <RotatingLoader 
                    iconName="navigate-circle-outline" 
                    message="Waiting for GPS Signal..." 
                    color="#ed8b65"
                    size={50}
                />
            )}
            <View style={styles.statusBanner}>
                <Text style={styles.statusText}>Your Status</Text>
                <View style={styles.toggleContainer}>
                    <Text style={[styles.availabilityText, !isAvailable && styles.unavailable]}>Offline</Text>
                    <Switch 
                        value={isAvailable} 
                        onValueChange={handleAvailabilityChange} 
                        trackColor={{ false: "#767577", true: "#2ecc71" }} 
                        thumbColor={"#f4f3f4"} 
                        ios_backgroundColor="#3e3e3e"
                    />
                    <Text style={[styles.availabilityText, isAvailable && styles.available]}>Online</Text>
                </View>
            </View>

            {/* --- START OF NEW BUTTON --- */}
            <View style={styles.dashboardButtonContainer}>
                <TouchableOpacity onPress={() => router.push({
                    pathname: '/settings/add-business/tow-truck-dashboard',
                    params: { towTruckId, towTruckName }
                })}>
                    <LinearGradient
                        colors={['#4c669f', '#3b5998', '#192f6a']}
                        style={styles.dashboardButton}
                    >
                        <Ionicons name="speedometer-outline" size={22} color="#fff" />
                        <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            {/* --- END OF NEW BUTTON --- */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    map: { flex: 1 },
    headerButton: { marginLeft: 10, padding: 5 },
    statusBanner: { 
        position: 'absolute', top: 20, left: 15, right: 15, 
        backgroundColor: 'rgba(44, 62, 80, 0.9)', borderRadius: 15, 
        paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', 
        alignItems: 'center', justifyContent: 'space-between', 
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.2, shadowRadius: 4, elevation: 10 
    },
    statusText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    toggleContainer: { flexDirection: 'row', alignItems: 'center' },
    availabilityText: { color: '#bdc3c7', fontSize: 16, fontWeight: '500', marginHorizontal: 10 },
    available: { color: '#2ecc71', fontWeight: 'bold' },
    unavailable: { color: '#e74c3c', fontWeight: 'bold' },
    truckMarker: { 
        backgroundColor: '#e67e22', padding: 10, borderRadius: 25, 
        borderWidth: 3, borderColor: 'white', elevation: 5,
        shadowColor: '#000', shadowOpacity: 0.3,
        shadowRadius: 5, shadowOffset: { width: 0, height: 3 },
    },
    // --- NEW STYLES FOR DASHBOARD BUTTON ---
    dashboardButtonContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center', // Center the button
    },
    dashboardButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30, // Make it pill-shaped
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#192f6a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 8,
    },
    dashboardButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});