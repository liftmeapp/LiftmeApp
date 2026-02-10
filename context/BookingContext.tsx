// context/BookingContext.tsx
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
// Razorpay import removed - using hook
import { usePayment } from '@/hooks/usePayment';
import { io } from 'socket.io-client';

// --- Enums and Interfaces ---

export enum BookingStage {
  IDLE = 'IDLE',
  SERVICE_SELECTION = 'SERVICE_SELECTION',
  VEHICLE_SELECTION = 'VEHICLE_SELECTION',
  LOCATION_CONFIRMATION = 'LOCATION_CONFIRMATION',
  SEARCHING_FOR_PROVIDER = 'SEARCHING_FOR_PROVIDER',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PAYMENT = 'PAYMENT',
  ERROR = 'ERROR',
}

export type ServiceType = 'ROADSIDE_ASSISTANCE' | 'TOWING' | 'ELECTRIC_VEHICLE' | 'LUXURY' | 'BIKE_ASSISTANCE' | 'HOME_SERVICE';

export interface BookingPayload {
  serviceType: ServiceType;
  serviceId?: string;
  vehicleId?: string;
  userLat?: number;
  userLon?: number;
  pickupDescription?: string;
  pickup?: { latitude: number; longitude: number; description: string };
  destination?: { latitude: number; longitude: number; description: string };
  vehicleType?: string; // For towing
}

export interface ProviderInfo {
  id: string;
  name: string;
  eta?: number | null;
  distance?: number | null;
  finalPrice?: number;
  otp?: string;
  // Add other provider details as needed
}

export type LocationState = { description: string; place_id: string; latitude: number | null; longitude: number | null; };


export interface BookingState {
  currentStage: BookingStage;
  currentBookingId: string | null;
  activeFlowType: ServiceType | null;
  searchCountdown: number;
  searchError: string | null;
  pollData: any | null; // Raw data from polling API
  selectedProvider: ProviderInfo | null;
  isBroadcasting: boolean;
  isConfirmingPayment: boolean;
  selectedService: any | null;
  selectedVehicle: any | null;
  pickupLocation: LocationState | null;
  // Add other state variables that need to be global
}

export interface BookingContextType extends BookingState {
  // Actions
  startBooking: (payload: BookingPayload) => Promise<void>;
  cancelBooking: () => Promise<void>;
  resetBookingFlow: () => void;
  confirmPayment: () => Promise<void>;
  confirmCashBooking: () => Promise<void>;
  // Potentially setters for stages if needed by components
  setStage: (stage: BookingStage) => void;
  setSelectedService: (service: any) => void;
  setSelectedVehicle: (vehicle: any) => void;
  setPickupLocation: (location: LocationState) => void;
  setActiveFlowType: (serviceType: ServiceType | null) => void;
  restoreActiveBookingForFlow: (serviceType: ServiceType) => Promise<boolean>;
}

// --- Context Creation ---

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// --- Constants ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const SEARCH_DURATION_SECONDS = 300; // 5 minutes

