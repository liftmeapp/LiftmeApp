import RotatingLoader from '@/components/RotatingLoader';
import TowMap, { PinnedLocationData } from "@/components/TowMap";
import { TowingBookingStage, useTowingBooking } from '@/context/TowingBookingContext';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
const TowingServiceMapContent = () => {
    const router = useRouter();
    const { getToken } = useAuth();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['45%', '85%'], []);

    // --- STATE MANAGEMENT ---
    const [savedCards, setSavedCards] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [isFetchingCards, setIsFetchingCards] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CASH');

    const {
        currentStage, setCurrentStage,
        vehicles, 
        selectedVehicle, setSelectedVehicle,
        pickupLocation, setPickupLocation,
        destinationLocation, setDestinationLocation,
        searchError,
        selectedProvider,
        isInitialLoading,
        isConfirmingPayment, confirmPayment, confirmCashBooking,
        startTowingBooking, startTowToGarageBooking, cancelTowingBooking,
        resetTowingBookingFlow,
        searchCountdown, eligibleTruckCount
    } = useTowingBooking();
            
    const fetchSavedCards = useCallback(async () => {
        setIsFetchingCards(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed.");
            const res = await fetch(`${API_BASE_URL}/api/stripe/payment-methods`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error("Could not load your saved cards.");
            const cards = await res.json();
            setSavedCards(cards);
            
        } catch (error: any) {
            Alert.alert("Error loading cards", error.message);
        } finally {
            setIsFetchingCards(false);
        }
    }, []);
        
    useEffect(() => {
        if (!bottomSheetRef.current) return;
        const snap = (index: number) => { try { bottomSheetRef.current?.snapToIndex(index); } catch (e) {} };
        
        if (currentStage === TowingBookingStage.CONFIRMED) {
            router.replace('/(root)/(tabs)/orders');
            resetTowingBookingFlow();
            return;
        }

        switch(currentStage) {
            case TowingBookingStage.PICKUP_SELECTION:
            case TowingBookingStage.DESTINATION_SELECTION:
            case TowingBookingStage.VEHICLE_SELECTION:
                snap(1); 
                break;
            case TowingBookingStage.PAYMENT:
                snap(1); 
                fetchSavedCards();
                break;
            case TowingBookingStage.SEARCHING_FOR_PROVIDER:
                snap(0); 
                break;
        }
    }, [currentStage, fetchSavedCards, router]);

    const handleLocationChange = (location: PinnedLocationData) => {
        if (currentStage === TowingBookingStage.PICKUP_SELECTION) setPickupLocation(location);
        if (currentStage === TowingBookingStage.DESTINATION_SELECTION) setDestinationLocation(location);
    };
    
    const handleConfirmLocation = () => {
        if (currentStage === TowingBookingStage.PICKUP_SELECTION && pickupLocation) {
            setCurrentStage(TowingBookingStage.DESTINATION_SELECTION);
        } else if (currentStage === TowingBookingStage.DESTINATION_SELECTION && destinationLocation) {
            startTowingBooking();
        }
    };

    const handleConfirmVehicle = () => {
        if (selectedVehicle) {
            setCurrentStage(TowingBookingStage.PICKUP_SELECTION);
        } else {
            Alert.alert("Please select a vehicle to continue.");
        }
    };

    const handleGoBack = () => {
        switch(currentStage) {
            case TowingBookingStage.VEHICLE_SELECTION: router.back(); break;
            case TowingBookingStage.PICKUP_SELECTION: setCurrentStage(TowingBookingStage.VEHICLE_SELECTION); break;
            case TowingBookingStage.DESTINATION_SELECTION: setCurrentStage(TowingBookingStage.PICKUP_SELECTION); break;
            case TowingBookingStage.SEARCHING_FOR_PROVIDER:
            case TowingBookingStage.ERROR:
            case TowingBookingStage.CANCELLED:
                resetTowingBookingFlow();
                break;
            case TowingBookingStage.CONFIRMED:
                router.back();
                break;
        }
    };

    const handleFindNearbyGarage = () => {
        if (!pickupLocation) {
            Alert.alert("Set Pickup First", "Please set a pickup location before finding a nearby garage.");
            return;
        }
        if (!selectedVehicle) {
            Alert.alert("Select Vehicle", "An unknown error occurred. Please go back and select your vehicle again.");
            setCurrentStage(TowingBookingStage.VEHICLE_SELECTION);
            return;
        }
        startTowToGarageBooking();
    };

    const renderLocationContent = () => {
        const isPickup = currentStage === TowingBookingStage.PICKUP_SELECTION;
        const location = isPickup ? pickupLocation : destinationLocation;
        const title = isPickup ? "Set Pickup Location" : "Set Drop-off Destination";
        const buttonDisabled = !location || !location.latitude;

        return (
            <BottomSheetView style={styles.contentContainer}>
                 <View style={styles.headerWithBack}>
                    <TouchableOpacity onPress={handleGoBack}>
                        <Ionicons name="arrow-back-circle-outline" size={30} color={color.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>{title}</Text>
                    <View style={{width: 30}} />
                 </View>
                 <View style={styles.addressDisplayBox}>
                    <Ionicons name="location-sharp" size={24} color={color.primary} />
                    <Text style={styles.addressDisplayText} numberOfLines={2}>
                        {location?.description || "Move the map to set location..."}
                    </Text>
                </View>

                {searchError && (
                    <View style={styles.searchError}>
                        <Text style={styles.searchErrorText}>{searchError}</Text>
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.confirmButton, buttonDisabled && styles.disabledButton]} 
                    onPress={handleConfirmLocation}
                    disabled={buttonDisabled}
                >
                    <Text style={styles.confirmButtonText}>{isPickup ? "Confirm Pickup" : "Confirm Custom Destination"}</Text>
                </TouchableOpacity>

                {!isPickup && (
                    <>
                        <View style={styles.orSeparator}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        <TouchableOpacity 
                            style={styles.garageButton} 
                            onPress={handleFindNearbyGarage}
                        >
                            <Ionicons name="business-outline" size={22} color={color.primary} />
                            <Text style={styles.garageButtonText}>Drop at a Nearby Garage</Text>
                        </TouchableOpacity>
                    </>
                )}
            </BottomSheetView>
        );
    };

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
                        style={styles.confirmButton} 
                        onPress={handleConfirmVehicle}
                    >
                        <Text style={styles.confirmButtonText}>Confirm Vehicle & Set Pickup</Text>
                    </TouchableOpacity>
                )}
                 <TouchableOpacity style={styles.addVehicleButton} onPress={() => router.push('/(root)/(tabs)/settings/vehicle-page/add-vehicle')}>
                    <Ionicons name="add-circle-outline" size={22} color={color.white} />
                    <Text style={styles.addVehicleButtonText}>Add a New Vehicle</Text>
                </TouchableOpacity>
            </BottomSheetView>
        );
    };    
    const renderSearchingContent = () => {
         const minutes = Math.floor(searchCountdown / 60);
         const seconds = searchCountdown % 60;

        const isTowToGarage = !destinationLocation; 

        let headerText = "Finding Nearby Trucks...";
        let subHeaderText = "Broadcasting your request to all available tow trucks in the area. Please wait for one to accept.";

        if (isTowToGarage) {
            headerText = "Searching for Nearby Garages...";
            subHeaderText = "Finding a suitable garage for your vehicle. This may take a moment.";
        } else {
            if (eligibleTruckCount > 0) {
                subHeaderText = `We've sent your request to ${eligibleTruckCount} nearby tow trucks. Please wait for one to accept.`;
            }
        }

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

         if (currentStage === TowingBookingStage.CONFIRMED && selectedProvider) {
              return (
                 <BottomSheetView style={[styles.contentContainer, styles.centered]}>
                     <Ionicons name="checkmark-circle" size={60} color={color.success} />
                     <Text style={styles.headerText}>Truck Confirmed!</Text>
                     <Text style={styles.subHeaderText}>{selectedProvider.name} is on the way.</Text>
                 </BottomSheetView>
              );
         }

         return (
             <BottomSheetView style={[styles.contentContainer, styles.centered]}>
                 <RotatingLoader color={color.primary} size={50} />
                 <Text style={styles.headerText}>{headerText}</Text>
                 <Text style={styles.subHeaderText}>{subHeaderText}</Text>
                 <View style={styles.countdownBox}>
                     <Ionicons name="timer-outline" size={24} color={color.primary} />
                     <Text style={styles.countdownText}>
                         {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                     </Text>
                 </View>
                 <TouchableOpacity
                     style={[styles.confirmButton, {backgroundColor: color.danger, marginTop: 20}]}
                     onPress={cancelTowingBooking}
                 >
                     <Text style={styles.confirmButtonText}>Cancel Search</Text>
                 </TouchableOpacity>
             </BottomSheetView>
         );
    };

    const renderContent = () => {
        switch(currentStage) {
            case TowingBookingStage.VEHICLE_SELECTION:
                return renderVehicleContent();
            case TowingBookingStage.PICKUP_SELECTION:
            case TowingBookingStage.DESTINATION_SELECTION:
                return renderLocationContent();
            case TowingBookingStage.PAYMENT:
                const finalPrice = selectedProvider?.finalPrice || 0;
                return (
                    <BottomSheetView style={styles.contentContainer}>
                        <Text style={styles.headerText}>Confirm & Pay</Text>
                        
                        <View style={styles.confirmationBanner}>
                            <Ionicons name="checkmark-circle" size={20} color={color.success} />
                            <Text style={styles.confirmationBannerText}>
                                {selectedProvider?.name || 'A provider'} has accepted your request!
                            </Text>
                        </View>
                        
                        <View style={styles.contentArea}>
                            <Text style={styles.paymentMethodHeader}>Select Payment Method</Text>
                            {isFetchingCards ? (
                                <ActivityIndicator style={{ marginVertical: 20 }} size="small" color={color.primary} />
                            ) : (
                                <View>
                                    <TouchableOpacity
                                        style={[styles.cardItem, paymentMethod === 'CASH' && styles.selectedCardItem]}
                                        onPress={() => {
                                            setPaymentMethod('CASH');
                                            setSelectedCard(null);
                                        }}
                                    >
                                        <Ionicons name={paymentMethod === 'CASH' ? "radio-button-on" : "radio-button-off"} size={24} color={color.primary} />
                                        <Ionicons name="cash-outline" size={24} color="#555" style={{marginHorizontal: 15}} />
                                        <Text style={styles.cardText}>Pay with Cash</Text>
                                    </TouchableOpacity>

                                    <FlatList
                                        data={savedCards}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity 
                                                style={[styles.cardItem, selectedCard === item.id && styles.selectedCardItem]}
                                                onPress={() => {
                                                    setPaymentMethod('CARD');
                                                    setSelectedCard(item.id);
                                                }}
                                            >
                                                <Ionicons name={selectedCard === item.id ? "radio-button-on" : "radio-button-off"} size={24} color={color.primary} />
                                                <Ionicons name="card" size={24} color="#555" style={{marginHorizontal: 15}} />
                                                <Text style={styles.cardText}>{item.brand.toUpperCase()} ending in {item.last4}</Text>
                                            </TouchableOpacity>
                                        )}
                                        keyExtractor={item => item.id}
                                        ListEmptyComponent={
                                            <View style={styles.centeredMessageContainer}>
                                                <Text style={styles.subHeaderText}>No saved cards found.</Text>
                                            </View>
                                        }
                                    />
                                </View>
                            )}
                            <TouchableOpacity style={styles.addCardButton} onPress={() => router.push('/(root)/(tabs)/settings/payments')}>
                                <Ionicons name="add-circle-outline" size={20} color={color.primary} />
                                <Text style={styles.addCardButtonText}>Add New Card</Text>
                            </TouchableOpacity>
                            <View style={styles.priceBreakdownContainer}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Distance</Text>
                                    <Text style={styles.priceValue}>{selectedProvider?.distance?.toFixed(1) || 'N/A'} km</Text>
                                </View>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Rate</Text>
                                    <Text style={styles.priceValue}>INR {selectedProvider?.pricePerKm?.toFixed(2) || '0.00'} / km</Text>
                                </View>
                                <View style={[styles.priceRow, styles.totalRow]}>
                                    <Text style={[styles.priceLabel, styles.totalLabel]}>Total Fare</Text>
                                    <Text style={[styles.priceValue, styles.totalValue]}>INR {finalPrice.toFixed(2)}</Text>
                                </View>
                            </View>
                            <Text style={styles.pricingExplanation}>
                                *Price is calculated based on your vehicle type's rate per kilometer.
                            </Text>
                        </View>
    
                        <TouchableOpacity 
                            style={[styles.confirmButton, (isConfirmingPayment || (paymentMethod === 'CARD' && !selectedCard)) && {backgroundColor: color.darkGray}]} 
                            onPress={() => {
                                if (paymentMethod === 'CARD') {
                                    if (!selectedCard) {
                                        Alert.alert("Payment Method", "Please select a payment method to continue.");
                                        return;
                                    }
                                    confirmPayment({ paymentMethodId: selectedCard });
                                } else {
                                    confirmCashBooking();
                                }
                            }} 
                            disabled={isConfirmingPayment || (paymentMethod === 'CARD' && !selectedCard)}
                        >
                            {isConfirmingPayment ? (
                                <ActivityIndicator color={color.white}/>
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    {paymentMethod === 'CASH' ? 'Confirm Booking' : `Pay INR ${finalPrice.toFixed(2)} & Confirm`}
                                </Text>)}
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.cancelBookingButton, isConfirmingPayment && styles.disabledButton]} 
                            onPress={cancelTowingBooking} 
                            disabled={isConfirmingPayment}
                        >
                            <Text style={styles.cancelBookingButtonText}>Cancel Booking</Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                );
            case TowingBookingStage.SEARCHING_FOR_PROVIDER:
            case TowingBookingStage.CONFIRMED:
            case TowingBookingStage.CANCELLED:
            case TowingBookingStage.ERROR:
                return renderSearchingContent();
            default:
                return null;
        }
    };
    
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TowMap
                    isPinningLocation={currentStage === TowingBookingStage.PICKUP_SELECTION || currentStage === TowingBookingStage.DESTINATION_SELECTION}
                    onPinLocationChange={handleLocationChange}
                    pickupMarker={pickupLocation}
                    destinationMarker={destinationLocation}
                    currentStage={currentStage}
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
            </View>
        </GestureHandlerRootView>
    );
};

