// context/BookingContext.tsx
import { io } from 'socket.io-client';
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

export type ServiceType = 'ROADSIDE_ASSISTANCE' | 'TOWING' | 'ELECTRIC_VEHICLE' | 'LUXURY' | 'BIKE_ASSISTANCE';

export interface BookingPayload {
  serviceType: ServiceType;
  serviceId?: string;
  vehicleId?: string;
  userLat?: number;
  userLon?: number;
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
  // Potentially setters for stages if needed by components
  setStage: (stage: BookingStage) => void;
  setSelectedService: (service: any) => void;
  setSelectedVehicle: (vehicle: any) => void;
  setPickupLocation: (location: LocationState) => void;
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

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setStage = (stage: BookingStage) => {
    setCurrentStage(stage);
  };

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
        if (data.bookingId === currentBookingId) {
            setSelectedProvider(data.provider);
            setCurrentStage(BookingStage.PAYMENT); // Move to payment stage
            socket.disconnect();
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

    socket.on('disconnect', (reason) => {
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

  // Countdown Timer Effect
  useEffect(() => {
    let countdownInterval: ReturnType<typeof setInterval> | null = null;
    if (currentStage === BookingStage.SEARCHING_FOR_PROVIDER && !searchError) {
      setSearchCountdown(SEARCH_DURATION_SECONDS); // Reset countdown
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

  // --- Action Implementations ---

  const startBooking = useCallback(
    async (payload: BookingPayload) => {
      if (isBroadcasting) return; // Prevent multiple simultaneous requests

      setIsBroadcasting(true);
      setSearchError(null);
      setCurrentStage(BookingStage.SEARCHING_FOR_PROVIDER); // Immediately move to searching stage

      let endpoint = '';
      let requestBody: any = {};

      switch (payload.serviceType) {
        case 'ROADSIDE_ASSISTANCE':
        case 'ELECTRIC_VEHICLE':
        case 'LUXURY':
        case 'BIKE_ASSISTANCE':
          endpoint = `${API_BASE_URL}/api/bookings/request-service`;
          requestBody = {
            serviceId: payload.serviceId,
            vehicleId: payload.vehicleId,
            userLat: payload.userLat,
            userLon: payload.userLon,
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

        const data = await response.json();
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
                    try {
                      const token = await getToken();
                      const response = await fetch(
                        `${API_BASE_URL}/bookings/${currentBookingId}/cancel`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      const data = await response.json();

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
    if (!currentBookingId || !selectedProvider) {
      Alert.alert('Error', 'No active booking or provider to confirm payment.');
      return;
    }
    setIsConfirmingPayment(true);
    // TODO: Implement actual payment logic here (e.g., Stripe API call)
    console.log('Payment initiated for booking:', currentBookingId);
    Alert.alert(
      'Payment Confirmed!',
      `Service booked with ${selectedProvider.name}! They are on their way. (Payment logic is a placeholder)`
    );
    setTimeout(() => {
      // Simulate payment success and navigation
      resetBookingFlow();
      setIsConfirmingPayment(false);
      // router.push(`/tracking/${currentBookingId}`); // Example navigation
    }, 2000);
  }, [currentBookingId, selectedProvider, resetBookingFlow]);

  const contextValue = {
    currentStage,
    currentBookingId,
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
