// /app/settings/add-business/businesssetup/garage-setup/location-picker.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RotatingLoader from '@/components/RotatingLoader';
import { useLocalSearchParams } from 'expo-router'; // Make sure this is imported

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// A fallback default region if location access is denied
const DUBAI_COORDS: Region = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function LocationPickerScreen() {
  const router = useRouter();
  const { garageId } = useLocalSearchParams<{ garageId?: string }>();

  const { getToken } = useAuth();
  const { details, services, setLocation, reset } = useGarageStore();
  const mapRef = useRef<MapView>(null);

  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('Move the map to set location');

  // Request location permissions and get current position on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission denied. Please enable location services to find your position.');
        setCurrentRegion(DUBAI_COORDS);
        reverseGeocode(DUBAI_COORDS);
        return;
      }
      
      console.log(`[LocationPicker] --- Am I in Edit Mode? garageId = ${garageId}`);
      try {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005, // Zoom in very close
          longitudeDelta: 0.005,
        };
        setCurrentRegion(region);
        reverseGeocode(region); // Get address for the initial position
      } catch (error) {
          setLocationError("Could not fetch your current location. Please move the map manually.");
          setCurrentRegion(DUBAI_COORDS);
          reverseGeocode(DUBAI_COORDS);
      }
    })();
  }, [garageId]);

  // Get a human-readable address from coordinates
  const reverseGeocode = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    try {
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result.length > 0) {
            const { name, street, city, postalCode, country } = result[0];
            setGeocodedAddress([name, street, city, postalCode, country].filter(Boolean).join(', '));
        }
    } catch (e) {
        console.warn("Reverse geocode error", e);
        setGeocodedAddress('Address details unavailable');
    }
  }

  // Final submission handler
  const handleFinalSubmit = async () => { // Renamed for clarity
    if (!currentRegion) {
        return Alert.alert('Location Not Set', 'Please wait for the map to load.');
    }
    
    setIsSubmitting(true);
    setLocation({ latitude: currentRegion.latitude, longitude: currentRegion.longitude });

    const payload = {
        details: details, // Send details as a nested object
        services: services, // Send services
        location: {
            type: 'Point',
            coordinates: [currentRegion.longitude, currentRegion.latitude],
        },
    };

    console.log(`Submitting in ${garageId ? 'EDIT' : 'CREATE'} mode.`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    try {
        const token = await getToken();
        if (!token) throw new Error("Authentication session expired. Please log in again.");

        // --- THIS IS THE FIX (Part 2) ---
        const isEditMode = !!garageId;
        const url = isEditMode 
            ? `${API_BASE_URL}/api/garages/${garageId}` 
            : `${API_BASE_URL}/api/garages`;
        
        const method = isEditMode ? 'PUT' : 'POST';
        // ------------------------------------

        const response = await fetch(url, {
            method: method, // Use the dynamic method
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

        // (Your robust error handling logic is excellent and should be kept here)
        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = `Server Error: ${response.status}`;
            try {
                const errorData = JSON.parse(errorBody);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.error("Non-JSON error response:", errorBody);
                errorMessage = "An unexpected server error occurred.";
            }
            throw new Error(errorMessage);
        }

        const successMessage = isEditMode ? 'Your garage has been updated!' : 'Your garage has been created!';
        Alert.alert('Success!', successMessage, [
            { text: 'OK', onPress: () => { reset(); router.replace('/settings/add-business/businesssetup/businesspage'); } },
        ]);

    } catch (e: any) {
        Alert.alert('Submission Error', e.message);
    } finally {
        setIsSubmitting(false);
    }
};

  // Render a loading screen while waiting for initial location
  if (!currentRegion) {
    return (
      <View style={styles.centered}>
          <RotatingLoader  
              iconName="navigate-circle-outline" 
              message="Loading Your Business Profile" 
              color="#ed8b65"
              size={50}
            />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Step 3: Pin Your Location' }} />
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentRegion}
        showsUserLocation={true}
        onRegionChangeComplete={(region) => {
            // Update the state as the user moves the map
            setCurrentRegion(region);
            // Get the new address for the center of the map
            reverseGeocode(region);
        }}
      />
      
      {/* This is the static pin in the center of the map */}
      <View style={styles.pinContainer}>
          <Ionicons name="location" size={50} color="#b95528" style={styles.pinShadow} />
      </View>

      {/* This overlay contains the information and the final confirmation button */}
      <View style={styles.overlayContainer}>
        <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Set Garage Location</Text>
            <Text style={styles.instructionsSubtitle} numberOfLines={2}>{geocodedAddress}</Text>
        </View>
        <TouchableOpacity onPress={handleFinalSubmit} disabled={isSubmitting}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.button}>
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.buttonText}>Confirm Garage</Text>
                        <Ionicons name="checkmark-done-circle" size={22} color="#fff" />
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#555', fontWeight: '500' },
  map: { flex: 1 },
  pinContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    // The -25 offset accounts for half the pin's height, centering the tip
    marginBottom: 25, 
    pointerEvents: 'none', 
  },
  pinShadow: {
      textShadowColor: 'rgba(0, 0, 0, 0.25)',
      textShadowOffset: { width: 0, height: 4 },
      textShadowRadius: 5,
  },
  overlayContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 40,
    backgroundColor: 'white',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 10,
  },
  instructionsContainer: { alignItems: 'center', marginBottom: 20 },
  instructionsTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  instructionsSubtitle: { fontSize: 14, color: '#555', textAlign: 'center' },
  button: {
    flexDirection: 'row', padding: 15, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
});