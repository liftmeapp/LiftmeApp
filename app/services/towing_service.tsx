// /app/services/towing_service.tsx
import RotatingLoader from '@/components/RotatingLoader';
import TowMap, { PinnedLocationData } from "@/components/TowMap";
import { TowingBookingProvider, TowingBookingStage, useTowingBooking } from '@/context/TowingBookingContext';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'; // Import GooglePlacesAutocomplete

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const SEARCH_DURATION_SECONDS = 300; // 5 minutes
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY; // Import GOOGLE_API_KEY

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
    // const { getToken } = useAuth(); // getToken is now used within the context
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '65%'], []);

    // --- STATE MANAGEMENT ---
    const [showPlaceSearch, setShowPlaceSearch] = useState(false); // New state for place search visibility

    const {
        currentStage, setCurrentStage,
        vehicles, fetchUserVehicles,
        selectedVehicle, setSelectedVehicle,
        pickupLocation, setPickupLocation,
        destinationLocation, setDestinationLocation,
        searchError, setSearchError,
        currentBookingId, setBookingId,
        selectedProvider, setConfirmedProvider,
        isInitialLoading,
        isBroadcasting, setIsBroadcasting,
        isConfirmingPayment, confirmPayment, // Added for payment stage
        startTowingBooking, cancelTowingBooking, resetTowingBookingFlow,
        searchCountdown, eligibleTruckCount
    } = useTowingBooking();

    // --- EFFECTS ---

    // Adjust bottom sheet position based on the current stage
    useEffect(() => {
        if (!bottomSheetRef.current) return;
        const snap = (index: number) => { try { bottomSheetRef.current?.snapToIndex(index); } catch (e) {} };
        
        switch(currentStage) {
            case TowingBookingStage.PICKUP_SELECTION:
            case TowingBookingStage.DESTINATION_SELECTION:
            case TowingBookingStage.VEHICLE_SELECTION:
                snap(1); // Higher sheet for selection
                break;
            case TowingBookingStage.PAYMENT:
                snap(1); // Higher sheet for payment
                break;
            case TowingBookingStage.SEARCHING_FOR_PROVIDER:
            case TowingBookingStage.CONFIRMED:
                snap(0); // Lower sheet to show map
                break;
        }
    }, [currentStage]);



    // --- ACTION HANDLERS ---

    // Update location state when map pin moves
    const handleLocationChange = (location: PinnedLocationData) => {
        if (currentStage === TowingBookingStage.PICKUP_SELECTION) setPickupLocation(location);
        if (currentStage === TowingBookingStage.DESTINATION_SELECTION) setDestinationLocation(location);
    };
    
    // Advance to the next stage after confirming a location
    const handleConfirmLocation = () => {
        if (currentStage === TowingBookingStage.PICKUP_SELECTION && pickupLocation) {
            setCurrentStage(TowingBookingStage.DESTINATION_SELECTION);
            setShowPlaceSearch(false); // Hide search when moving to next stage
        } else if (currentStage === TowingBookingStage.DESTINATION_SELECTION && destinationLocation) {
            setCurrentStage(TowingBookingStage.VEHICLE_SELECTION);
            setShowPlaceSearch(false); // Hide search when moving to next stage
        }
    };

    // Main function to broadcast the towing request to the API
    const handleBroadcastRequest = async () => {
        await startTowingBooking();
    };

    // Handle back navigation between stages
    const handleGoBack = () => {
        switch(currentStage) {
            case TowingBookingStage.DESTINATION_SELECTION: setCurrentStage(TowingBookingStage.PICKUP_SELECTION); setShowPlaceSearch(false); break;
            case TowingBookingStage.VEHICLE_SELECTION: setCurrentStage(TowingBookingStage.DESTINATION_SELECTION); setShowPlaceSearch(false); break;
            case TowingBookingStage.SEARCHING_FOR_PROVIDER:
            case TowingBookingStage.CONFIRMED:
            case TowingBookingStage.ERROR:
            case TowingBookingStage.CANCELLED:
                resetTowingBookingFlow();
                router.replace('/(root)/(tabs)/home');
                break;
        }
    };

    // Helper function to geocode an address and update location state
    const geocodeAndSetLocation = async (address: string, setLocation: (location: PinnedLocationData | null) => void) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
            );
            const json = await response.json();
            
            if (json.results && json.results.length > 0) {
                const { lat, lng } = json.results[0].geometry.location;
                const description = json.results[0].formatted_address;
                setLocation({ latitude: lat, longitude: lng, description });
                setSearchError(null); // Clear search error on successful geocode
            } else {
                Alert.alert("Location Not Found", "Could not find coordinates for the entered address.");
                setSearchError('Location not found');
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
            Alert.alert("Error", "Failed to find location. Please try again.");
            setSearchError('Failed to find location');
        }
    };

    // Handle location selection from Google Places Autocomplete
    const handlePlaceSelect = (data: any, details: any = null) => {
        setSearchError(null); // Clear any existing errors
        if (details?.geometry?.location) {
            const { lat, lng } = details.geometry.location;
            const description = details.formatted_address || data.description;
            const newLocation: PinnedLocationData = { latitude: lat, longitude: lng, description };

            if (currentStage === TowingBookingStage.PICKUP_SELECTION) {
                setPickupLocation(newLocation);
            } else if (currentStage === TowingBookingStage.DESTINATION_SELECTION) {
                setDestinationLocation(newLocation);
            }
            setShowPlaceSearch(false); // Hide search after selection
        } else if (data?.description) {
            // Fallback: try to geocode the description
            geocodeAndSetLocation(data.description, currentStage === TowingBookingStage.PICKUP_SELECTION ? setPickupLocation : setDestinationLocation);
            setShowPlaceSearch(false); // Hide search after selection
        } else {
            console.warn('⚠️ [TowingServiceMap] No location data found in search result');
            setSearchError('Location not found');
        }
    };

    // --- RENDER FUNCTIONS ---

    // Renders the UI for pickup and destination selection
    const renderLocationContent = () => {
        const isPickup = currentStage === TowingBookingStage.PICKUP_SELECTION;
        const location = isPickup ? pickupLocation : destinationLocation;
        const title = isPickup ? "Set Pickup Location" : "Set Drop-off Destination";
        const buttonDisabled = !location || !location.latitude;

        return (
            <BottomSheetView style={styles.contentContainer}>
                 <Text style={styles.headerText}>{title}</Text>
                 <TouchableOpacity 
                    style={styles.addressDisplayBox} 
                    onPress={() => setShowPlaceSearch(!showPlaceSearch)} // Toggle search visibility
                >
                    <Ionicons name="location-sharp" size={24} color={color.primary} />
                    <Text style={styles.addressDisplayText} numberOfLines={2}>
                        {location?.description || "Tap to search or move map..."}
                    </Text>
                    <Ionicons name="search" size={24} color={color.mediumGray} />
                </TouchableOpacity>

                {showPlaceSearch && GOOGLE_API_KEY && GOOGLE_API_KEY.length > 20 && (
                    <GooglePlacesAutocomplete
                        placeholder="Search for a place"
                        fetchDetails={true}
                        enablePoweredByContainer={false}
                        minLength={2}
                        debounce={300}
                        timeout={20000}
                        enableHighAccuracyLocation={true}

                        
                        // Main search handler
                        onPress={handlePlaceSelect}
                        
                        // Error handlers
                        onFail={(error) => {
                            console.error('🔴 [TowingServiceMap] Google Places Autocomplete error:', error);
                            setSearchError('Search temporarily unavailable');
                        }}
                        onTimeout={() => {
                            console.log('⏰ [TowingServiceMap] Google Places request timed out');
                            setSearchError('Search timed out, please try again');
                        }}
                        onNotFound={() => {
                            console.log('🔍 [TowingServiceMap] No results found');
                            setSearchError('No results found');
                        }}
                        
                        // Search configuration
                        query={{
                            key: GOOGLE_API_KEY,
                            language: 'en',
                            components: 'country:in',
                            types: '(cities)', // Focus on cities, establishments, and geocoding
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

                {/* Show error message if search is not working */}
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

                {/* Show message if Google API key is missing or invalid */}
                {(!GOOGLE_API_KEY || GOOGLE_API_KEY.length <= 20) && showPlaceSearch && (
                    <View style={styles.searchError}>
                        <Text style={styles.searchErrorText}>Search unavailable - API key needed</Text>
                    </View>
                )}

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
         const minutes = Math.floor(searchCountdown / 60);
         const seconds = searchCountdown % 60;

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
                     {/* Add ETA, Price, OTP here later */}
                 </BottomSheetView>
              );
         }

         return (
             <BottomSheetView style={[styles.contentContainer, styles.centered]}>
                 <RotatingLoader color={color.primary} size={50} />
                 <Text style={styles.headerText}>Finding Nearby Trucks...</Text>
                 <Text style={styles.subHeaderText}>
                    {eligibleTruckCount > 0 
                        ? `We've sent your request to ${eligibleTruckCount} nearby tow trucks. Please wait for one to accept.`
                        : "Broadcasting your request to all available tow trucks in the area. Please wait for one to accept."}
                 </Text>
                 <View style={styles.countdownBox}>
                     <Ionicons name="timer-outline" size={24} color={color.primary} />
                     <Text style={styles.countdownText}>
                         {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                     </Text>
                 </View>
                 <TouchableOpacity
                     style={[styles.confirmButton, {backgroundColor: color.danger, marginTop: 20}]}
                     onPress={handleGoBack}
                 >
                     <Text style={styles.confirmButtonText}>Cancel Search</Text>
                 </TouchableOpacity>
             </BottomSheetView>
         );
    };

    // Main render switch
    const renderContent = () => {
        switch(currentStage) {
            case TowingBookingStage.PICKUP_SELECTION:
            case TowingBookingStage.DESTINATION_SELECTION:
                return renderLocationContent();
            case TowingBookingStage.VEHICLE_SELECTION:
                return renderVehicleContent();
            case TowingBookingStage.PAYMENT:
                const finalPrice = selectedProvider?.finalPrice || 0;
                return (
                    <BottomSheetView style={styles.contentContainer}>
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
                                    <Text style={styles.tripDetailsLabel}>Tow Truck:</Text>
                                    <Text style={styles.tripDetailsValue}>{selectedProvider?.name || 'N/A'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.tripDetailsLabel}>Est. Arrival:</Text>
                                    <Text style={styles.tripDetailsValue}>
                                        {selectedProvider?.eta ? `${selectedProvider.eta} min` : 'N/A'}
                                    </Text>
                                </View>
    
                                <View style={styles.priceSummary}>
                                    <Text style={styles.priceLabel}>Total Price:</Text>
                                    <Text style={styles.priceValue}>AED {finalPrice.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
    
                        <TouchableOpacity 
                            style={[styles.confirmButton, isConfirmingPayment && {backgroundColor: color.darkGray}]} 
                            onPress={confirmPayment} 
                            disabled={isConfirmingPayment}
                        >
                            {isConfirmingPayment ? (
                                <ActivityIndicator color={color.white}/>
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    Pay AED {finalPrice.toFixed(2)} & Confirm
                                </Text>
                            )}
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
                    isPinningLocation={!showPlaceSearch && (currentStage === TowingBookingStage.PICKUP_SELECTION || currentStage === TowingBookingStage.DESTINATION_SELECTION)}
                    onPinLocationChange={handleLocationChange}
                    pickupMarker={pickupLocation}
                    destinationMarker={destinationLocation}
                    currentStage={currentStage} // Add this line
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

export default function TowingServiceMap() {
    return (
        <TowingBookingProvider>
            <TowingServiceMapContent />
        </TowingBookingProvider>
    );
}

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
        justifyContent: 'space-between', // Added to space out icon and text
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
    // Styles for GooglePlacesAutocomplete
    autocompleteContainer: {
        position: 'absolute',
        top: 100, // Adjust as needed to position correctly within the BottomSheet
        left: 20,
        right: 20,
        zIndex: 10,
    },
    autocompleteTextInput: {
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
    autocompleteListView: {
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
    autocompleteRow: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    autocompleteDescription: {
        fontSize: 16,
        color: '#333',
    },
    // Styles copied from Map.tsx for GooglePlacesAutocomplete
    searchContainer: {
        position: 'absolute',
        top: 0, // Adjusted to be relative to the BottomSheetView
        left: 0,
        right: 0,
        zIndex: 1,
        paddingHorizontal: 20, // Added padding to match contentContainer
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
        top: 150, // Adjusted position to be below the search input
        left: 20,
        right: 20,
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
        borderColor: color.border 
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
        color: color.darkGray, 
        fontWeight: '500', 
        textAlign: 'right', 
        flexShrink: 1 
    },
    priceSummary: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        borderTopWidth: 1, 
        borderTopColor: color.border, 
        paddingTop: 15, 
        marginTop: 5 
    },
    priceLabel: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: color.darkGray 
    },
    priceValue: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: color.primary 
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
        color: color.darkGray,
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