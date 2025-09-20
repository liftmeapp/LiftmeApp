//app/services/roadsidecar-service.tsx
import Map, { PinnedLocationData } from "@/components/Map";
import RotatingLoader from '@/components/RotatingLoader';
import RideOptionCard from '@/components/ServiceOption'; // Assuming ServiceOption component exists
import { BookingStage, LocationState, useBooking } from '@/context/BookingContext';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons'; // Ensure @expo/vector-icons is installed
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values'; // Required for UUID or similar libraries if used indirectly
import MapView from 'react-native-maps';
import { getAddressFromCoords } from '../../utils/locationUtils';


// Helper functions for responsive sizing
const windowWidth = (size: number) => (Dimensions.get('window').width * size) / 400;
const windowHeight = (size: number) => (Dimensions.get('window').height * size) / 400;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const SEARCH_DURATION_SECONDS = 300; // 5 minutes

// Color constants
const color = {
    lightGray: "#f1f1f1", // Lighter gray for backgrounds
    mediumGray: "#e0e0e0", // Medium gray for borders
    darkGray: "#666", // Darker gray for text
    textPrimary: "#333", // Primary text color
    textSecondary: "#555", // Secondary text color
    primary: "#b95528", // Your primary theme color
    success: "#4CAF50", // Success color
    white: "#ffffff", // White
    black: "#000000", // Black
    danger: '#e53935'
};

const ROADSIDE_ASSISTANCE_SERVICES = new Set([
    "Tire Fixing assistance (Fixing Puncture, changing spare)",
    "Battery Booting assistance",
    "Mechanical Assistance",
    "Car starting up assistance",
    "Car Break Assistance",
]);


