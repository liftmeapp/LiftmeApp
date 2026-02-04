//app/services/electric-vehicleservice.tsx
import Map, { PinnedLocationData } from "@/components/Map";
import ServiceBookingSheet from '@/components/ServiceBookingSheet';
import { BookingStage, useBooking } from '@/context/BookingContext';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    StyleSheet,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import MapView from 'react-native-maps';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const color = {
    white: "#ffffff",
};

export default function EVServiceMap() {
    const mapRef = useRef<MapView>(null);
    const router = useRouter();
    const { getToken } = useAuth();

    // --- Context ---
    const {
        currentStage,
        setStage,
        setPickupLocation,
        startBooking,
        selectedService,
        selectedVehicle,
    } = useBooking();

    // --- Local State for Map & Data ---
    const [pinnedLocation, setPinnedLocation] = useState<PinnedLocationData | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Data
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Derived Data
    const filteredServices = useMemo(
        () => services.filter(service => service.category === 'ELECTRIC_VEHICLE'),
        [services]
    );

    const filteredVehicles = useMemo(
        () => vehicles.filter(vehicle => vehicle.type === 'EV'),
        [vehicles]
    );

    // --- Init ---
    useEffect(() => {
        if (currentStage === BookingStage.IDLE) {
            setStage(BookingStage.SERVICE_SELECTION);
        }
    }, []);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsInitialLoading(true);
            try {
                const token = await getToken();
                if (!token) throw new Error("Not authenticated");

                const [vehiclesRes, servicesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/vehicles`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/services`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!vehiclesRes.ok || !servicesRes.ok) throw new Error("Failed to fetch initial data.");

                setVehicles(await vehiclesRes.json());
                setServices(await servicesRes.json());
            } catch (error) {
                console.error("Error fetching initial data:", error);
                Alert.alert("Error", "Could not load data. Please try again.");
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // --- Handlers ---
    const handlePinLocationChange = useCallback((location: PinnedLocationData) => {
        setIsGeocoding(true);
        setPinnedLocation(location);
        if (location.description !== "Could not fetch address" && location.description !== "Unknown Location") {
            setIsGeocoding(false);
        }
    }, []);

    const handleConfirmPin = () => {
        if (pinnedLocation && pinnedLocation.latitude && pinnedLocation.longitude) {
            const finalLocation = {
                latitude: pinnedLocation.latitude,
                longitude: pinnedLocation.longitude,
                description: pinnedLocation.description,
                place_id: 'pinned-location',
            };
            setPickupLocation(finalLocation);

            startBooking({
                serviceType: 'ELECTRIC_VEHICLE', // Updated for EV Service
                serviceId: selectedService.id,
                vehicleId: selectedVehicle.id,
                userLat: finalLocation.latitude,
                userLon: finalLocation.longitude,
            });
        } else {
            Alert.alert("Location Error", "Could not determine the pinned location. Please try again.");
        }
    };

    const handleMapReady = useCallback((ref: React.RefObject<MapView | null>) => {
        mapRef.current = ref.current;
    }, []);

    // --- Map Pin Mode Logic ---
    const isPinModeActive = currentStage === BookingStage.LOCATION_CONFIRMATION;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Map
                    isPinningLocation={isPinModeActive}
                    onPinLocationChange={handlePinLocationChange}
                    onMapReady={handleMapReady}
                />

                <ServiceBookingSheet
                    services={filteredServices}
                    vehicles={filteredVehicles}
                    isInitialLoading={isInitialLoading}
                    pinnedLocation={pinnedLocation}
                    isGeocoding={isGeocoding}
                    onPinLocationRequest={() => { }}
                    onConfirmPin={handleConfirmPin}
                    bookingServiceType="ELECTRIC_VEHICLE"
                />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.white
    },
});