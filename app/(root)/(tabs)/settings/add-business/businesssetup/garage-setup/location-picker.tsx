// /app/settings/add-business/businesssetup/garage-setup/location-picker.tsx

import RotatingLoader from '@/components/RotatingLoader';
import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const DUBAI_COORDS: Region = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function LocationPickerScreen() {
  const router = useRouter();
  const { garageId } = useLocalSearchParams<{ garageId?: string }>();

  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { details, services, setLocation, reset } = useGarageStore();
  const mapRef = useRef<MapView>(null);

  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('Move the map to set location');
  const [currentGarageData, setCurrentGarageData] = useState<any>(null);
  const [isLoadingGarage, setIsLoadingGarage] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isLoaded || !isSignedIn) return;

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission denied. Please enable location services to find your position.');
        setCurrentRegion(DUBAI_COORDS);
        reverseGeocode(DUBAI_COORDS);
        return;
      }
      
      console.log(`[LocationPicker] --- Am I in Edit Mode? garageId = ${garageId}`);
      try {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setCurrentRegion(region);
        reverseGeocode(region);
      } catch (error) {
          setLocationError("Could not fetch your current location. Please move the map manually.");
          setCurrentRegion(DUBAI_COORDS);
          reverseGeocode(DUBAI_COORDS);
      }

      if (garageId) {
        setIsLoadingGarage(true);
        try {
          const token = await getToken();
          const response = await fetch(`${API_BASE_URL}/api/garages/${garageId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error("Failed to fetch garage details.");
          const data = await response.json();
          setCurrentGarageData(data);
        } catch (error) {
          console.error("Error fetching garage details:", error);
          Alert.alert("Error", "Could not load existing garage details.");
        } finally {
          setIsLoadingGarage(false);
        }
      }
    })();
  }, [garageId, isSignedIn, isLoaded]);

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

  const handleLocationSelect = (data: any, details: any = null) => {
    if (details?.geometry?.location) {
        const { lat, lng } = details.geometry.location;
        const newRegion = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };
        mapRef.current?.animateToRegion(newRegion, 1000);
    } else {
        console.warn("No details found for selected location");
    }
  };

  const handleFinalSubmit = async () => {
    if (!currentRegion) {
        return Alert.alert('Location Not Set', 'Please wait for the map to load.');
    }
    
    setIsSubmitting(true);
    setLocation({ latitude: currentRegion.latitude, longitude: currentRegion.longitude });

    const payload: any = {
        details: { ...details },
        services: services,
        location: {
            type: 'Point',
            coordinates: [currentRegion.longitude, currentRegion.latitude],
        },
    };

    if (currentGarageData && currentGarageData.status === 'REJECTED') {
        payload.details.status = 'PENDING';
    }

    console.log(`Submitting in ${garageId ? 'EDIT' : 'CREATE'} mode.`);
    console.log("Final Payload for Garage:", JSON.stringify(payload, null, 2));

    try {
        const token = await getToken();
        if (!token) throw new Error("Authentication session expired. Please log in again.");

        const isEditMode = !!garageId;
        const url = isEditMode 
            ? `${API_BASE_URL}/api/garages/${garageId}` 
            : `${API_BASE_URL}/api/garages`;
        
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

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
      
      {GOOGLE_API_KEY && GOOGLE_API_KEY.length > 20 && (
          <GooglePlacesAutocomplete
              placeholder="Search for a place"
              fetchDetails={true}
              onPress={handleLocationSelect}
              query={{ key: GOOGLE_API_KEY, language: 'en', components: 'country:in' }}
              styles={{
                  container: styles.searchContainer,
                  textInput: styles.searchInput,
                  listView: styles.searchResults,
                  row: styles.searchResultRow,
                  description: styles.searchResultText,
              }}
              textInputProps={{
                  placeholderTextColor: '#999',
              }}
              enablePoweredByContainer={false}
          />
      )}
      
      {searchError && (
          <View style={styles.searchError}>
              <Text style={styles.searchErrorText}>{searchError}</Text>
              <TouchableOpacity onPress={() => setSearchError(null)} style={styles.dismissButton}>
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>
          </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentRegion}
        showsUserLocation={true}
        onRegionChangeComplete={(region) => {
            setCurrentRegion(region);
            reverseGeocode(region);
        }}
      />
      
      <View style={styles.pinContainer}>
          <Ionicons name="location" size={50} color="#b95528" style={styles.pinShadow} />
      </View>

      <View style={styles.overlayContainer}>
        <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Set Garage Location</Text>
            <Text style={styles.instructionsSubtitle} numberOfLines={2}>{geocodedAddress}</Text>
        </View>
        <TouchableOpacity onPress={handleFinalSubmit} disabled={isSubmitting || isLoadingGarage}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.button}>
                {(isSubmitting || isLoadingGarage) ? (
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
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
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
  searchError: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
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
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#555', fontWeight: '500' },
  map: { flex: 1 },
  pinContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
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