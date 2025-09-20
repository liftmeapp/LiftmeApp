// /app/(root)/(tabs)/settings/add-business/businesssetup/edit-garage/edit-services.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Switch, SafeAreaView, Platform, LayoutAnimation, Alert, ActivityIndicator, UIManager,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useGarageStore } from '@/store/garageStore';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import RotatingLoader from '@/components/RotatingLoader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ApiService {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface ServiceSelectionState {
  [serviceId: string]: {
      selected: boolean;
      price: string;
  };
}

export default function EditServicesScreen() {
  const router = useRouter();
  const { garageId } = useLocalSearchParams<{ garageId: string }>();
  const { getToken, isSignedIn } = useAuth();
  // `existingServices` holds the data we loaded in the dashboard.
  const { services: existingServices, setServices: saveServicesToStore } = useGarageStore();
  
  const [masterServices, setMasterServices] = useState<ApiService[]>([]);
  const [selections, setSelections] = useState<ServiceSelectionState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitiated = useRef(false);

  useEffect(() => {
    if (isSignedIn && !fetchInitiated.current) {
      fetchInitiated.current = true;
      
      const fetchAndInitialize = async () => {
        setLoading(true);
        setError(null);
        console.log("--- EditServicesScreen: Initializing ---");
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication token not found.");

            console.log("1. Fetching master list of all services...");
            const response = await fetch(`${API_BASE_URL}/api/services`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`Failed to fetch services list (Status: ${response.status}).`);

            const allServices: ApiService[] = await response.json();
            if (!Array.isArray(allServices)) throw new Error("API did not return a valid list of services.");
            
            setMasterServices(allServices);
            console.log(`2. Fetched ${allServices.length} master services.`);
            console.log("3. Pre-populating selections from the store. Existing services count:", existingServices.length);

            // Create a lookup map for existing services for efficiency
            const existingServicesMap = new Map(existingServices.map(s => [s.serviceId, s.price]));

            // Initialize the selection state by iterating over the master list
            const initialSelections: ServiceSelectionState = {};
            allServices.forEach(service => {
                const price = existingServicesMap.get(service.id);
                initialSelections[service.id] = {
                    selected: price !== undefined, // If a price exists, it's selected
                    price: price !== undefined ? String(price) : '',
                };
            });
            
            setSelections(initialSelections);
            console.log("4. Initialization complete.");

        } catch (e: any) {
            console.error("💥 ERROR during initialization:", e);
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
      };

      fetchAndInitialize();
    }
  }, [isSignedIn, getToken, existingServices]); // Dependency on existingServices ensures this runs if the store updates

  const toggleService = (serviceId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelections(prev => {
        const currentSelection = prev[serviceId];
        const isNowSelected = !currentSelection.selected;
        return {
            ...prev,
            [serviceId]: {
                ...currentSelection,
                selected: isNowSelected,
                price: isNowSelected ? currentSelection.price : '', // Clear price on deselect
            },
        };
    });
  };

  const handlePriceChange = (text: string, serviceId: string) => {
    setSelections(prev => ({
        ...prev,
        [serviceId]: {
            ...prev[serviceId],
            price: text.replace(/[^0-9.]/g, ''), // Allow only numbers and dots
        },
    }));
  };

  const handleNext = () => {
    const selectedServices = Object.entries(selections)
      .filter(([, value]) => value.selected)
      .map(([serviceId, value]) => ({
        serviceId,
        price: parseFloat(value.price),
      }));

    if (selectedServices.length === 0) {
      return Alert.alert('No Services Selected', 'You must offer at least one service.');
    }
    if (selectedServices.some(s => isNaN(s.price) || s.price <= 0)) {
      return Alert.alert('Invalid Price', 'Please enter a valid, positive price for all selected services.');
    }

    console.log("Updating services in store:", selectedServices);
    saveServicesToStore(selectedServices);
    
    // Navigate to the location picker, making sure to pass the garageId for edit mode
    router.push({
        pathname: '/settings/add-business/businesssetup/garage-setup/location-picker',
        params: { garageId }
    });
  };

  // Memoized calculation for categorized services
  const categorizedServices = useMemo(() => {
    if (!masterServices.length) return [];
    const groups = masterServices.reduce((acc, service) => {
        const key = service.type || 'GENERAL_LISTING';
        if (!acc[key]) { acc[key] = []; }
        acc[key].push(service);
        return acc;
    }, {} as Record<string, ApiService[]>);
    return Object.entries(groups).map(([type, servicesList]) => ({
        title: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Services',
        services: servicesList,
    }));
  }, [masterServices]);

  const selectedCount = useMemo(() => Object.values(selections).filter(s => s.selected).length, [selections]);

  if (loading) {
    return <View style={styles.centered}><RotatingLoader iconName="construct-outline" message="Loading Your Services..." color="#ed8b65" size={50}/></View>;
  }
  
  if (error) {
    return <View style={styles.centered}><Ionicons name="cloud-offline-outline" size={48} color="#d9534f" /><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Step 2: Update Services' }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Update Your Services</Text>
            <Text style={styles.headerSubtitle}>Add or remove offerings and adjust your prices.</Text>
        </View>
        
        {categorizedServices.map((category) => (
            <View key={category.title} style={styles.categoryCard}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                {category.services.map((service, index) => {
                    const selectionState = selections[service.id];
                    if (!selectionState) return null; // Safeguard

                    return (
                        <View key={service.id} style={[styles.serviceItemContainer, index === category.services.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.serviceRow}>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                <Switch
                                    trackColor={{ false: "#ccc", true: "#b95528" }}
                                    thumbColor={"#fff"}
                                    onValueChange={() => toggleService(service.id)}
                                    value={selectionState.selected}
                                />
                            </View>
                            {selectionState.selected && (
                            <View style={styles.priceInputContainer}>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="e.g., 120.00"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                    value={selectionState.price}
                                    onChangeText={(text) => handlePriceChange(text, service.id)}
                                />
                            </View>
                            )}
                        </View>
                    );
                })}
            </View>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={handleNext} disabled={loading}>
          <LinearGradient colors={['#c3683c', '#b95528']} style={styles.fab}>
              <View style={styles.fabContent}>
                <Text style={styles.fabText}>Next: Update Location</Text>
                {selectedCount > 0 && <View style={styles.fabBadge}><Text style={styles.fabBadgeText}>{selectedCount}</Text></View>}
              </View>
              <Ionicons name="arrow-forward" size={22} color="#fff" />
          </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Using the same styles as addservices.tsx
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { marginTop: 15, textAlign: 'center', color: '#d9534f', fontSize: 16, fontWeight: '500' },
    scrollContainer: { paddingHorizontal: 10, paddingBottom: 100 },
    headerContainer: { paddingHorizontal: 10, paddingVertical: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#333' },
    headerSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 4 },
    categoryCard: {
        backgroundColor: '#fff', borderRadius: 12, marginBottom: 15,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, overflow: 'hidden',
    },
    categoryTitle: {
        fontSize: 18, fontWeight: '600', color: '#fff', 
        backgroundColor: '#7b381a', padding: 15,
    },
    serviceItemContainer: {
        paddingHorizontal: 15, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
    },
    serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceName: { fontSize: 16, color: '#444', flex: 1, marginRight: 10 },
    priceInputContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f7f7f7' },
    priceInput: { 
        height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 15, fontSize: 15, backgroundColor: '#fdfdfd'
    },
    fab: {
        position: 'absolute', bottom: 20, left: 20, right: 20,
        borderRadius: 15, paddingVertical: 15, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: '#b95528', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 6, elevation: 8,
    },
    fabContent: { flexDirection: 'row', alignItems: 'center' },
    fabText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
    fabBadge: {
        backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24,
        justifyContent: 'center', alignItems: 'center',
    },
    fabBadgeText: { color: '#b95528', fontWeight: 'bold', fontSize: 14 }
});
