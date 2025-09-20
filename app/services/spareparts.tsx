// /app/services/towing_service.tsx
import RotatingLoader from '@/components/RotatingLoader';
import TowMap, { PinnedLocationData } from "@/components/TowMap";
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const SEARCH_DURATION_SECONDS = 300; // 5 minutes

// --- STYLING & CONSTANTS ---
const color = {
  lightGray: "#f4f4f8",
  primary: "#b95528",
  success: "#27ae60",
  darkGray: "#333",
  mediumGray: "#6c757d",
  border: "#e0e0e0",
  white: "#fff",
  black: "#000",
  danger: '#c0392b'
};

// --- MAIN COMPONENT ---
export default function TowingServiceMap() {
    const router = useRouter();
    const { getToken } = useAuth();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '65%'], []);

    // --- STATE MANAGEMENT ---
    type Stage = 'pickup' | 'destination' | 'vehicle' | 'searching' | 'confirmed';
    const [currentStage, setCurrentStage] = useState<Stage>('pickup');

    // --- DATA & SELECTIONS ---
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

    // --- LOCATION ---
    const [pickupLocation, setPickupLocation] = useState<PinnedLocationData | null>(null);
    const [destinationLocation, setDestinationLocation] = useState<PinnedLocationData | null>(null);

    // --- BOOKING FLOW ---
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [confirmedProvider, setConfirmedProvider] = useState<any>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- UI STATES ---
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // --- EFFECTS ---

    // Fetch user's registered vehicles on screen focus
    useFocusEffect(useCallback(() => {
        const fetchUserVehicles = async () => {
            setIsInitialLoading(true);
            try {
                const token = await getToken();
                const response = await fetch(`${API_BASE_URL}/api/vehicles`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error("Could not fetch vehicles.");
                const data = await response.json();
                setVehicles(data);
            } catch (error: any) {
                Alert.alert("Error", error.message || "Could not load your vehicle data.");
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchUserVehicles();
    }, [getToken]));

    // Adjust bottom sheet position based on the current stage
    useEffect(() => {
        if (!bottomSheetRef.current) return;
        const snap = (index: number) => { try { bottomSheetRef.current?.snapToIndex(index); } catch (e) {} };
        
        switch(currentStage) {
            case 'pickup':
            case 'destination':
            case 'vehicle':
                snap(1); // Higher sheet for selection
                break;
            case 'searching':
            case 'confirmed':
                snap(0); // Lower sheet to show map
                break;
        }
    }, [currentStage]);

    // Polling effect to check booking status
    useEffect(() => {
        const clearPolling = () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
        
        const pollStatus = async () => {
            if (!bookingId) return;
            console.log(`[Polling] Checking status for booking: ${bookingId}`);
            try {
                const token = await getToken();
                const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) {
                    // Stop polling on server error
                    setSearchError("An error occurred while checking status.");
                    clearPolling();
                    return;
                }
                const data = await response.json();
                if (data.status === 'CONFIRMED') {
                    console.log("✅ [Polling] Provider found!", data);
                    setConfirmedProvider(data.provider);
                    setCurrentStage('confirmed');
                    clearPolling();
                } else if (['EXPIRED', 'CANCELLED'].includes(data.status)) {
                    setSearchError("No tow trucks were available to accept your request.");
                    clearPolling();
                }
            } catch (error) {
                setSearchError("A network error occurred.");
                clearPolling();
            }
        };

        if (currentStage === 'searching' && bookingId && !searchError) {
            pollIntervalRef.current = setInterval(pollStatus, 5000); // Poll every 5 seconds
        }
        return clearPolling; // Cleanup on unmount or stage change
    }, [currentStage, bookingId, searchError, getToken]);

    // --- ACTION HANDLERS ---

    // Update location state when map pin moves
    const handleLocationChange = (location: PinnedLocationData) => {
        if (currentStage === 'pickup') setPickupLocation(location);
        if (currentStage === 'destination') setDestinationLocation(location);
    };
    
    // Advance to the next stage after confirming a location
    const handleConfirmLocation = () => {
        if (currentStage === 'pickup' && pickupLocation) {
            setCurrentStage('destination');
        } else if (currentStage === 'destination' && destinationLocation) {
            setCurrentStage('vehicle');
        }
    };

    // Main function to broadcast the towing request to the API
    const handleBroadcastRequest = async () => {
        if (!selectedVehicle || !pickupLocation || !destinationLocation) {
            Alert.alert("Incomplete Details", "Please select a vehicle, pickup, and destination.");
            return;
        }

        setCurrentStage('searching');
        setIsBroadcasting(true);
        setSearchError(null);

        try {
            const token = await getToken();
            const payload = {
                vehicleId: selectedVehicle.id,
                vehicleType: selectedVehicle.type, // Your Vehicle model must have a 'type' enum
                pickup: { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude, description: pickupLocation.description },
                destination: { latitude: destinationLocation.latitude, longitude: destinationLocation.longitude, description: destinationLocation.description },
            };

            console.log("[Broadcast] Sending towing payload:", JSON.stringify(payload, null, 2));

            const response = await fetch(`${API_BASE_URL}/api/bookings/request-towing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.reason || 'Failed to broadcast towing request.');
            
            setBookingId(data.bookingId);
        } catch (error: any) {
            console.error("🔴 [Broadcast] Error:", error);
            setSearchError(error.message);
        } finally {
            setIsBroadcasting(false);
        }
    };

    // Handle back navigation between stages
    const handleGoBack = () => {
        switch(currentStage) {
            case 'destination': setCurrentStage('pickup'); break;
            case 'vehicle': setCurrentStage('destination'); break;
            case 'searching':
            case 'confirmed':
                // Here you would ideally call an API to cancel the booking
                setCurrentStage('vehicle');
                setSearchError(null);
                setBookingId(null);
                break;
        }
    };

    // --- RENDER FUNCTIONS ---

    // Renders the UI for pickup and destination selection
    const renderLocationContent = () => {
        const isPickup = currentStage === 'pickup';
        const location = isPickup ? pickupLocation : destinationLocation;
        const title = isPickup ? "Set Pickup Location" : "Set Drop-off Destination";
        const buttonDisabled = !location || !location.latitude;

        return (
            <BottomSheetView style={styles.contentContainer}>
                 <Text style={styles.headerText}>{title}</Text>
                 <View style={styles.addressDisplayBox}>
                    <Ionicons name="location-sharp" size={24} color={color.primary} />
                    <Text style={styles.addressDisplayText} numberOfLines={2}>
                        {location?.description || "Move the map to set location..."}
                    </Text>
                </View>
                <TouchableOpacity 
                    style={[styles.confirmButton, buttonDisabled && styles.disabledButton]} 
                    onPress={handleConfirmLocation}
                    disabled={buttonDisabled}
                >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
            </BottomSheetView>
        );
    };

    // Renders the vehicle selection UI
    const renderVehicleContent = () => {
         if (isInitialLoading) return <ActivityIndicator style={{marginTop: 50}} size="large" color={color.primary} />;

         return (
             <BottomSheetView style={styles.contentContainer}>
                <View style={styles.headerWithBack}>
                    <TouchableOpacity onPress={handleGoBack}>
                        <Ionicons name="arrow-back-circle-outline" size={30} color={color.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Which vehicle to tow?</Text>
                    <View style={{width: 30}} />
                </View>
                <FlatList
                    data={vehicles}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const isSelected = selectedVehicle?.id === item.id;
                        return (
                            <TouchableOpacity
                                style={[styles.vehicleCard, isSelected && styles.selectedVehicleCard]}
                                onPress={() => setSelectedVehicle(item)}
                            >
                                <Ionicons name="car-sport-outline" size={30} color={isSelected ? color.primary : color.darkGray} />
                                <View style={{flex: 1, marginLeft: 15}}>
                                    <Text style={styles.vehicleName}>{item.brand} {item.name}</Text>
                                    <Text style={styles.vehicleInfo}>{item.plateNumber} • {item.type}</Text>
                                </View>
                                {isSelected && <Ionicons name="checkmark-circle" size={30} color={color.success} />}
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={<Text style={styles.subHeaderText}>No vehicles found. Please add a vehicle in settings.</Text>}
                />
                {selectedVehicle && (
                    <TouchableOpacity 
                        style={[styles.confirmButton, isBroadcasting && styles.disabledButton]} 
                        onPress={handleBroadcastRequest}
                        disabled={isBroadcasting}
                    >
                        {isBroadcasting ? <ActivityIndicator color={color.white} /> : <Text style={styles.confirmButtonText}>Find Tow Trucks</Text>}
                    </TouchableOpacity>
                )}
            </BottomSheetView>
        );
    };
    
    // Renders the searching/confirmed/error UI
    const renderSearchingContent = () => {
         if (searchError) {
             return (
                 <BottomSheetView style={[styles.contentContainer, styles.centered]}>
                     <Ionicons name="alert-circle-outline" size={60} color={color.danger} />
                     <Text style={styles.headerText}>Search Failed</Text>
                     <Text style={styles.subHeaderText}>{searchError}</Text>
                     <TouchableOpacity style={styles.confirmButton} onPress={handleGoBack}>
                         <Text style={styles.confirmButtonText}>Go Back</Text>
                     </TouchableOpacity>
                 </BottomSheetView>
             );
         }

         if (currentStage === 'confirmed' && confirmedProvider) {
              return (
                 <BottomSheetView style={[styles.contentContainer, styles.centered]}>
                     <Ionicons name="checkmark-circle" size={60} color={color.success} />
                     <Text style={styles.headerText}>Truck Confirmed!</Text>
                     <Text style={styles.subHeaderText}>{confirmedProvider.name} is on the way.</Text>
                     {/* Add ETA, Price, OTP here later */}
                 </BottomSheetView>
              );
         }

         return (
             <BottomSheetView style={[styles.contentContainer, styles.centered]}>
                 <RotatingLoader color={color.primary} size={50} />
                 <Text style={styles.headerText}>Finding Nearby Trucks...</Text>
                 <Text style={styles.subHeaderText}>Broadcasting your request to all available tow trucks in the area.</Text>
             </BottomSheetView>
         );
    };

    // Main render switch
    const renderContent = () => {
        switch(currentStage) {
            case 'pickup':
            case 'destination':
                return renderLocationContent();
            case 'vehicle':
                return renderVehicleContent();
            case 'searching':
            case 'confirmed':
                return renderSearchingContent();
            default:
                return null;
        }
    };
    
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <TowMap
                    isPinningLocation={currentStage === 'pickup' || currentStage === 'destination'}
                    onPinLocationChange={handleLocationChange}
                    // You can enhance your Map component to show markers for pickup and destination
                    pickupMarker={pickupLocation}
                    destinationMarker={destinationLocation}
                />
                <BottomSheet
                    ref={bottomSheetRef}
                    index={1}
                    snapPoints={snapPoints}
                    enablePanDownToClose={false}
                    handleIndicatorStyle={{ backgroundColor: color.primary, width: 50 }}
                >
                    {renderContent()}
                </BottomSheet>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.white },
    centered: { justifyContent: 'center', alignItems: 'center' },
    contentContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10, backgroundColor: color.white },
    headerText: { fontSize: 22, fontWeight: "bold", textAlign: 'center', marginBottom: 15, color: color.darkGray },
    headerWithBack: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    subHeaderText: { fontSize: 16, textAlign: 'center', color: color.mediumGray, marginBottom: 20 },
    addressDisplayBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: color.lightGray,
        padding: 15, borderRadius: 10, marginBottom: 20, minHeight: 70,
    },
    addressDisplayText: { flex: 1, marginLeft: 10, fontSize: 16, color: color.darkGray },
    confirmButton: { backgroundColor: color.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    disabledButton: { backgroundColor: color.mediumGray },
    confirmButtonText: { color: color.white, fontSize: 18, fontWeight: 'bold' },
    vehicleCard: {
        flexDirection: 'row', alignItems: 'center', padding: 15,
        backgroundColor: color.white, borderRadius: 10, marginBottom: 10,
        borderWidth: 1.5, borderColor: color.border,
    },
    selectedVehicleCard: { borderColor: color.primary, borderWidth: 2, backgroundColor: '#fff8f2' },
    vehicleName: { fontSize: 16, fontWeight: 'bold', color: color.darkGray },
    vehicleInfo: { fontSize: 14, color: color.mediumGray, marginTop: 2 },
});