// --- Main Component ---
export default function MainMap() {
    const mapRef = useRef<MapView>(null);
    const router = useRouter();
    const { getToken } = useAuth();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['15%', '45%', '75%'], []);
    const [isBottomSheetReady, setIsBottomSheetReady] = useState(false);

    const {
        currentStage,
        searchCountdown,
        searchError,
        pollData,
        selectedProvider,
        isBroadcasting,
        isConfirmingPayment,
        selectedService,
        selectedVehicle,
        pickupLocation,
        startBooking,
        cancelBooking,
        resetBookingFlow,
        confirmPayment,
        setStage,
        setSelectedService,
        setSelectedVehicle,
        setPickupLocation,
    } = useBooking();

    // --- Location ---
    // const [pickupLocation, setPickupLocation] = useState<LocationState>({ description: 'Current Location', place_id: 'current', latitude: null, longitude: null });
    const [isPinModeActive, setIsPinModeActive] = useState(false);
    const [pinnedLocation, setPinnedLocation] = useState<PinnedLocationData | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
   
    const [useCurrentLocation, setUseCurrentLocation] = useState(true);
    const [recentPlaces, setRecentPlaces] = useState<LocationState[]>([]);
    const [pinnedAddress, setPinnedAddress] = useState("Move map to set location...");
    
    // --- Data from API ---
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    // --- Loading & UI States ---
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [keyboardAvoidingHeight, setKeyboardAvoidingHeight] = useState(false);

    const filteredServices = useMemo(
        () => services.filter(service => ROADSIDE_ASSISTANCE_SERVICES.has(service.name)),
        [services]
    );

    // --- Initial Effect ---
    useEffect(() => {
        const timer = setTimeout(() => setIsBottomSheetReady(true), 100);
        // When the component mounts, if the booking flow is idle, start it.
        if (currentStage === BookingStage.IDLE) {
            setStage(BookingStage.SERVICE_SELECTION);
        }
        return () => clearTimeout(timer);
    }, []);

    // --- Sheet Snap Logic ---
    useEffect(() => {
        if (!isBottomSheetReady || !bottomSheetRef.current) return;
        const snap = (index: number) => setTimeout(() => {
            try { bottomSheetRef.current?.snapToIndex(index) } 
            catch (error) { console.log('Sheet snap error:', error) }
        }, 200);

        if (currentStage === BookingStage.LOCATION_CONFIRMATION) {
            setIsPinModeActive(true);
            snap(1); // Snap to 45% to show location confirmation UI
        } else {
            setIsPinModeActive(false);
            switch (currentStage) {
                case BookingStage.SERVICE_SELECTION: snap(2); break;
                case BookingStage.VEHICLE_SELECTION: snap(2); break;
                case BookingStage.SEARCHING_FOR_PROVIDER: snap(1); break;
                case BookingStage.CONFIRMED: snap(1); break;
                case BookingStage.PAYMENT: snap(2); break;
            }
        }
    }, [currentStage, isBottomSheetReady]);

    // --- Data Fetching (Initial) ---
    // --- Data Fetching (Initial) ---
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
            alert("Could not load data. Please try again.");
        } finally {
            setIsInitialLoading(false);
        }
        };
    fetchInitialData();
    }, []); // The empty array ensures this runs only ONCE when the component mounts.



    // --- Handler Functions ---
    const handlePinLocationChange = useCallback((location: PinnedLocationData) => {
        setIsGeocoding(true);
        setPinnedLocation(location);
        if (location.description !== "Could not fetch address" && location.description !== "Unknown Location") {
            setIsGeocoding(false);
        }
    }, []);

    const handleConfirmPin = () => {
        console.log("--- Step 3a: `handleConfirmPin` called ---");
        if (pinnedLocation && pinnedLocation.latitude && pinnedLocation.longitude) {
            const finalLocation = {
                latitude: pinnedLocation.latitude,
                longitude: pinnedLocation.longitude,
                description: pinnedLocation.description,
                place_id: 'pinned-location',
            };
            console.log("[ConfirmPin] Final location set:", finalLocation);
            setPickupLocation(finalLocation);
            
            startBooking({
                serviceType: 'ROADSIDE_ASSISTANCE',
                serviceId: selectedService.id,
                vehicleId: selectedVehicle.id,
                userLat: finalLocation.latitude,
                userLon: finalLocation.longitude,
            });

        } else {
            Alert.alert("Location Error", "Could not determine the pinned location. Please try again.");
            console.log("🔴 [ConfirmPin] Error: Pinned location is missing coordinates.");
        }
    };



    const debouncedGetAddress = useCallback(
        debounce(async () => {
            if (mapRef.current) {
                setIsGeocoding(true);
                const camera = await mapRef.current.getCamera();
                const address = await getAddressFromCoords(camera.center.latitude, camera.center.longitude);
                setPinnedAddress(address);
                setIsGeocoding(false);
            }
        }, 500),
        []
    );
    const handleMapReady = useCallback((ref: React.RefObject<MapView | null>) => {
        mapRef.current = ref.current;
    }, []);

    const handleServiceSelect = (service: any) => setSelectedService(service);
    const handleVehicleSelect = (vehicle: any) => setSelectedVehicle(vehicle);
    
    const handleSelectOnMap = () => setIsPinModeActive(true);



    const handleConfirmPayment = () => {
       confirmPayment();
    };

    const handlePlaceSelect = (place: any) => {
        setPickupLocation(place);
        setUseCurrentLocation(false);
        setKeyboardAvoidingHeight(false); // Hide keyboard/extra space
        if (!recentPlaces.some(p => p.place_id === place.place_id)) {
            setRecentPlaces(prev => [place, ...prev.slice(0, 4)]);
        }
    };

    // --- Navigation ---
    const handleGoBack = () => {
        switch (currentStage) {
            case BookingStage.VEHICLE_SELECTION:
                setStage(BookingStage.SERVICE_SELECTION);
                break;
            case BookingStage.LOCATION_CONFIRMATION:
                setStage(BookingStage.VEHICLE_SELECTION);
                break;
            case BookingStage.SEARCHING_FOR_PROVIDER:
                cancelBooking();
                break;
            case BookingStage.PAYMENT:
                setStage(BookingStage.LOCATION_CONFIRMATION);
                break;
        }
    };
    const navigateToAddVehicle = () => router.replace('/settings/vehicle-page/add-vehicle');

    // --- RENDER FUNCTIONS ---
    const renderVehicleItem = ({ item }: { item: any }) => {
        const isSelected = selectedVehicle?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.vehicleCard, isSelected && styles.selectedVehicleCard]}
                onPress={() => handleVehicleSelect(item)}
            >
                <View style={styles.vehicleCardContent}>
                    <View style={styles.vehicleIconContainer}>
                        <Ionicons name="car-outline" size={24} color={isSelected ? color.primary : color.textPrimary} />
                    </View>
                    <View style={styles.vehicleCardDetails}>
                        <Text style={styles.vehicleCardName}>{item.name}</Text>
                        <Text style={styles.vehicleCardInfo}>{item.brand} {item.model} • {item.year}</Text>
                        <Text style={styles.vehicleCardNumber}>{item.number}</Text>
                    </View>
                    {isSelected && (
                        <View style={styles.vehicleCardSelectedIndicator}>
                            <Ionicons name="checkmark-circle" size={24} color={color.primary} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };
    // --- Main Content Renderer (Handles Stages) ---
    
    const renderContent = () => {
        const getServiceInfo = () => services.find(s => s.id === selectedService?.id) || null;
    
        switch (currentStage) {
            case BookingStage.SERVICE_SELECTION:
                return (
                    <BottomSheetView style={styles.bottomSheetContainer}>
                        <Text style={styles.headerText}>Select Service</Text>
                        <View style={styles.contentArea}>
                        

                            {isInitialLoading ? (
                                <View style={styles.loadingContainer}>
                                    <RotatingLoader size={20} color={color.primary}/>
                                </View>
                            ) : (
                                <View>
                                
                                <FlatList
                                    data={filteredServices}
                                    keyExtractor={item => item.id}
                                    renderItem={({ item }) => (
                                        <RideOptionCard
                                            name={item.name}
                                            description={item.description}
                                            selected={selectedService?.id === item.id}
                                            onPress={() => handleServiceSelect(item)}
                                        />
                                    )}
                                    contentContainerStyle={{ paddingBottom: 10 }}
                                    showsVerticalScrollIndicator={false}
                                />
                                </View>
                            )}
                        </View>
                        {selectedService && (
                            <TouchableOpacity 
                                style={styles.inlineButton} 
                                onPress={() => setStage(BookingStage.VEHICLE_SELECTION)}
                            >
                                <Text style={styles.inlineButtonText}>Continue</Text>
                            </TouchableOpacity>
                        )}
                    </BottomSheetView>
                );
    
            // === STAGE 2: Vehicle Selection ===
            case BookingStage.VEHICLE_SELECTION: 
                return (
                    <BottomSheetView style={styles.bottomSheetContainer}>
                        <View style={styles.headerWithBack}>
                            <TouchableOpacity onPress={handleGoBack}>
                                <Ionicons name="arrow-back" size={24} color={color.primary} />
                            </TouchableOpacity>
                            <Text style={styles.headerText}>Select Your Vehicle</Text>
                            <View style={{width: 24}} />
                        </View>
                        
                        <View style={styles.contentArea}>
                            <FlatList
                                data={vehicles}
                                renderItem={renderVehicleItem}
                                keyExtractor={item => item.id}
                                ListHeaderComponent={() => (
                                    <View style={styles.summaryBox}>
                                        <Ionicons name="car-sport-outline" size={18} color={color.primary} style={styles.summaryIcon} />
                                        <Text style={styles.summaryText}>Service: {getServiceInfo()?.name || 'N/A'}</Text>
                                    </View>
                                )}
                                contentContainerStyle={{ paddingBottom: 10 }}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                        {selectedVehicle && (
                            <TouchableOpacity 
                                style={styles.inlineButton} 
                                onPress={() => setStage(BookingStage.LOCATION_CONFIRMATION)}
                            >
                                <Text style={styles.inlineButtonText}>Continue</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={styles.addVehicleButton} 
                            onPress={navigateToAddVehicle}>
                            <Ionicons name="add-circle-outline" size={20} color={color.white} />
                            <Text style={styles.addVehicleButtonText}>Add Vehicle</Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                );
    
            // === STAGE 3: Location Input (Final Version) ===
            case BookingStage.LOCATION_CONFIRMATION:
                return (
                <BottomSheetView style={styles.bottomSheetContainer}>
                    {/* Header with a back button */}
                    <View style={styles.headerWithBack}>
                        <TouchableOpacity onPress={handleGoBack}>
                            <Ionicons name="arrow-back" size={24} color={color.primary} />
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Confirm Your Location</Text>
                        {/* This view is a spacer to keep the title centered */}
                        <View style={{width: 24}} />
                    </View>

                    {/* A box to display the address being selected */}
                    <View style={styles.addressDisplayBox}>
                        <Ionicons name="location-outline" size={24} color={color.darkGray} />
                        <Text style={styles.addressDisplayText} numberOfLines={2}>
                            {isGeocoding
                                ? 'Locating...'
                                : (pinnedLocation?.description || 'Move the map to set location...')}
                        </Text>
                    </View>

                    {/* The main confirmation button */}
                    <TouchableOpacity
                        style={[styles.inlineButton, (isGeocoding || isBroadcasting) && styles.disabledButton]}
                        onPress={handleConfirmPin}
                        disabled={isGeocoding || isBroadcasting}>
                        {isBroadcasting ? (
                             <ActivityIndicator color={color.white} />
                        ) : (
                             <Text style={styles.inlineButtonText}>Find Nearby Garages</Text>
                        )}
                    </TouchableOpacity>

                    {/* A secondary action to cancel and go back */}
                    <TouchableOpacity
                        style={styles.cancelLink}
                        onPress={() => setStage(BookingStage.VEHICLE_SELECTION)}
                    >
                        <Text style={styles.cancelLinkText}>Go Back</Text>
                    </TouchableOpacity>
                </BottomSheetView>
                );

            // === STAGE 4: Searching for Provider ===
            case BookingStage.SEARCHING_FOR_PROVIDER:
            case BookingStage.CONFIRMED:
                const minutes = Math.floor(searchCountdown / 60);
                const seconds = searchCountdown % 60;
                if (searchError) {
                    const failureReason = searchError || "No providers were available to accept your request. Please try again later.";
                    return (
                        <BottomSheetView style={styles.bottomSheetContainer}>
                           <View style={styles.centeredMessageContainer}>
                               <Ionicons name="alert-circle-outline" size={60} color={color.danger} style={{marginBottom: 15}} />
                               <Text style={styles.headerText}>Request Unsuccessful</Text>
                               <Text style={styles.subHeaderText}>{failureReason}</Text>
                               <TouchableOpacity style={styles.inlineButton} onPress={handleGoBack}>
                                   <Text style={styles.inlineButtonText}>Go Back</Text>
                               </TouchableOpacity>
                           </View>
                        </BottomSheetView>
                   );
               }
               if (currentStage === BookingStage.CONFIRMED && selectedProvider) {
                return (
                   <BottomSheetView style={styles.bottomSheetContainer}>
                        <View style={styles.headerWithBack}>
                           <View style={{width: 24}} />
                           <Text style={styles.headerText}>Provider is on the way!</Text>
                           <View style={{width: 24}} />
                       </View>
                       <View style={styles.confirmationBanner}>
                           <Ionicons name="checkmark-circle" size={20} color={color.success} />
                           <Text style={styles.confirmationBannerText}>
                               {selectedProvider.name} has accepted your request!
                           </Text>
                       </View>
                       <View style={styles.tripDetailsContainer}>
                            <View style={styles.detailRow}>
                               <Text style={styles.tripDetailsLabel}>Est. Arrival:</Text>
                               <Text style={styles.tripDetailsValue}>{selectedProvider.eta || '--'} min</Text>
                           </View>
                            <View style={styles.detailRow}>
                               <Text style={styles.tripDetailsLabel}>Final Price:</Text>
                               <Text style={styles.priceValue}>₹{selectedProvider.finalPrice?.toFixed(2) || '0.00'}</Text>
                           </View>
                       </View>

                       <View style={styles.otpContainer}>
                           <Text style={styles.otpLabel}>Share this OTP with your provider upon arrival:</Text>
                           <Text style={styles.otpCode}>{selectedProvider.otp}</Text>
                       </View>
                   </BottomSheetView>
                );
           }

                return (
                    <BottomSheetView style={styles.bottomSheetContainer}>
                        <View style={styles.headerWithBack}>
                            <TouchableOpacity onPress={handleGoBack}>
                                <Ionicons name="arrow-back" size={24} color={color.primary} />
                            </TouchableOpacity>
                            <Text style={styles.headerText}>Searching</Text>
                            <View style={{width: 24}} />
                        </View>

                        {searchError ? (
                            <View style={styles.centeredMessageContainer}>
                                <Ionicons name="alert-circle-outline" size={60} color={color.danger} style={{marginBottom: 15}} />
                                <Text style={styles.headerText}>Request Failed</Text>
                                <Text style={styles.subHeaderText}>{searchError}</Text>
                                <TouchableOpacity style={styles.inlineButton} onPress={handleGoBack}>
                                    <Text style={styles.inlineButtonText}>Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.centeredMessageContainer}>
                                <RotatingLoader size={40} color={color.primary} />
                                <Text style={[styles.headerText, {marginTop: 20}]}>Contacting Garages</Text>
                                <Text style={styles.subHeaderText}>
                                    We've sent your request to all nearby garages. Please wait for one to accept.
                                </Text>
                                <View style={styles.countdownBox}>
                                    <Ionicons name="timer-outline" size={24} color={color.primary} />
                                    <Text style={styles.countdownText}>
                                        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.inlineButton, {backgroundColor: color.danger, marginTop: 20}]}
                                    onPress={handleGoBack}
                                >
                                    <Text style={styles.inlineButtonText}>Cancel Search</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </BottomSheetView>
                );
            case BookingStage.EXPIRED:
            case BookingStage.CANCELLED:
                const failureReason = searchError || "The request was cancelled or expired.";
                return (
                    <BottomSheetView style={styles.bottomSheetContainer}>
                       <View style={styles.centeredMessageContainer}>
                           <Ionicons name="alert-circle-outline" size={60} color={color.danger} style={{marginBottom: 15}} />
                           <Text style={styles.headerText}>Request Unsuccessful</Text>
                           <Text style={styles.subHeaderText}>{failureReason}</Text>
                           <TouchableOpacity style={styles.inlineButton} onPress={handleGoBack}>
                               <Text style={styles.inlineButtonText}>Go Back</Text>
                           </TouchableOpacity>
                       </View>
                    </BottomSheetView>
               );

            // === STAGE 5: Payment / Confirmation ===
            case BookingStage.PAYMENT:
                const finalPrice = selectedProvider?.finalPrice || 0;
                return (
                    <BottomSheetView style={styles.bottomSheetContainer}>
                        <View style={styles.headerWithBack}>
                            <TouchableOpacity onPress={handleGoBack}>
                                <Ionicons name="arrow-back" size={24} color={color.primary} />
                            </TouchableOpacity>
                            <Text style={styles.headerText}>Confirm & Pay</Text>
                            <View style={{width: 24}} />
                        </View>
                        
                        <View style={styles.confirmationBanner}>
                            <Ionicons name="checkmark-circle" size={20} color={color.success} />
                            <Text style={styles.confirmationBannerText}>
                                {selectedProvider?.name || 'A provider'} has accepted your request!
                            </Text>
                        </View>
                        
                        <View style={styles.contentArea}>
                            <View style={styles.tripDetailsContainer}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.tripDetailsLabel}>Garage:</Text>
                                    <Text style={styles.tripDetailsValue}>{selectedProvider?.name || 'N/A'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.tripDetailsLabel}>Est. Arrival:</Text>
                                    <Text style={styles.tripDetailsValue}>
                                        {selectedProvider?.eta ? `${selectedProvider.eta} min` : 'N/A'}
                                    </Text>
                                </View>
    
                                {/* Final Price Summary */}
                                <View style={styles.priceSummary}>
                                    <Text style={styles.priceLabel}>Total (Service + Distance):</Text>
                                    <Text style={styles.priceValue}>₹{finalPrice.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
    
                        <TouchableOpacity 
                            style={[styles.confirmButton, isConfirmingPayment && {backgroundColor: color.darkGray}]} 
                            onPress={handleConfirmPayment} 
                            disabled={isConfirmingPayment}
                        >
                            {isConfirmingPayment ? (
                                <ActivityIndicator color={color.white}/>
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    Pay ₹{finalPrice.toFixed(2)} & Confirm
                                </Text>
                            )}
                        </TouchableOpacity>
                    </BottomSheetView>
                );
    
            default: 
                return null;
        }
    };
    
    // --- Final Component Return ---
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Map 
                    isPinningLocation={isPinModeActive}
                    onPinLocationChange={handlePinLocationChange}
                    onMapReady={handleMapReady}
                />
                
                {isBottomSheetReady && (
                    <BottomSheet
                        ref={bottomSheetRef}
                        index={1} snapPoints={snapPoints}
                        enablePanDownToClose={false}
                        handleIndicatorStyle={{ backgroundColor: color.primary, width: 50 }}
                        keyboardBlurBehavior="restore"
                        android_keyboardInputMode='adjustResize'
                        containerStyle={{ zIndex: 1000 }}
                    >
                        {renderContent()}
                    </BottomSheet>
                )}
            </View>
        </GestureHandlerRootView>
    );
};
    
