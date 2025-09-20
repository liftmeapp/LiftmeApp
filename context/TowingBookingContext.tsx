// context/TowingBookingContext.tsx
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
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

export enum TowingBookingStage {
  PICKUP_SELECTION = 'pickup',
  DESTINATION_SELECTION = 'destination',
  VEHICLE_SELECTION = 'vehicle',
  SEARCHING_FOR_PROVIDER = 'searching',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

export interface TowingLocationState {
  latitude: number;
  longitude: number;
  description: string;
}

export interface TowingProviderInfo {
  id: string;
  name: string;
  eta?: number | null;
  distance?: number | null;
  finalPrice?: number;
  otp?: string;
  // Add other provider details as needed
}

export interface TowingBookingState {
  currentStage: TowingBookingStage;
  currentBookingId: string | null;
  searchError: string | null;
  searchCountdown: number; // New state
  eligibleTruckCount: number; // New state
  selectedProvider: TowingProviderInfo | null;
  selectedVehicle: any | null; // Vehicle object from API
  pickupLocation: TowingLocationState | null;
  destinationLocation: TowingLocationState | null;
  isBroadcasting: boolean;
  vehicles: any[]; // List of user's vehicles
  isInitialLoading: boolean; // For initial vehicle fetch
}

export interface TowingBookingContextType extends TowingBookingState {
  // Actions
  setCurrentStage: (stage: TowingBookingStage) => void;
  setSelectedVehicle: (vehicle: any | null) => void;
  setPickupLocation: (location: TowingLocationState | null) => void;
  setDestinationLocation: (location: TowingLocationState | null) => void;
  startTowingBooking: () => Promise<void>;
  cancelTowingBooking: () => Promise<void>;
  resetTowingBookingFlow: () => void;
  setSearchError: (error: string | null) => void;
  setConfirmedProvider: (provider: TowingProviderInfo | null) => void;
  setBookingId: (id: string | null) => void;
  setIsBroadcasting: (isBroadcasting: boolean) => void;
  fetchUserVehicles: () => Promise<void>;
}

// --- Context Creation ---

const TowingBookingContext = createContext<TowingBookingContextType | undefined>(
  undefined
);

// --- Constants ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const SEARCH_DURATION_SECONDS = 300; // 5 minutes (new constant)

// --- Provider Component ---

export const TowingBookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getToken, isSignedIn } = useAuth();

  const [currentStage, setCurrentStage] = useState<TowingBookingStage>(
    TowingBookingStage.PICKUP_SELECTION
  );
  const [currentBookingId, setBookingId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchCountdown, setSearchCountdown] = useState(SEARCH_DURATION_SECONDS); // New state
  const [eligibleTruckCount, setEligibleTruckCount] = useState(0); // New state
  const [selectedProvider, setConfirmedProvider] = useState<TowingProviderInfo | null>(
    null
  );
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [pickupLocation, setPickupLocation] = useState<TowingLocationState | null>(
    null
  );
  const [destinationLocation, setDestinationLocation] = useState<
    TowingLocationState | null
  >(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Data Fetching (Initial) ---
  const fetchUserVehicles = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token is not available.');

      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Could not fetch vehicles.');

      const data = await response.json();
      setVehicles(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not load your vehicle data.');
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch vehicles if the user is signed in.
    if (isSignedIn) {
        fetchUserVehicles();
    }
  }, [isSignedIn, fetchUserVehicles]); 

  // --- Polling Logic ---
  useEffect(() => {
    const clearPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    const pollStatus = async () => {
      if (!currentBookingId) {
        clearPolling();
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          clearPolling();
          setSearchError('Authentication required for polling.');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/bookings/${currentBookingId}/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 404) {
          clearPolling();
          setSearchError('The towing request was not found. Please try again.');
          setCurrentStage(TowingBookingStage.ERROR);
          return;
        }

        if (!response.ok) {
          clearPolling();
          const errorData = await response.json();
          setSearchError(
            errorData.error || 'A server error occurred during polling.'
          );
          setCurrentStage(TowingBookingStage.ERROR);
          return;
        }

        const data = await response.json();

        if (data.status === 'CONFIRMED') {
          clearPolling();
          setConfirmedProvider(data.provider);
          setCurrentStage(TowingBookingStage.CONFIRMED);
        } else if (['EXPIRED', 'CANCELLED'].includes(data.status)) {
          clearPolling();
          setSearchError('No tow trucks were available to accept your request.');
          setCurrentStage(TowingBookingStage.CANCELLED);
        }
        // If status is 'SEARCHING', it will continue polling due to setInterval
      } catch (error: any) {
        console.error('Polling error:', error);
        clearPolling();
        setSearchError('An error occurred while searching. Please try again.');
        setCurrentStage(TowingBookingStage.ERROR);
      }
    };

    if (
      currentStage === TowingBookingStage.SEARCHING_FOR_PROVIDER &&
      currentBookingId &&
      !searchError
    ) {
      // Start polling immediately and then every 5 seconds
      pollStatus();
      pollIntervalRef.current = setInterval(pollStatus, 5000);
    } else {
      clearPolling();
    }

    return clearPolling; // Cleanup on unmount or stage change
  }, [currentStage, currentBookingId, searchError]);

  // Countdown Timer Effect
  useEffect(() => {
    let countdownInterval: ReturnType<typeof setInterval> | null = null;
    if (currentStage === TowingBookingStage.SEARCHING_FOR_PROVIDER && !searchError) {
      setSearchCountdown(SEARCH_DURATION_SECONDS); // Reset countdown
      countdownInterval = setInterval(() => {
        setSearchCountdown((prev) => {
          if (prev <= 1) {
            // If countdown reaches 0, and no provider is found, set to EXPIRED
            if (currentBookingId && !selectedProvider) {
                setCurrentStage(TowingBookingStage.CANCELLED); // Or EXPIRED, depending on desired flow
                setSearchError("No tow trucks were available to accept your request in time.");
            }
            clearInterval(countdownInterval!); // Clear interval when done
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownInterval) clearInterval(countdownInterval);
    }
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [currentStage, searchError, currentBookingId, selectedProvider]);

  // --- Action Implementations ---

  const resetTowingBookingFlow = useCallback(() => {
    setCurrentStage(TowingBookingStage.PICKUP_SELECTION);
    setBookingId(null);
    setSearchError(null);
    setConfirmedProvider(null);
    setSelectedVehicle(null);
    setPickupLocation(null);
    setDestinationLocation(null);
    setIsBroadcasting(false);
    setSearchCountdown(SEARCH_DURATION_SECONDS); // New reset
    setEligibleTruckCount(0); // New reset
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startTowingBooking = useCallback(async () => {
    if (isBroadcasting) return;
    if (!selectedVehicle || !pickupLocation || !destinationLocation) {
      Alert.alert('Incomplete Details', 'Please select a vehicle, pickup, and destination.');
      return;
    }
    setIsBroadcasting(true);
    setSearchError(null);
    setCurrentStage(TowingBookingStage.SEARCHING_FOR_PROVIDER);
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not found.');
      const payload = { vehicleId: selectedVehicle.id, vehicleType: selectedVehicle.type, pickup: pickupLocation, destination: destinationLocation };
      const response = await fetch(`${API_BASE_URL}/api/bookings/request-towing`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.reason || data.error || 'Failed to start the towing request.'); }
      setBookingId(data.bookingId);
      setEligibleTruckCount(data.eligibleTruckCount || 0); // Set eligible truck count
    } catch (error: any) {
      setSearchError(error.message || 'An error occurred during towing initiation.');
      setCurrentStage(TowingBookingStage.ERROR);
    } finally {
      setIsBroadcasting(false);
    }
  }, [isBroadcasting, selectedVehicle, pickupLocation, destinationLocation]); // <-- getToken is removed

  const cancelTowingBooking = useCallback(async () => {
    if (!currentBookingId) {
      resetTowingBookingFlow();
      return;
    }
    Alert.alert('Cancel Towing Request', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) { Alert.alert('Error', 'Authentication required to cancel.'); return; }
            const response = await fetch(`${API_BASE_URL}/api/bookings/${currentBookingId}/cancel-by-user`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.error || 'Failed to cancel the booking.'); }
            Alert.alert('Success', 'Your towing request has been cancelled.');
            resetTowingBookingFlow();
            router.replace('/(root)/(tabs)/home');
          } catch (error: any) {
            Alert.alert('Cancellation Failed', error.message || 'An error occurred.');
          }
        },
      },
    ]);
  }, [currentBookingId, resetTowingBookingFlow, router]);

  const contextValue = {
    currentStage,
    currentBookingId,
    searchError,
    searchCountdown, // Exposed
    eligibleTruckCount, // Exposed
    selectedProvider,
    selectedVehicle,
    pickupLocation,
    destinationLocation,
    isBroadcasting,
    vehicles,
    isInitialLoading,
    setCurrentStage,
    setSelectedVehicle,
    setPickupLocation,
    setDestinationLocation,
    startTowingBooking,
    cancelTowingBooking,
    resetTowingBookingFlow,
    setSearchError,
    setConfirmedProvider,
    setBookingId,
    setIsBroadcasting,
    fetchUserVehicles,
  };

  return (
    <TowingBookingContext.Provider value={contextValue}>
      {children}
    </TowingBookingContext.Provider>
  );
};

// --- Custom Hook for Consumption ---

export const useTowingBooking = () => {
  const context = useContext(TowingBookingContext);
  if (context === undefined) {
    throw new Error('useTowingBooking must be used within a TowingBookingProvider');
  }
  return context;
};
