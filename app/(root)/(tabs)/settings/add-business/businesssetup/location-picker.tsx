import { useGarageStore } from '@/store/garageStore';
import { useSparePartStore } from '@/store/sparePartStore'; // Import the new store
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const BANGALORE_COORDS: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function LocationPickerScreen() {
  const router = useRouter();
  const { mode = 'garage', garageId } = useLocalSearchParams<{ mode?: string, garageId?: string }>();
  const insets = useSafeAreaInsets();

  const { getToken } = useAuth();

  // Conditional hook usage is not allowed, so we call both and decide which data to use based on mode.
  const garageStore = useGarageStore();
  const sparePartStore = useSparePartStore();

  const mapRef = useRef<MapView>(null);

  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('Move the map to set location...');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        setCurrentRegion(BANGALORE_COORDS);
        return;
      }

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
        Alert.alert("Location Error", "Could not fetch your current location. Please move the map manually.");
        setCurrentRegion(BANGALORE_COORDS);
      }
    })();
  }, []);

  const reverseGeocode = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const { name, street, city, postalCode, country } = result[0];
        setGeocodedAddress([name, street, city, postalCode, country].filter(Boolean).join(', '));
      }
    } catch (e) {
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
    }
  };

  const handleFinalSubmit = async () => {
    if (!currentRegion) {
      return Alert.alert('Location Not Set', 'Please wait for the map to load.');
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication session expired.");

      let url = '';
      let payload: any = {};
      let successMessage = '';
      let routerRedirect = '';

      if (mode === 'garage') {
        garageStore.setLocation({ latitude: currentRegion.latitude, longitude: currentRegion.longitude });
        url = garageId ? `${API_BASE_URL}/api/garages/${garageId}` : `${API_BASE_URL}/api/garages`;
        payload = {
          details: { ...garageStore.details },
          services: garageStore.services,
          location: {
            type: 'Point',
            coordinates: [currentRegion.longitude, currentRegion.latitude],
          },
          supportedVehicleTypes: garageStore.supportedVehicleTypes,
        };
        successMessage = garageId ? 'Your garage has been updated!' : 'Your garage has been created!';
        routerRedirect = '/settings/add-business/businesssetup/businesspage';
        garageStore.reset();
      } else { // mode === 'sparePart'
        sparePartStore.setLocation({ latitude: currentRegion.latitude, longitude: currentRegion.longitude });
        url = `${API_BASE_URL}/api/spare-parts`;
        payload = {
          ...sparePartStore.details,
          price: parseFloat(sparePartStore.details.price),
          quantity: parseInt(sparePartStore.details.quantity, 10),
          year: parseInt(sparePartStore.details.year, 10) || undefined,
          location: {
            type: 'Point',
            coordinates: [currentRegion.longitude, currentRegion.latitude],
          },
        };
        successMessage = 'Your spare part has been listed for sale!';
        routerRedirect = '/settings/add-business/businesssetup/spare-part';
        sparePartStore.reset();
      }

      const response = await fetch(url, {
        method: mode === 'garage' && garageId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'An unexpected server error occurred.');
      }

      Alert.alert('Success!', successMessage);
      router.replace(routerRedirect as any);

    } catch (e: any) {
      Alert.alert('Submission Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentRegion) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#005C70" />
        <Text style={styles.loadingText}>Fetching Your Location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Step 2: Pin Your Location' }} />

      {GOOGLE_API_KEY && (
        <GooglePlacesAutocomplete
          placeholder="Search for a place"
          fetchDetails={true}
          enablePoweredByContainer={false}
          minLength={2}
          debounce={300}
          onPress={handleLocationSelect}
          onFail={(error) => console.error('GooglePlacesAutocomplete Error:', error)}
          query={{
            key: GOOGLE_API_KEY,
            language: 'en',
            components: 'country:in',
            // types: '(cities)', // Removed to allow searching for establishments/landmarks
            fields: 'formatted_address,geometry,name,place_id',
          }}
          styles={{
            container: styles.searchContainer,
            textInput: styles.searchInput,
            listView: styles.searchResults,
          }}
          textInputProps={{
            placeholderTextColor: '#999',
          }}
          keyboardShouldPersistTaps="handled"
          predefinedPlaces={[]}
        />
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
        <Ionicons name="location" size={50} color="#005C70" style={styles.pinShadow} />
      </View>

      <View style={[styles.overlayContainer, { paddingBottom: Math.max(insets.bottom + 90, 140) }]}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Set Your Location</Text>
          <Text style={styles.instructionsSubtitle} numberOfLines={2}>{geocodedAddress}</Text>
        </View>
        <TouchableOpacity onPress={handleFinalSubmit} disabled={isSubmitting}>
          <LinearGradient colors={['#005C70', '#004252']} style={styles.button}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>{mode === 'garage' && garageId ? 'Save Location Changes' : 'Confirm Location & Finish'}</Text>
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
    top: 10, // Adjusted from 50
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
    maxHeight: 200,
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