// --- Provider Component ---

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const { initiateRazorpay } = usePayment();

  const [currentStage, setCurrentStage] = useState<BookingStage>(
    BookingStage.IDLE
  );
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [searchCountdown, setSearchCountdown] = useState(SEARCH_DURATION_SECONDS);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pollData, setPollData] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo | null>(
    null
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [pickupLocation, setPickupLocation] = useState<LocationState | null>(null);
  const [activeFlowType, setActiveFlowType] = useState<ServiceType | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const readJsonResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    const raw = await response.text();
    // This usually means wrong API base URL, a proxy error page, or backend down.
    if (raw.trim().startsWith('<')) {
      throw new Error('Server returned HTML instead of JSON. Check API URL and backend status.');
    }
    throw new Error(raw || 'Server returned a non-JSON response.');
  };

  const setStage = useCallback((stage: BookingStage) => {
    setCurrentStage(stage);
  }, []);

  const matchesFlowType = (booking: any, flowType: ServiceType) => {
    if (booking.bookingType === 'DIRECT_TOW' || booking.bookingType === 'TOW_TO_GARAGE') {
      return flowType === 'TOWING';
    }

    const category = booking?.service?.category;
    switch (flowType) {
      case 'BIKE_ASSISTANCE':
        return category === 'ROADSIDE_BIKE';
      case 'ROADSIDE_ASSISTANCE':
        return category === 'ROADSIDE_CAR';
      case 'ELECTRIC_VEHICLE':
        return category === 'ELECTRIC_VEHICLE';
      case 'HOME_SERVICE':
        return category === 'HOME_SERVICE';
      case 'LUXURY':
        return category === 'LUXURY';
      default:
        return false;
    }
  };

  const restoreActiveBookingForFlow = useCallback(async (flowType: ServiceType) => {
    try {
      const token = await getToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/api/bookings/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return false;
      }

      const data = await readJsonResponse(response);
      if (!response.ok || !Array.isArray(data) || data.length === 0) {
        return false;
      }

      const activeBooking = data.find((booking: any) => matchesFlowType(booking, flowType));
      if (!activeBooking) return false;

      setCurrentBookingId(activeBooking.id);
      let providerInfo = null;
      if (activeBooking.garage) {
        providerInfo = { ...activeBooking.garage, otp: activeBooking.otp || undefined };
      } else if (activeBooking.towTruck) {
        providerInfo = { ...activeBooking.towTruck, otp: activeBooking.otp || undefined };
      }
      setSelectedProvider(providerInfo);

      switch (activeBooking.status) {
        case 'SEARCHING':
        case 'PENDING_ACCEPTANCE':
          if (activeBooking.expiresAt) {
            const remainingMs = new Date(activeBooking.expiresAt).getTime() - Date.now();
            const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
            setSearchCountdown(remainingSeconds);
          } else {
            setSearchCountdown(SEARCH_DURATION_SECONDS);
          }
          setCurrentStage(BookingStage.SEARCHING_FOR_PROVIDER);
          break;
        case 'AWAITING_PAYMENT':
          setCurrentStage(BookingStage.PAYMENT);
          break;
        case 'CONFIRMED':
        case 'IN_PROGRESS':
          setCurrentStage(BookingStage.CONFIRMED);
          break;
        default:
          return false;
      }

      return true;
    } catch (error) {
      console.error('[BookingContext] restoreActiveBookingForFlow failed:', error);
      return false;
    }
  }, [getToken]);

  // --- Real-time WebSocket Logic ---
  useEffect(() => {
    // Only run this effect when we are in the searching stage with a valid booking ID.
    if (currentStage !== BookingStage.SEARCHING_FOR_PROVIDER || !currentBookingId) {
      return;
    }

    console.log('[BookingContext] Initializing WebSocket connection...');
    const socket = io(API_BASE_URL!, {
      reconnection: true,
      transports: ['websocket']
    });

    const handleBookingAccepted = (data: any) => {
      console.log(`🎉 [Socket.IO] Received 'booking_accepted':`, data);
      console.log(`[BookingContext] Comparing received bookingId (${data.bookingId}) with current context bookingId (${currentBookingId})`);
      if (data.bookingId === currentBookingId) {
        console.log('[BookingContext] Booking IDs match! Updating stage to PAYMENT.');
        setSelectedProvider(data.provider);
        setCurrentStage(BookingStage.PAYMENT); // Move to payment stage
        socket.disconnect();
      } else {
        console.warn(`[BookingContext] Booking ID mismatch. Current: ${currentBookingId}, Received: ${data.bookingId}. Ignoring event.`);
      }
    };

    const handleBookingExpired = (data: any) => {
      console.log(`⌛ [Socket.IO] Received 'booking_expired':`, data);
      if (data.bookingId === currentBookingId) {
        setSearchError('No providers were available to accept your request in time.');
        setCurrentStage(BookingStage.EXPIRED);
        socket.disconnect();
      }
    };

    socket.on('connect', () => {
      console.log(`[Socket.IO] Customer connected with ID: ${socket.id}`);
      // Register the customer with their Clerk user ID
      if (user?.id) {
        socket.emit('register_customer', user.id);
      }
    });

    // Listen for events from the server
    socket.on('booking_accepted', handleBookingAccepted);
    socket.on('booking_expired', handleBookingExpired);

    socket.on('disconnect', (reason: string) => {
      console.log(`[Socket.IO] Customer disconnected: ${reason}`);
    });

    // Cleanup function to disconnect when the component unmounts or dependencies change
    return () => {
      console.log('[BookingContext] Cleaning up WebSocket connection.');
      socket.off('booking_accepted', handleBookingAccepted);
      socket.off('booking_expired', handleBookingExpired);
      socket.disconnect();
    };
  }, [currentStage, currentBookingId, user]);

  // Keep listening for late lifecycle events (like completion OTP generation) after payment confirmation.
  useEffect(() => {
    if (!currentBookingId) return;

    const socket = io(API_BASE_URL!, {
      reconnection: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      if (user?.id) {
        socket.emit('register_customer', user.id);
      }
    });

    const handleOtpGenerated = (data: any) => {
      if (data?.bookingId !== currentBookingId) return;
      setSelectedProvider((prev) => (prev ? { ...prev, otp: data.otp } : prev));
    };

    socket.on('booking_otp_generated', handleOtpGenerated);

    return () => {
      socket.off('booking_otp_generated', handleOtpGenerated);
      socket.disconnect();
    };
  }, [currentBookingId, user]);

  // Auto-resume active booking on mount
  useEffect(() => {
    const checkActiveBookings = async () => {
      if (!activeFlowType) return;
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/bookings/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Handle non-JSON responses (usually errors)
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error('[BookingContext] Expected JSON but got:', text.substring(0, 100));
          return;
        }

        const data = await readJsonResponse(response);

        if (response.ok && Array.isArray(data) && data.length > 0) {
          const activeBooking = data.find((booking: any) => matchesFlowType(booking, activeFlowType));
          if (!activeBooking) return;
          // Find the most relevant active booking (e.g. latest one)
          console.log('[BookingContext] Found active booking:', activeBooking.id, activeBooking.status);
          // console.log('[BookingContext] Active booking payload:', JSON.stringify(activeBooking, null, 2));

          setCurrentBookingId(activeBooking.id);

          // Mapping provider info
          let providerInfo = null;
          if (activeBooking.garage) {
            providerInfo = {
              ...activeBooking.garage,
              otp: activeBooking.otp || undefined,
              // Map fields if necessary, e.g. if provider expects specific structure
            };
          } else if (activeBooking.towTruck) {
            providerInfo = {
              ...activeBooking.towTruck,
              otp: activeBooking.otp || undefined,
            };
          }

          if (providerInfo) {
            console.log('[BookingContext] Restoring provider info:', providerInfo.name || providerInfo.id);
            setSelectedProvider(providerInfo);
          } else {
            console.warn('[BookingContext] Active booking found but no provider info provided.');
          }

          // Also restore polling data for price if available in booking
          if (activeBooking.finalAmount) {
            // If we need to restore pricing display
          }

          switch (activeBooking.status) {
            case 'SEARCHING':
              setCurrentStage(BookingStage.SEARCHING_FOR_PROVIDER);
              break;
            case 'AWAITING_PAYMENT':
              setCurrentStage(BookingStage.PAYMENT);
              break;
            case 'PENDING_ACCEPTANCE':
              setCurrentStage(BookingStage.SEARCHING_FOR_PROVIDER);
              break;
            case 'CONFIRMED':
            case 'IN_PROGRESS':
              setCurrentStage(BookingStage.CONFIRMED);
              break;
            default:
              break;
          }
        }
      } catch (error) {
        console.error('[BookingContext] Failed to check active bookings:', error);
      }
    };

    // Only auto-resume when this flow is still idle (prevents overriding a live booking session).
    if (userId && currentStage === BookingStage.IDLE && !currentBookingId) {
      checkActiveBookings();
    }
  }, [activeFlowType, userId, currentStage, currentBookingId, getToken]);

  // Polling fallback Effect
  useEffect(() => {
    let pollingInterval: ReturnType<typeof setInterval> | null = null;

    const pollBookingStatus = async () => {
      if (!currentBookingId) return;
      try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/api/bookings/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await readJsonResponse(response);
        if (Array.isArray(data)) {
          const booking = data.find((b: any) => b.id === currentBookingId);
          if (booking) {
            console.log(`[BookingContext] Polled booking status: ${booking.status}`);

            if (booking.status === 'AWAITING_PAYMENT') {
              let providerInfo = null;
              if (booking.garage) {
                providerInfo = { ...booking.garage, otp: booking.otp || undefined };
              } else if (booking.towTruck) {
                providerInfo = { ...booking.towTruck, otp: booking.otp || undefined };
              }

              if (providerInfo) {
                setSelectedProvider(providerInfo);
              }

              console.log('[BookingContext] Polling determined booking accepted!');
              setCurrentStage(BookingStage.PAYMENT);
            } else if (booking.status === 'EXPIRED') {
              setSearchError('Booking request expired.');
              setCurrentStage(BookingStage.EXPIRED);
            } else if (booking.status === 'CANCELLED') {
              setSearchError('Booking was cancelled.');
              setCurrentStage(BookingStage.ERROR);
            }
          }
        }
      } catch (err) {
        console.error('[BookingContext] Polling error:', err);
      }
    };

    if (currentStage === BookingStage.SEARCHING_FOR_PROVIDER && currentBookingId) {
      // Poll every 3 seconds
      pollingInterval = setInterval(pollBookingStatus, 3000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [currentStage, currentBookingId, getToken]);

  // Countdown Timer Effect
  useEffect(() => {
    let countdownInterval: ReturnType<typeof setInterval> | null = null;
    if (currentStage === BookingStage.SEARCHING_FOR_PROVIDER && !searchError) {
      countdownInterval = setInterval(() => {
        setSearchCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (countdownInterval) clearInterval(countdownInterval);
    }
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [currentStage, searchError]);

  useEffect(() => {
    if (
      currentStage !== BookingStage.SEARCHING_FOR_PROVIDER ||
      searchCountdown > 0 ||
      !currentBookingId
    ) {
      return;
    }

    const finalizeExpiredSearch = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await fetch(`${API_BASE_URL}/api/bookings/${currentBookingId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readJsonResponse(response);
        if (data?.status === 'EXPIRED' || data?.status === 'CANCELLED') {
          setSearchError('No providers were available to accept your request in time.');
          setCurrentStage(BookingStage.EXPIRED);
          return;
        }
      } catch (error) {
        console.error('[BookingContext] Finalize expiry check failed:', error);
      }

      setSearchError('No providers were available to accept your request in time.');
      setCurrentStage(BookingStage.EXPIRED);
    };

    finalizeExpiredSearch();
  }, [currentStage, searchCountdown, currentBookingId, getToken]);

  // --- Action Implementations ---

  const startBooking = useCallback(
    async (payload: BookingPayload) => {
      if (isBroadcasting) return; // Prevent multiple simultaneous requests

      setIsBroadcasting(true);
      setSearchError(null);
      setSearchCountdown(SEARCH_DURATION_SECONDS);
      setActiveFlowType(payload.serviceType);
      setCurrentStage(BookingStage.SEARCHING_FOR_PROVIDER); // Immediately move to searching stage

      let endpoint = '';
      let requestBody: any = {};

      switch (payload.serviceType) {
        case 'ROADSIDE_ASSISTANCE':
        case 'ELECTRIC_VEHICLE':
        case 'LUXURY':
        case 'BIKE_ASSISTANCE':
        case 'HOME_SERVICE':
          endpoint = `${API_BASE_URL}/api/bookings/request-service`;
          requestBody = {
            serviceId: payload.serviceId,
            vehicleId: payload.vehicleId,
            userLat: payload.userLat,
            userLon: payload.userLon,
            pickupDescription: payload.pickupDescription,
          };
          break;
        case 'TOWING':
          endpoint = `${API_BASE_URL}/api/bookings/request-towing`;
          requestBody = {
            vehicleId: payload.vehicleId,
            vehicleType: payload.vehicleType,
            pickup: payload.pickup,
            destination: payload.destination,
          };
          break;
        default:
          setIsBroadcasting(false);
          setSearchError('Unsupported service type.');
          setCurrentStage(BookingStage.ERROR);
          return;
      }

      try {
        const token = await getToken();
        if (!token) throw new Error('Authentication token not found.');

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(requestBody),
        });

        const data = await readJsonResponse(response);
        if (!response.ok) {
          throw new Error(data.reason || data.error || 'Failed to start the booking request.');
        }

        setCurrentBookingId(data.bookingId);
        // Polling useEffect will pick up from here
      } catch (error: any) {
        setSearchError(error.message || 'An error occurred during booking initiation.');
        setCurrentStage(BookingStage.ERROR);
      } finally {
        setIsBroadcasting(false);
      }
    },
    [isBroadcasting, getToken]
  );

  const resetBookingFlow = useCallback(() => {
    setCurrentStage(BookingStage.IDLE);
    setCurrentBookingId(null);
    setSearchCountdown(SEARCH_DURATION_SECONDS);
    setSearchError(null);
    setPollData(null);
    setSelectedProvider(null);
    setIsBroadcasting(false);
    setIsConfirmingPayment(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const cancelBooking = useCallback(
    async (isUserInitiated: boolean = true) => {
      // ... existing code ...
      try {
        if (isUserInitiated) {
          const userConfirmed = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Cancel Booking',
              'Are you sure you want to cancel this booking?',
              [
                {
                  text: 'No',
                  style: 'cancel',
                  onPress: () => resolve(false),
                },
                {
                  text: 'Yes, Cancel',
                  style: 'destructive',
                  onPress: async () => {
                    if (!currentBookingId) {
                      console.error("Attempted to cancel with a null booking ID.");
                      Alert.alert("Error", "Booking is still being created. Please wait a moment before cancelling.");
                      return;
                    }
                    try {
                      const token = await getToken();
                      const response = await fetch(
                        `${API_BASE_URL}/api/bookings/${currentBookingId}/cancel-by-user`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      const data = await readJsonResponse(response);

                      if (!response.ok) {
                        throw new Error(data.error || 'Failed to cancel the booking.');
                      }

                      Alert.alert('Success', 'Your booking has been cancelled.');
                      resetBookingFlow(); // Reset state after successful cancellation
                      router.replace('/(root)/(tabs)/home'); // Navigate home

                    } catch (error: any) {
                      console.error('Cancel booking error:', error);
                      Alert.alert(
                        'Cancellation Failed',
                        error.message || 'An error occurred. Please try again.'
                      );
                    }
                  },
                },
              ]
            );
          });

          if (!userConfirmed) return;
        }

        // If not user-initiated or user confirmed cancellation
        resetBookingFlow();
        router.replace('/(root)/(tabs)/home');
      } catch (error) {
        console.error('Error during cancellation:', error);
        Alert.alert(
          'Error',
          'An error occurred while cancelling the booking. Please try again.'
        );
      }
    },
    [currentBookingId, getToken, resetBookingFlow, router]
  );

  const confirmPayment = useCallback(async () => {
    if (!currentBookingId) {
      Alert.alert('Error', 'No active booking to confirm payment.');
      return;
    }
    setIsConfirmingPayment(true);

    try {
      // 1. Create Razorpay Order
      const token = await getToken();
      const orderResponse = await fetch(`${API_BASE_URL}/api/bookings/${currentBookingId}/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const orderData = await readJsonResponse(orderResponse);

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create razorpay order.');
      }

      const options = {
        description: 'Payment for Booking',
        image: 'https://your-logo-url.com/logo.png', // Replace with valid URL
        currency: orderData.currency,
        key: orderData.key,
        amount: orderData.amount,
        name: 'Afthu Lift Me',
        order_id: orderData.orderId,
        prefill: {
          email: user?.emailAddresses[0]?.emailAddress,
          contact: user?.phoneNumbers[0]?.phoneNumber,
          name: user?.fullName || ''
        },
        theme: { color: '#53a20e' }
      };

      // 2. Open Razorpay Checkout
      const data = await RazorpayCheckout.open(options);

      // 3. Confirm Payment on Backend
      const confirmResponse = await fetch(`${API_BASE_URL}/api/bookings/${currentBookingId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: data.razorpay_payment_id,
          signature: data.razorpay_signature
        })
      });

      const confirmData = await readJsonResponse(confirmResponse);
      if (!confirmResponse.ok) {
        throw new Error(confirmData.error || 'Failed to confirm booking after payment.');
      }

      if (confirmData.success) {
        // Update UI to CONFIRMED stage
        // We rely on socket updates or manual state setting
        setCurrentStage(BookingStage.CONFIRMED);
      }

    } catch (error: any) {
      if (error.code === 'PAYMENT_CANCELLED') {
        console.log("User cancelled payment");
      } else {
        Alert.alert('Payment Failed', error.description || error.message);
      }
    } finally {
      setIsConfirmingPayment(false);
    }
  }, [currentBookingId, user, getToken]);

  const confirmCashBooking = useCallback(async () => {
    if (!currentBookingId || !selectedProvider) {
      Alert.alert('Error', 'No active booking or provider to confirm.');
      return;
    }
    setIsConfirmingPayment(true);

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/bookings/${currentBookingId}/confirm-cash`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const data = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm cash booking.');
      }

      setSelectedProvider(prev => {
        if (!prev) return null; // Handle the case where prev is null
        return {
          ...prev,
          otp: data.booking.otp
        };
      }); setCurrentStage(BookingStage.CONFIRMED);

    } catch (error: any) {
      Alert.alert('Confirmation Failed', error.message);
    } finally {
      setIsConfirmingPayment(false);
    }
  }, [currentBookingId, selectedProvider, getToken]);

  const contextValue = {
    currentStage,
    currentBookingId,
    activeFlowType,
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
    confirmCashBooking,
    setStage,
    setSelectedService,
    setSelectedVehicle,
    setPickupLocation,
    setActiveFlowType,
    restoreActiveBookingForFlow,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

// --- Custom Hook for Consumption ---

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