// --- Styles ---

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: color.white 
    },
    bottomSheetContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: color.white,
        zIndex:999
    },
    headerText: { 
        textAlign: 'center', 
        fontSize: windowWidth(20), 
        fontWeight: "600", 
        marginBottom: 10, 
        color: color.textPrimary 
    },
    headerWithBack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingTop: 15,
    },
    contentArea: {
        flex: 1,
        marginBottom: 10
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    // New inline button style for proper positioning
    inlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.primary,
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 35,
    },
    inlineElectricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBlockColor: 'green',
        borderWidth:2,
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 30,
        marginBottom: 35,
    },
    inlineButtonText: { 
        color: color.white, 
        fontSize: 16, 
        fontWeight: '600', 
        paddingHorizontal: 12
    },
    inlineElectricButtonText: { 
        color: 'green', 
        fontSize: 16, 
        fontWeight: '600', 
        paddingHorizontal: 12
    },
    addVehicleButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: color.primary, 
        paddingVertical: 12, 
        paddingHorizontal: 14, 
        borderRadius: 8, 
        marginTop: 10,
        marginBottom: 5,
    },
    addVehicleButtonText: { 
        color: color.white, 
        fontSize: 15, 
        fontWeight: '500', 
        marginLeft: 8 
    },
    confirmButton: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: color.success, 
        paddingVertical: 15, 
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 10,
    },
    confirmButtonText: { 
        color: color.white, 
        fontSize: 16, 
        fontWeight: '600' 
    },
    subHeaderText: { 
        textAlign: 'center', 
        fontSize: 14, 
        color: color.darkGray, 
        marginBottom: 15, 
        paddingHorizontal: 20 
    },
    summaryBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: color.lightGray, 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        borderRadius: 6, 
        marginBottom: 15 
    },
    summaryIcon: { 
        marginRight: 8 
    },
    summaryText: { 
        fontSize: 13, 
        color: color.textSecondary, 
        fontWeight: '500', 
        flexShrink: 1 
    },
    vehicleCard: { 
        backgroundColor: color.white, 
        borderRadius: 8, 
        marginBottom: 10, 
        padding: 14, 
        shadowColor: color.black, 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 3, 
        elevation: 2, 
        borderWidth: 1, 
        borderColor: color.mediumGray 
    },
    selectedVehicleCard: { 
        borderColor: color.primary, 
        borderWidth: 1.5, 
        backgroundColor: '#fffaf7' 
    },
    vehicleCardContent: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    vehicleIconContainer: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: color.lightGray, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12 
    },
    vehicleCardDetails: { 
        flex: 1 
    },
    vehicleCardName: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: color.textPrimary 
    },
    vehicleCardInfo: { 
        fontSize: 13, 
        color: color.darkGray, 
        marginTop: 3 
    },
    vehicleCardNumber: { 
        fontSize: 13, 
        color: '#888', 
        marginTop: 2 
    },
    vehicleCardSelectedIndicator: { 
        marginLeft: 'auto' 
    },
    locationBox: {
        borderWidth: 1, 
        borderColor: color.mediumGray, 
        borderRadius: 8, 
        padding: 12, 
        backgroundColor: color.white, 
        marginBottom: 15,
    },
    locationLabel: { 
        fontSize: 14, 
        color: color.textSecondary, 
        fontWeight: '500', 
        marginBottom: 8 
    },
    currentLocationButton: {
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: "#e9f5ff", 
        borderRadius: 20,
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        borderColor: '#cce0ff', 
        borderWidth: 1, 
        marginTop: 8,
    },
    currentLocationText: { 
        color: color.primary, 
        fontSize: 15, 
        fontWeight: '500', 
        marginLeft: 8 
    },
    pinnedLocationDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#e9f5ff",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderColor: '#cce0ff',
        borderWidth: 1,
        marginTop: 8,
    },
    selectOnMapButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: color.white, 
        paddingVertical: 12, 
        paddingHorizontal: 14, 
        borderRadius: 8, 
        marginTop: 10, 
        borderWidth: 1,
        borderColor: color.primary,
    },
    selectOnMapButtonText: { 
        color: color.primary, 
        fontSize: 15, 
        fontWeight: '500', 
        marginLeft: 8 
    },
    centeredMessageContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingBottom: 50 
    },
    countdownBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: color.lightGray, 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        borderRadius: 12, 
        marginTop: 20 
    },
    countdownText: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: color.primary, 
        marginLeft: 10, 
        fontVariant: ['tabular-nums'] 
    },
    confirmationBanner: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#e8f5e9', 
        padding: 14, 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: color.success, 
        marginBottom: 15 
    },
    confirmationBannerText: { 
        color: '#2e7d32', 
        fontSize: 15, 
        fontWeight: '500', 
        marginLeft: 10, 
        flexShrink: 1 
    },
    tripDetailsContainer: { 
        backgroundColor: color.white, 
        borderRadius: 8, 
        padding: 16, 
        borderWidth: 1, 
        borderColor: color.mediumGray 
    },
    detailRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 12, 
        alignItems: 'flex-start' 
    },
    tripDetailsLabel: { 
        fontSize: 14, 
        color: color.darkGray, 
        fontWeight: '500', 
        marginRight: 10 
    },
    tripDetailsValue: { 
        fontSize: 14, 
        color: color.textPrimary, 
        fontWeight: '500', 
        textAlign: 'right', 
        flexShrink: 1 
    },
    priceSummary: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        borderTopWidth: 1, 
        borderTopColor: color.mediumGray, 
        paddingTop: 15, 
        marginTop: 5 
    },
    priceLabel: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: color.textPrimary 
    },
    priceValue: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: color.primary 
    },
    pinHeader: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 15,
        color: color.textPrimary,
    },
    addressDisplayBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.lightGray,
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        minHeight: 60,
    },
    addressDisplayText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: color.textPrimary,
    },
    cancelLink: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    cancelLinkText: {
        color: color.textSecondary,
        fontSize: 15,
        fontWeight: '500'
    },
    errorText: {
        color: color.danger,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '500',
        paddingHorizontal: 16,
    },
    disabledButton: {
        backgroundColor: color.darkGray,
    },
    otpContainer: {
        marginTop: 20,
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff8e1',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffecb3'
    },
    otpLabel: {
        fontSize: 14,
        color: color.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 10,
    },
    otpCode: {
        fontSize: 32,
        fontWeight: 'bold',
        color: color.primary,
        letterSpacing: 8,
    },
});

