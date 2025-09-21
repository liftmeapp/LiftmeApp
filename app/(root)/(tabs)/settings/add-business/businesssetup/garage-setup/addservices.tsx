// /app/(root)/(tabs)/settings/add-business/businesssetup/garage-setup/add-services.tsx

import RotatingLoader from '@/components/RotatingLoader';
import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView, StyleSheet,
  Switch,
  Text, TextInput, TouchableOpacity,
  UIManager,
  View
} from 'react-native';


// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TYPE DEFINITIONS ---
interface ApiService {
  id: string;
  name: string;
  description: string;
  type: string; // Keep as string for flexibility from API
}

// State to track only the user's choices
interface ServiceSelectionState {
  [serviceId: string]: {
      selected: boolean;
      price: string;
  };
}

export default function AddServicesScreen() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { setServices: saveServicesToStore } = useGarageStore();
  
  // REFACTORED STATE: Two separate, clean states
  const [masterServices, setMasterServices] = useState<ApiService[]>([]); // Original data from API
  const [selections, setSelections] = useState<ServiceSelectionState>({}); // User's interactions

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitiated = useRef(false);

  useEffect(() => {
    // 2. Only proceed if the user is signed in AND we haven't already tried to fetch.
    if (isSignedIn && !fetchInitiated.current) {
      
      // 3. Immediately mark that we are starting the fetch.
      //    This prevents any subsequent re-renders from triggering this block again.
      fetchInitiated.current = true;
      
      const fetchServices = async () => {
        setLoading(true);
        setError(null);
        console.log("1. Starting fetchServices (This should only run ONCE).");

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication token not found.");
            console.log("2. Token acquired.");

            const url = `${API_BASE_URL}/api/services`;
            console.log(`3. Fetching from: ${url}`);
            
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            console.log(`4. Received response with status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Connection failed (Status: ${response.status}).`);
            }

            const data: ApiService[] = await response.json();
            console.log("5. Successfully parsed JSON data.");
            
            if (!Array.isArray(data)) {
                throw new Error("API did not return an array of services.");
            }
            
            setMasterServices(data);

            const initialSelections: ServiceSelectionState = {};
            data.forEach(service => {
                initialSelections[service.id] = { selected: false, price: '' };
            });
            setSelections(initialSelections);
            console.log("6. State initialized.");

        } catch (e: any) {
            console.error("💥 CATCH BLOCK ERROR:", e);
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
            console.log("7. fetchServices finished.");
        }
      };

      fetchServices();
    }
  // 4. The dependency array now includes `isSignedIn`. The ref handles the "run once" logic.
  }, [isSignedIn, getToken]);

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
                // If de-selecting, clear the price. Otherwise, keep it.
                price: isNowSelected ? currentSelection.price : '',
            },
        };
    });
  };

  const handlePriceChange = (text: string, serviceId: string) => {
    setSelections(prev => ({
        ...prev,
        [serviceId]: {
            ...prev[serviceId],
            price: text.replace(/[^0-9.]/g, ''),
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
      return Alert.alert('No Services Selected', 'Please select and price at least one service to offer.');
    }
    if (selectedServices.some(s => isNaN(s.price) || s.price <= 0)) {
      return Alert.alert('Invalid Price', 'Please enter a valid, positive price for all selected services.');
    }

    saveServicesToStore(selectedServices);
    router.push('/settings/add-business/businesssetup/garage-setup/location-picker');
  };

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
    return <View style={styles.centered}>
      <RotatingLoader  
        iconName="navigate-circle-outline" 
        message="Loading Services..." 
        color="#ed8b65"
        size={50}
      />
      </View>;
  }
  
  if (error) {
    return <View style={styles.centered}><Ionicons name="cloud-offline-outline" size={48} color="#d9534f" /><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Step 2: Add Services' }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Select Your Services</Text>
            <Text style={styles.headerSubtitle}>Choose what you offer and set your prices.</Text>
        </View>
        
        {categorizedServices.map((category) => (
            <View key={category.title} style={styles.categoryCard}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                {category.services.map((service, index) => {
                    const selectionState = selections[service.id];
                    if (!selectionState) return null; // Should not happen, but a safe guard

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
                                    placeholder="e.g., 120.00 INR"
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
                <Text style={styles.fabText}>Next: Set Location</Text>
                {selectedCount > 0 && <View style={styles.fabBadge}><Text style={styles.fabBadgeText}>{selectedCount}</Text></View>}
              </View>
              <Ionicons name="arrow-forward" size={22} color="#fff" />
          </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 15, fontSize: 16, color: '#555' },
    errorText: { marginTop: 15, textAlign: 'center', color: '#d9534f', fontSize: 16, fontWeight: '500' },
    scrollContainer: { paddingHorizontal: 10, paddingBottom: 100 }, // Add padding for FAB
    headerContainer: { paddingHorizontal: 10, paddingVertical: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#333' },
    headerSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 4 },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    categoryTitle: {
        fontSize: 18, fontWeight: '600', color: '#fff', 
        backgroundColor: '#7b381a', padding: 15,
    },
    serviceItemContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceName: { fontSize: 16, color: '#444', flex: 1, marginRight: 10 },
    priceInputContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f7f7f7' },
    priceInput: { 
        height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 15, fontSize: 15, backgroundColor: '#fdfdfd'
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#b95528',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },
    fabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fabText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    fabBadge: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabBadgeText: {
        color: '#b95528',
        fontWeight: 'bold',
        fontSize: 14
    }
});