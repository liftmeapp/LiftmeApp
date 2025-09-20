// /app/settings/add-business/businesssetup/set-tow-truck-location.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useTowTruckStore } from '@/store/towtruckStore'; // Use the correct store
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RotatingLoader from '@/components/RotatingLoader';

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const FALLBACK_COORDS: Region = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function SetTowTruckLocationScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { details, services, setLocation, reset } = useTowTruckStore(); // Get data from the tow truck store

  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('Move the map to set location');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is needed to set your base.");
        setCurrentRegion(FALLBACK_COORDS);
        return;
      }
      try {
        let location = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setCurrentRegion(region);
        reverseGeocode(region);
      } catch (error) {
        setCurrentRegion(FALLBACK_COORDS);
      }
    })();
  }, []);

  const reverseGeocode = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    try {
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result.length > 0) {
            const { name, street, city } = result[0];
            setGeocodedAddress([name, street, city].filter(Boolean).join(', '));
        }
    } catch (e) {
        setGeocodedAddress('Address details unavailable');
    }
  }

  const handleCreateTruck = async () => {
    if (!currentRegion) {
      return Alert.alert('Location Not Set', 'Please wait for the map to load.');
    }
    
    setIsSubmitting(true);
    // Persist the final chosen location to the store before submitting
    setLocation({ latitude: currentRegion.latitude, longitude: currentRegion.longitude });

    const payload = {
      ...details,
      services,
      // This is the initial base location for the truck
      location: {
        type: 'Point',
        coordinates: [currentRegion.longitude, currentRegion.latitude],
      },
    };

    console.log("Submitting Tow Truck Payload:", JSON.stringify(payload, null, 2));

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/tow-trucks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const newTowTruck = await response.json();

      Alert.alert('Registration Complete!', 'Your tow truck is now listed. You will now be taken to the live driver dashboard.', [
          { text: 'Go to Dashboard', onPress: () => {
              reset();
              // Use router.replace to go to the live screen, but pass the new data as params
              router.replace({
                  pathname: '/settings/add-business/businesssetup/towtruck-setup/tow-truck-live-tracking',
                  params: { 
                      towTruckId: newTowTruck.id,
                      towTruckName: newTowTruck.name 
                  }
              }); 
          }},
      ]);
      Alert.alert(
        'Registration Complete!',
        'Your tow truck is now listed. You will now be taken to the live driver dashboard.',
        [{ text: 'Go to Dashboard', onPress: () => {
            reset(); // Clear the store
            // Navigate to the live tracking screen
            router.replace('/settings/add-business/businesssetup/towtruck-setup/tow-truck-live-tracking');
        }}]
      );

    } catch (e: any) {
      Alert.alert('Submission Error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentRegion) {
    return <View style={styles.centered}>
      <RotatingLoader  
        iconName="navigate-circle-outline" 
        message="Loading Your Business Profile" 
        color="#ed8b65"
        size={50}
      />
      </View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Step 2: Set Base Location' }} />
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentRegion}
        onRegionChangeComplete={(region) => {
          setCurrentRegion(region);
          reverseGeocode(region);
        }}
      />
      <View style={styles.pinContainer}>
        <Ionicons name="location-sharp" size={50} color="#ed8b65" style={styles.pinShadow} />
      </View>
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Set Your Base of Operations</Text>
        <Text style={styles.overlaySubtitle} numberOfLines={2}>{geocodedAddress}</Text>
        <TouchableOpacity onPress={handleCreateTruck} disabled={isSubmitting}>
          <LinearGradient colors={['#F2994A', '#F2C94C']} style={styles.button}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Confirm Base & Create Truck</Text>
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
    container: { flex: 1 },
    map: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, fontSize: 16, color: '#666' },
    pinContainer: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center', marginBottom: 25,
        pointerEvents: 'none',
    },
    pinShadow: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 4,
    },
    overlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, paddingTop: 25, paddingBottom: 40,
        shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1, shadowRadius: 5, elevation: 20,
    },
    overlayTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#333' },
    overlaySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 20, minHeight: 30 },
    button: {
        flexDirection: 'row', padding: 15, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
});