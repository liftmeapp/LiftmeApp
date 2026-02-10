import RotatingLoader from "@/components/RotatingLoader";
import RideOptionCard from "@/components/ServiceOption";
import {
  BookingStage,
  ServiceType,
  useBooking,
} from "@/context/BookingContext";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PinnedLocationData } from "./Map";

// Helper functions for responsive sizing
const windowWidth = (size: number) =>
  (Dimensions.get("window").width * size) / 400;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Consolidate colors (matches RoadsideCarService)
const color = {
  lightGray: "#f1f1f1",
  mediumGray: "#e0e0e0",
  darkGray: "#666",
  textPrimary: "#333",
  textSecondary: "#555",
  primary: "#005C70", // Teal Theme
  success: "#4CAF50",
  white: "#ffffff",
  black: "#000000",
  danger: "#e53935",
};

interface ServiceBookingSheetProps {
  services: any[];
  vehicles: any[];
  isInitialLoading: boolean;
  pinnedLocation: PinnedLocationData | null;
  isGeocoding: boolean;
  onPinLocationRequest: () => void;
  onConfirmPin: () => void;
  bookingServiceType: ServiceType; // 'ROADSIDE_ASSISTANCE', etc.
}

export default function ServiceBookingSheet({
  services,
  vehicles,
  isInitialLoading,
  pinnedLocation,
  isGeocoding,
  onPinLocationRequest,
  onConfirmPin,
  bookingServiceType,
}: ServiceBookingSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const paymentCardsLoadedForBookingRef = useRef<string | null>(null);
  const router = useRouter();
  const { getToken } = useAuth();
  const snapPoints = useMemo(() => ["25%", "75%", "85%"], []);
  const [isBottomSheetReady, setIsBottomSheetReady] = useState(false);

  // Local State for Payment
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "CASH">("CASH");
  const [isAddVehicleModalVisible, setIsAddVehicleModalVisible] =
    useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [localVehicles, setLocalVehicles] = useState<any[]>(vehicles);
  const [vehicleForm, setVehicleForm] = useState({
    brand: "",
    name: "",
    model: "",
    year: "",
    plateNumber: "",
    color: "",
    type: "SEDAN",
  });

  const {
    currentStage,
    searchCountdown,
    searchError,
    selectedProvider,
    currentBookingId,
    isBroadcasting,
    isConfirmingPayment,
    selectedService,
    selectedVehicle,
    resetBookingFlow,
    cancelBooking,
    confirmPayment,
    confirmCashBooking,
    setStage,
    setSelectedService,
    setSelectedVehicle,
  } = useBooking();

  const serviceScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setLocalVehicles(vehicles);
  }, [vehicles]);

  // --- Bottom Sheet Snap Logic ---
  useEffect(() => {
    const timer = setTimeout(() => setIsBottomSheetReady(true), 100);
    return () => clearTimeout(timer);
  }, [getToken]);

  useEffect(() => {
    if (!isBottomSheetReady || !bottomSheetRef.current) return;
    const snap = (index: number) => {
      try {
        bottomSheetRef.current?.snapToIndex(index);
      } catch (error) {
        console.log("Sheet snap error:", error);
      }
    };

    if (currentStage === BookingStage.LOCATION_CONFIRMATION) {
      snap(1); // 45% (index 1 is 70% in our array ['20%', '70%', '80%']? Wait.
      // roadsidecar-service used ['20%', '70%', '80%'].
      // Let's verify snap index usage.
      // 1 is 70%. That seems high for location confirmation.
      // roadsidecar logic:
      // LOCATION_CONFIRMATION -> snap(1)
      // SERVICE_SELECTION -> snap(2) (80%)
      // VEHICLE_SELECTION -> snap(2)
      snap(1);
    } else {
      switch (currentStage) {
        case BookingStage.SERVICE_SELECTION:
          snap(2);
          break;
        case BookingStage.VEHICLE_SELECTION:
          snap(2);
          break;
        case BookingStage.SEARCHING_FOR_PROVIDER:
          snap(1);
          break;
        case BookingStage.CONFIRMED:
          snap(2);
          break;
        case BookingStage.PAYMENT:
          snap(2);
          break;
      }
    }
  }, [currentStage, isBottomSheetReady]);

  // --- Payment Cards Fetching ---
  const fetchSavedCards = useCallback(async () => {
    setIsFetchingCards(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed.");
      const res = await fetch(`${API_BASE_URL}/api/stripe/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load your saved cards.");
      const cards = await res.json();
      setSavedCards(cards);
    } catch (error: any) {
      Alert.alert("Error loading cards", error.message);
    } finally {
      setIsFetchingCards(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (currentStage === BookingStage.PAYMENT) {
      const bookingKey = currentBookingId || "__unknown__";
      if (paymentCardsLoadedForBookingRef.current !== bookingKey) {
        paymentCardsLoadedForBookingRef.current = bookingKey;
        fetchSavedCards();
      }
      return;
    }

    if (currentStage === BookingStage.CONFIRMED) {
      router.replace("/(root)/(tabs)/orders");
      resetBookingFlow();
    }
  }, [
    currentStage,
    currentBookingId,
    fetchSavedCards,
    resetBookingFlow,
    router,
  ]);

  // --- Handlers ---
  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    // Expand bottom sheet to show Continue button and scroll to it
    bottomSheetRef.current?.snapToIndex(2); // Expand to 80%
    setTimeout(() => {
      serviceScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };
  const handleVehicleSelect = (vehicle: any) => setSelectedVehicle(vehicle);

  const handleConfirmBooking = () => {
    if (paymentMethod === "CARD") {
      // Defer payment to Orders screen
      Alert.alert(
        "Payment Method Confirmed",
        "Please proceed to the Orders tab to complete your payment securely.",
        [
          {
            text: "Go to Orders",
            onPress: () => {
              router.push("/(root)/(tabs)/orders");
              resetBookingFlow();
            },
          },
          {
            text: "Later",
            style: "cancel",
            onPress: () => {
              resetBookingFlow();
            }
          }
        ]
      );
    } else {
      confirmCashBooking();
    }
  };

  const handleGoBack = () => {
    switch (currentStage) {
      case BookingStage.VEHICLE_SELECTION:
        setStage(BookingStage.SERVICE_SELECTION);
        break;
      case BookingStage.LOCATION_CONFIRMATION:
        setStage(BookingStage.VEHICLE_SELECTION);
        break;
      case BookingStage.PAYMENT:
        setStage(BookingStage.LOCATION_CONFIRMATION); // Logic check: Payment comes after Provider Found?
        // Wait. Provider Found (CONFIRMED/SEARCHING) leads to PAYMENT *automatically* via socket event.
        // The user cannot "Go Back" from PAYMENT to LOCATION easily if provider is already assigned?
        // Actually, if provider is assigned (PAYMENT stage), cancelling might be the only way back.
        // roadsidecar-service logic: setStage(LOCATION_CONFIRMATION) from PAYMENT.
        // This implies "Back" from "Confirm & Pay".
        // If the provider has accepted, going back to location seems wrong.
        // However, I will strictly follow existing logic for now.
        setStage(BookingStage.LOCATION_CONFIRMATION);
        break;
      case BookingStage.SEARCHING_FOR_PROVIDER:
        cancelBooking(); // Properly cancel on backend
        break;
      case BookingStage.ERROR:
      case BookingStage.CANCELLED:
      case BookingStage.EXPIRED:
        resetBookingFlow();
        break;
    }
  };

  const openAddVehicleModal = () => {
    setVehicleForm({
      brand: "",
      name: "",
      model: "",
      year: "",
      plateNumber: "",
      color: "",
      type: "SEDAN",
    });
    setIsAddVehicleModalVisible(true);
  };

  const handleCreateVehicle = async () => {
    if (
      !vehicleForm.brand.trim() ||
      !vehicleForm.name.trim() ||
      !vehicleForm.year.trim() ||
      !vehicleForm.plateNumber.trim()
    ) {
      Alert.alert(
        "Missing Information",
        "Brand, name, year, and plate number are required.",
      );
      return;
    }

    setIsAddingVehicle(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: vehicleForm.brand.trim(),
          name: vehicleForm.name.trim(),
          model: vehicleForm.model.trim(),
          year: vehicleForm.year.trim(),
          plateNumber: vehicleForm.plateNumber.trim().toUpperCase(),
          color: vehicleForm.color.trim(),
          type: vehicleForm.type,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to add vehicle.");

      setLocalVehicles((prev) => [data, ...prev]);
      setSelectedVehicle(data);
      setIsAddVehicleModalVisible(false);
      Alert.alert("Vehicle Added", "Your vehicle was added successfully.");
    } catch (error: any) {
      Alert.alert(
        "Add Vehicle Error",
        error.message || "An unexpected error occurred.",
      );
    } finally {
      setIsAddingVehicle(false);
    }
  };

  const formatServiceName = (name: string) => {
    return name.replace(/^(Car-|Bike - |Home - )/g, "");
  };

  const getServiceInfo = () =>
    services.find((s) => s.id === selectedService?.id) || null;

  // --- Render Functions ---

  const renderVehicleItem = ({ item }: { item: any }) => {
    const isSelected = selectedVehicle?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.vehicleCard, isSelected && styles.selectedVehicleCard]}
        onPress={() => handleVehicleSelect(item)}
      >
        <View style={styles.vehicleCardContent}>
          <View style={styles.vehicleIconContainer}>
            <Ionicons
              name="car-outline"
              size={24}
              color={isSelected ? color.primary : color.textPrimary}
            />
          </View>
          <View style={styles.vehicleCardDetails}>
            <Text style={styles.vehicleCardName}>{item.name}</Text>
            <Text style={styles.vehicleCardInfo}>
              {item.brand} {item.model} • {item.year}
            </Text>
            <Text style={styles.vehicleCardNumber}>
              {item.plateNumber || item.number}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.vehicleCardSelectedIndicator}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={color.primary}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (currentStage) {
      case BookingStage.SERVICE_SELECTION:
        return (
          <BottomSheetView style={styles.bottomSheetContainer}>
            <Text style={styles.headerText}>Select Service</Text>
            <View style={styles.contentArea}>
              {isInitialLoading ? (
                <View style={styles.loadingContainer}>
                  <RotatingLoader size={20} color={color.primary} />
                </View>
              ) : (
                <ScrollView
                  ref={serviceScrollViewRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                  {services.map((item) => (
                    <RideOptionCard
                      key={item.id}
                      name={formatServiceName(item.name)}
                      description={item.description}
                      selected={selectedService?.id === item.id}
                      onPress={() => handleServiceSelect(item)}
                    />
                  ))}
                </ScrollView>
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

      case BookingStage.VEHICLE_SELECTION:
        return (
          <BottomSheetView style={styles.bottomSheetContainer}>
            <View style={styles.headerWithBack}>
              <TouchableOpacity onPress={handleGoBack}>
                <Ionicons name="arrow-back" size={24} color={color.primary} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Select Your Vehicle</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.contentArea}>
              <FlatList
                data={localVehicles}
                renderItem={renderVehicleItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                  <View style={styles.summaryBox}>
                    <Ionicons
                      name="car-sport-outline"
                      size={18}
                      color={color.primary}
                      style={styles.summaryIcon}
                    />
                    <Text style={styles.summaryText}>
                      Service: {getServiceInfo()?.name || "N/A"}
                    </Text>
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
              onPress={openAddVehicleModal}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={color.white}
              />
              <Text style={styles.addVehicleButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </BottomSheetView>
        );

      case BookingStage.LOCATION_CONFIRMATION:
        return (
          <BottomSheetView style={styles.bottomSheetContainer}>
            <View style={styles.headerWithBack}>
              <TouchableOpacity onPress={handleGoBack}>
                <Ionicons name="arrow-back" size={24} color={color.primary} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Confirm Your Location</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.addressDisplayBox}>
              <Ionicons
                name="location-outline"
                size={24}
                color={color.darkGray}
              />
              <Text style={styles.addressDisplayText} numberOfLines={2}>
                {isGeocoding
                  ? "Locating..."
                  : pinnedLocation?.description ||
                  "Move the map to set location..."}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.inlineButton,
                (isGeocoding || isBroadcasting) && styles.disabledButton,
              ]}
              onPress={onConfirmPin}
              disabled={isGeocoding || isBroadcasting}
            >
              {isBroadcasting ? (
                <ActivityIndicator color={color.white} />
              ) : (
                <Text style={styles.inlineButtonText}>
                  Find Nearby Providers
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => setStage(BookingStage.VEHICLE_SELECTION)}
            >
              <Text style={styles.cancelLinkText}>Go Back</Text>
            </TouchableOpacity>
          </BottomSheetView>
        );

      case BookingStage.SEARCHING_FOR_PROVIDER:
      case BookingStage.CONFIRMED:
        const minutes = Math.floor(searchCountdown / 60);
        const seconds = searchCountdown % 60;
        if (searchError) {
          const failureReason =
            searchError ||
            "No providers were available to accept your request. Please try again later.";
          return (
            <BottomSheetView style={styles.bottomSheetContainer}>
              <View style={styles.centeredMessageContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={60}
                  color={color.danger}
                  style={{ marginBottom: 15 }}
                />
                <Text style={styles.headerText}>Request Unsuccessful</Text>
                <Text style={styles.subHeaderText}>{failureReason}</Text>
                <TouchableOpacity
                  style={styles.inlineButton}
                  onPress={handleGoBack}
                >
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
                <View style={{ width: 24 }} />
                <Text style={styles.headerText}>Provider is on the way!</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={styles.confirmationBanner}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={color.success}
                />
                <Text style={styles.confirmationBannerText}>
                  {selectedProvider.name} has accepted your request!
                </Text>
              </View>
              <View style={styles.tripDetailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.tripDetailsLabel}>Est. Arrival:</Text>
                  <Text style={styles.tripDetailsValue}>
                    {selectedProvider.eta || "--"} min
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.tripDetailsLabel}>Final Price:</Text>
                  <Text style={styles.priceValue}>
                    ₹{selectedProvider.finalPrice?.toFixed(2) || "0.00"}
                  </Text>
                </View>
              </View>

              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>
                  OTP will appear when provider requests completion:
                </Text>
                <Text style={styles.otpCode}>
                  {selectedProvider.otp || "WAITING"}
                </Text>
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
              <View style={{ width: 24 }} />
            </View>

            {searchError ? (
              <View style={styles.centeredMessageContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={60}
                  color={color.danger}
                  style={{ marginBottom: 15 }}
                />
                <Text style={styles.headerText}>Request Failed</Text>
                <Text style={styles.subHeaderText}>{searchError}</Text>
                <TouchableOpacity
                  style={styles.inlineButton}
                  onPress={handleGoBack}
                >
                  <Text style={styles.inlineButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.centeredMessageContainer}>
                <RotatingLoader size={40} color={color.primary} />
                <Text style={[styles.headerText, { marginTop: 20 }]}>
                  Contacting Garages
                </Text>
                <Text style={styles.subHeaderText}>
                  We have sent your request to all nearby garages. Please wait
                  for one to accept.
                </Text>
                <View style={styles.countdownBox}>
                  <Ionicons
                    name="timer-outline"
                    size={24}
                    color={color.primary}
                  />
                  <Text style={styles.countdownText}>
                    {`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.inlineButton,
                    { backgroundColor: color.danger, marginTop: 20 },
                    isBroadcasting && styles.disabledButton,
                  ]}
                  onPress={handleGoBack}
                  disabled={isBroadcasting}
                >
                  <Text style={styles.inlineButtonText}>
                    {isBroadcasting ? "checking.." : "Cancel Search"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </BottomSheetView>
        );

      case BookingStage.EXPIRED:
      case BookingStage.CANCELLED:
      case BookingStage.ERROR:
        const failReason =
          searchError || "The request was cancelled or expired.";
        return (
          <BottomSheetView style={styles.bottomSheetContainer}>
            <View style={styles.centeredMessageContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={60}
                color={color.danger}
                style={{ marginBottom: 15 }}
              />
              <Text style={styles.headerText}>Request Unsuccessful</Text>
              <Text style={styles.subHeaderText}>{failReason}</Text>
              <TouchableOpacity
                style={styles.inlineButton}
                onPress={handleGoBack}
              >
                <Text style={styles.inlineButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        );

      case BookingStage.PAYMENT:
        const finalPrice = selectedProvider?.finalPrice || 0;
        return (
          <BottomSheetView style={styles.bottomSheetContainer}>
            <View style={styles.headerWithBack}>
              <TouchableOpacity onPress={handleGoBack}>
                <Ionicons name="arrow-back" size={24} color={color.primary} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Confirm & Pay</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.confirmationBanner}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={color.success}
              />
              <Text style={styles.confirmationBannerText}>
                {selectedProvider?.name || "A provider"} has accepted your
                request!
              </Text>
            </View>
            <View style={styles.contentArea}>
              <Text style={styles.paymentMethodHeader}>
                Select Payment Method
              </Text>
              {isFetchingCards ? (
                <ActivityIndicator
                  style={{ marginVertical: 20 }}
                  size="small"
                  color={color.primary}
                />
              ) : (
                <View>
                  <TouchableOpacity
                    style={[
                      styles.cardItem,
                      paymentMethod === "CASH" && styles.selectedCardItem,
                    ]}
                    onPress={() => {
                      setPaymentMethod("CASH");
                      setSelectedCard(null);
                    }}
                  >
                    <Ionicons
                      name={
                        paymentMethod === "CASH"
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={24}
                      color={color.primary}
                    />
                    <Ionicons
                      name="cash-outline"
                      size={24}
                      color="#555"
                      style={{ marginHorizontal: 15 }}
                    />
                    <Text style={styles.cardText}>Pay with Cash</Text>
                  </TouchableOpacity>
                  <FlatList
                    data={savedCards}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.cardItem,
                          selectedCard === item.id && styles.selectedCardItem,
                        ]}
                        onPress={() => {
                          setPaymentMethod("CARD");
                          setSelectedCard(item.id);
                        }}
                      >
                        <Ionicons
                          name={
                            selectedCard === item.id
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={24}
                          color={color.primary}
                        />
                        <Ionicons
                          name="card"
                          size={24}
                          color="#555"
                          style={{ marginHorizontal: 15 }}
                        />
                        <Text style={styles.cardText}>
                          {item.brand.toUpperCase()} ending in {item.last4}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                      <View style={styles.centeredMessageContainer}>
                        <Text style={styles.subHeaderText}>
                          No saved cards found.
                        </Text>
                      </View>
                    }
                  />
                </View>
              )}
              <TouchableOpacity
                style={styles.addCardButton}
                onPress={() => router.push("/(root)/(tabs)/settings/payments")}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={color.primary}
                />
                <Text style={styles.addCardButtonText}>Add New Card</Text>
              </TouchableOpacity>
              <View style={styles.priceSummary}>
                <Text style={styles.priceLabel}>
                  Total (Service + Distance):
                </Text>
                <Text style={styles.priceValue}>₹{finalPrice.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (isConfirmingPayment ||
                  (paymentMethod === "CARD" && !selectedCard)) &&
                styles.disabledButton,
              ]}
              onPress={handleConfirmBooking}
              disabled={
                isConfirmingPayment ||
                (paymentMethod === "CARD" && !selectedCard)
              }
            >
              {isConfirmingPayment ? (
                <ActivityIndicator color={color.white} />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {paymentMethod === "CASH"
                    ? "Confirm Booking"
                    : paymentMethod === "CARD"
                      ? "Confirm & Pay Later"
                      : `Pay ₹${finalPrice.toFixed(2)} & Confirm`}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.cancelBookingButton,
                isConfirmingPayment && styles.disabledButton,
              ]}
              onPress={() => cancelBooking()}
              disabled={isConfirmingPayment}
            >
              <Text style={styles.cancelBookingButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          </BottomSheetView>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isBottomSheetReady ? (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          handleIndicatorStyle={{ backgroundColor: color.primary, width: 50 }}
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          containerStyle={{ zIndex: 1000 }}
        >
          {renderContent()}
        </BottomSheet>
      ) : null}
      <Modal
        visible={isAddVehicleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddVehicleModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Vehicle</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                style={styles.modalInput}
                placeholder="Brand*"
                value={vehicleForm.brand}
                onChangeText={(text) =>
                  setVehicleForm((p) => ({ ...p, brand: text }))
                }
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Name*"
                value={vehicleForm.name}
                onChangeText={(text) =>
                  setVehicleForm((p) => ({ ...p, name: text }))
                }
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Model"
                value={vehicleForm.model}
                onChangeText={(text) =>
                  setVehicleForm((p) => ({ ...p, model: text }))
                }
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Year*"
                keyboardType="numeric"
                maxLength={4}
                value={vehicleForm.year}
                onChangeText={(text) =>
                  setVehicleForm((p) => ({
                    ...p,
                    year: text.replace(/[^0-9]/g, ""),
                  }))
                }
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Plate Number*"
                autoCapitalize="characters"
                value={vehicleForm.plateNumber}
                onChangeText={(text) =>
                  setVehicleForm((p) => ({
                    ...p,
                    plateNumber: text.toUpperCase(),
                  }))
                }
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Color"
                value={vehicleForm.color}
                onChangeText={(text) =>
                  setVehicleForm((p) => ({ ...p, color: text }))
                }
              />
              <View style={styles.typeRow}>
                {["SEDAN", "SUV", "EV", "BIKE"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      vehicleForm.type === type && styles.typeChipActive,
                    ]}
                    onPress={() => setVehicleForm((p) => ({ ...p, type }))}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        vehicleForm.type === type && styles.typeChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsAddVehicleModalVisible(false)}
                  disabled={isAddingVehicle}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSaveBtn,
                    isAddingVehicle && styles.disabledButton,
                  ]}
                  onPress={handleCreateVehicle}
                  disabled={isAddingVehicle}
                >
                  {isAddingVehicle ? (
                    <ActivityIndicator color={color.white} />
                  ) : (
                    <Text style={styles.modalSaveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: color.white,
    zIndex: 999,
  },
  headerText: {
    textAlign: "center",
    fontSize: windowWidth(20),
    fontWeight: "600",
    marginBottom: 10,
    color: color.textPrimary,
  },
  headerWithBack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingTop: 15,
  },
  contentArea: {
    flex: 1,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.primary,
    paddingVertical: 15,
    borderRadius: 30, // Updated to Pill
    marginTop: 10,
    marginBottom: 10,
  },
  inlineButtonText: {
    color: color.white,
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 12,
  },
  disabledButton: {
    backgroundColor: color.mediumGray,
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
    borderColor: color.mediumGray,
  },
  selectedVehicleCard: {
    borderColor: color.primary,
    borderWidth: 1.5,
    backgroundColor: "#fffaf7",
  },
  vehicleCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleCardDetails: {
    flex: 1,
  },
  vehicleCardName: {
    fontSize: 15,
    fontWeight: "600",
    color: color.textPrimary,
  },
  vehicleCardInfo: {
    fontSize: 13, // Fixed: Remove 'windowWidth' dependency for simplicity in cleanup
    color: color.darkGray,
    marginTop: 3,
  },
  vehicleCardNumber: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  vehicleCardSelectedIndicator: {
    marginLeft: "auto",
  },
  summaryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryText: {
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "500",
    flexShrink: 1,
  },
  addVehicleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 30, // Pill
    marginTop: 0,
    marginBottom: 5,
  },
  addVehicleButtonText: {
    color: color.white,
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 16,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: color.textPrimary,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: color.mediumGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: color.textPrimary,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: color.mediumGray,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  typeChipActive: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  typeChipText: {
    color: color.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: color.white,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    color: color.darkGray,
    fontWeight: "600",
  },
  modalSaveBtn: {
    backgroundColor: color.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 88,
    alignItems: "center",
  },
  modalSaveText: {
    color: color.white,
    fontWeight: "700",
  },
  addressDisplayBox: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
  },
  cancelLinkText: {
    color: color.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  subHeaderText: {
    textAlign: "center",
    fontSize: 14,
    color: color.darkGray,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  confirmationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.success,
    marginBottom: 15,
  },
  confirmationBannerText: {
    color: "#2e7d32",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 10,
    flexShrink: 1,
  },
  tripDetailsContainer: {
    backgroundColor: color.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: color.mediumGray,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  tripDetailsLabel: {
    fontSize: 14,
    color: color.darkGray,
    fontWeight: "500",
    marginRight: 10,
  },
  tripDetailsValue: {
    fontSize: 14,
    color: color.textPrimary,
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.primary,
  },
  otpContainer: {
    marginTop: 20,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff8e1",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffecb3",
  },
  otpLabel: {
    fontSize: 14,
    color: color.textSecondary,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  otpCode: {
    fontSize: 32,
    fontWeight: "bold",
    color: color.primary,
    letterSpacing: 8,
  },
  countdownBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  countdownText: {
    fontSize: 22,
    fontWeight: "bold",
    color: color.primary,
    marginLeft: 10,
    fontVariant: ["tabular-nums"],
  },
  paymentMethodHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: color.textPrimary,
    marginBottom: 10,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: color.lightGray,
  },
  selectedCardItem: {
    backgroundColor: "#fff8f2",
  },
  cardText: {
    fontSize: 16,
    color: color.textPrimary,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: color.primary,
    borderRadius: 8, // Standard button radius? Or we used Pill earlier? Staying safe with 8 for now.
  },
  addCardButtonText: {
    color: color.primary,
    marginLeft: 8,
    fontWeight: "600",
  },
  priceSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: color.mediumGray,
    paddingTop: 15,
    marginTop: 5,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: color.textPrimary,
  },
  confirmButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.success,
    paddingVertical: 15,
    borderRadius: 30, // Pill
    marginTop: 10,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: color.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBookingButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.danger,
    paddingVertical: 15,
    borderRadius: 30, // Pill
    marginTop: 10,
    marginBottom: 10,
  },
  cancelBookingButtonText: {
    color: color.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