export default TowingServiceMapContent;

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
        justifyContent: 'space-between',
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
    searchError: {
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    searchErrorText: { color: '#c62828', fontSize: 14 },
    confirmationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: color.success, marginBottom: 15 },
    confirmationBannerText: { color: '#2e7d32', fontSize: 15, fontWeight: '500', marginLeft: 10, flexShrink: 1 },
    priceBreakdownContainer: { marginVertical: 15, padding: 15, backgroundColor: color.lightGray, borderRadius: 10 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    totalRow: { borderTopWidth: 1, borderTopColor: color.border, marginTop: 8, paddingTop: 12 },
    priceLabel: { fontSize: 16, color: color.mediumGray },
    priceValue: { fontSize: 16, fontWeight: '500', color: color.darkGray },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: color.darkGray },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: color.primary },
    contentArea: { flex: 1, marginBottom: 20 },
    paymentMethodHeader: { fontSize: 16, fontWeight: '600', color: color.darkGray, marginBottom: 15 },
    cardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: color.border },
    selectedCardItem: { borderColor: color.primary, backgroundColor: '#f8f9ff', borderWidth: 1.5 },
    cardText: { fontSize: 15, color: color.darkGray, flex: 1 },
    centeredMessageContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
    addCardButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: color.primary, borderRadius: 10, marginVertical: 10, borderStyle: 'dashed' },
    addCardButtonText: { color: color.primary, fontSize: 15, fontWeight: '500', marginLeft: 8 },
    countdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9ff', padding: 12, borderRadius: 8, marginVertical: 15, borderWidth: 1, borderColor: '#e0e5ff' },
    countdownText: { fontSize: 24, fontWeight: 'bold', color: color.primary, marginLeft: 8, fontVariant: ['tabular-nums'] },
    orSeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    separatorLine: { flex: 1, height: 1, backgroundColor: color.border },
    orText: { marginHorizontal: 10, color: color.mediumGray, fontWeight: '600' },
    garageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff8f2', padding: 15, borderRadius: 10, borderWidth: 1.5, borderColor: color.primary, borderStyle: 'solid' },
    garageButtonText: { color: color.primary, fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    cancelBookingButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: color.danger, paddingVertical: 15, borderRadius: 10, marginTop: 10 },
    cancelBookingButtonText: { color: color.white, fontSize: 16, fontWeight: '600',paddingBottom: 10 },
    pricingExplanation: {
        fontSize: 12,
        color: color.mediumGray,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
    },
    addVehicleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#27ae60',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 4,
    },
    addVehicleButtonText: {
        color: color.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
