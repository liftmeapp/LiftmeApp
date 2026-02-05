//app/services/roadsidebike-service.tsx
import Map, { PinnedLocationData } from "@/components/Map";
import ServiceBookingSheet from '@/components/ServiceBookingSheet';
import { BookingStage, useBooking } from '@/context/BookingContext';
import { useAuth } from '@clerk/clerk-expo';
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

export default function MainMap() {
    const mapRef = useRef<MapView>(null);
    const { getToken } = useAuth();

    // --- Context ---
    const {
        currentStage,
        restoreActiveBookingForFlow,
        setStage,
        setActiveFlowType,
        setSelectedService,
        setSelectedVehicle,
        setPickupLocation,
        startBooking,
        selectedService,
        selectedVehicle,
    } = useBooking();

    // --- Local State for Map & Data ---
    const [pinnedLocation, setPinnedLocation] = useState<PinnedLocationData | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isFlowReady, setIsFlowReady] = useState(false);

    // Data
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Derived Data
    const filteredServices = useMemo(
        () => services.filter(service => service.category === 'ROADSIDE_BIKE'),
        [services]
    );

    const filteredBikeVehicles = useMemo(() => vehicles.filter(vehicle => vehicle.type === 'BIKE'), [vehicles]);

    // --- Init ---
    useEffect(() => {
        let mounted = true;
        const setupFlow = async () => {
            setIsFlowReady(false);
            setActiveFlowType('BIKE_ASSISTANCE');
            const restored = await restoreActiveBookingForFlow('BIKE_ASSISTANCE');
            if (!mounted || restored) return;
            setSelectedService(null);
            setSelectedVehicle(null);
            setStage(BookingStage.SERVICE_SELECTION);
            if (mounted) setIsFlowReady(true);
            return;
        };
        setupFlow().finally(() => {
            if (mounted) setIsFlowReady(true);
        });
        return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                const vehiclesType = vehiclesRes.headers.get('content-type') || '';
                const servicesType = servicesRes.headers.get('content-type') || '';
                if (!vehiclesType.includes('application/json') || !servicesType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response. Check API URL/backend availability.');
                }

                setVehicles(await vehiclesRes.json());
                setServices(await servicesRes.json());
            } catch (error) {
                console.error("Error fetching initial data:", error);
                Alert.alert("Error", "Could not load bike data. Please check backend/API URL and try again.");
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                serviceType: 'BIKE_ASSISTANCE', // Updated for Bike Service
                serviceId: selectedService.id,
                vehicleId: selectedVehicle.id,
                userLat: finalLocation.latitude,
                userLon: finalLocation.longitude,
                pickupDescription: finalLocation.description,
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

                {isFlowReady && (
                    <ServiceBookingSheet
                        services={filteredServices}
                        vehicles={filteredBikeVehicles}
                        isInitialLoading={isInitialLoading}
                        pinnedLocation={pinnedLocation}
                        isGeocoding={isGeocoding}
                        onPinLocationRequest={() => { }}
                        onConfirmPin={handleConfirmPin}
                        bookingServiceType="BIKE_ASSISTANCE"
                    />
                )}
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
