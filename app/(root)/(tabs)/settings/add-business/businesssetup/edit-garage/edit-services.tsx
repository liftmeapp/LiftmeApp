// /app/(root)/(tabs)/settings/add-business/businesssetup/edit-garage/edit-services.tsx

import RotatingLoader from '@/components/RotatingLoader';
import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView, StyleSheet,
  Switch,
  Text, TextInput,
  UIManager,
  View
} from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const MAIN_VEHICLE_CATEGORIES = [
  { key: 'INGARAGE_CAR', label: 'In-Garage Car Services' },
  { key: 'INGARAGE_BIKE', label: 'In-Garage Bike Services' },
  { key: 'INGARAGE_ELECTRIC', label: 'In-Garage Electric Vehicle Services' },
  { key: 'ROADSIDE_CAR', label: 'Roadside Car Services' },
  { key: 'ROADSIDE_BIKE', label: 'Roadside Bike Services' },
  { key: 'ELECTRIC_VEHICLE', label: 'Electric Vehicle Services' },
  { key: 'HOME_SERVICE', label: 'Home Services' },
  { key: 'LUXURY', label: 'Luxury Services' },
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ApiService {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
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
  const { services: existingServices, setServices: saveServicesToStore, supportedVehicleTypes: existingSupportedVehicleTypes, setSupportedVehicleTypes } = useGarageStore();
  console.log("EditServicesScreen: existingSupportedVehicleTypes from store:", existingSupportedVehicleTypes);
  const [masterServices, setMasterServices] = useState<ApiService[]>([]);
  const [selections, setSelections] = useState<ServiceSelectionState>({});
  const [categorySelections, setCategorySelections] = useState<{[key: string]: boolean}>({}); // New state for category selection
  const [selectedVehicleCategories, setSelectedVehicleCategories] = useState<string[]>([]); // New state for top-level vehicle categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const fetchInitiated = useRef(false);

  useEffect(() => {
    // This check prevents fetching if the user is not signed in when the component mounts.
    if (!isSignedIn) {
      setLoading(false);
      setError("Authentication required to load services.");
      return;
    }

    // Only proceed if existingSupportedVehicleTypes has been loaded (or is an empty array, indicating no types were previously selected)
    // This prevents the component from initializing with an empty array before edit-details.tsx has populated the store.
    // Removed: if (existingSupportedVehicleTypes === undefined) { return; }

    const fetchAndInitialize = async () => {
      setLoading(true);
      setError(null);
      try {
          const token = await getToken();
          if (!token) throw new Error("Authentication token not found.");
          const response = await fetch(`${API_BASE_URL}/api/services`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (!response.ok) throw new Error(`Failed to fetch services list (Status: ${response.status}).`);

          const allServices: ApiService[] = await response.json();
          if (!Array.isArray(allServices)) throw new Error("API did not return a valid list of services.");
          
          setMasterServices(allServices);

          const existingServicesMap = new Map(existingServices.map(s => [s.serviceId, s.price]));
          const initialSelections: ServiceSelectionState = {};
          const initialCategorySelections: { [key: string]: boolean } = {};
          
          // Initialize individual service selections
          allServices.forEach(service => {
              const price = existingServicesMap.get(service.id);
              initialSelections[service.id] = {
                  selected: price !== undefined,
                  price: price !== undefined ? String(price) : '',
              };
          });

          // Derive active categories from the list of existing services
          const selectedServiceIds = new Set(existingServices.map(s => s.serviceId));
          const activeCategories = new Set<string>();
          allServices.forEach(service => {
              if (selectedServiceIds.has(service.id)) {
                  activeCategories.add(service.category);
              }
          });
          const activeCategoriesArray = Array.from(activeCategories);

          // Initialize category selections based on derived active categories
          MAIN_VEHICLE_CATEGORIES.forEach(mainCat => {
              initialCategorySelections[mainCat.key] = activeCategoriesArray.includes(mainCat.key);
          });

          setSelections(initialSelections);
          setCategorySelections(initialCategorySelections);
          setSelectedVehicleCategories(activeCategoriesArray); // Set initial main categories

      } catch (e: any) {
          console.error("💥 ERROR during initialization:", e);
          setError(e.message || 'An unknown error occurred.');
      } finally {
          setLoading(false);
      }
    };

    fetchAndInitialize();
  }, [isSignedIn, existingServices, existingSupportedVehicleTypes]);

  useEffect(() => {
    // This effect ensures that when main vehicle categories are toggled,
    // the individual category sections are shown or hidden.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategorySelections(prevCategorySelections => {
        const newCategorySelections: { [key: string]: boolean } = { ...prevCategorySelections };
        MAIN_VEHICLE_CATEGORIES.forEach(mainCat => {
            const isMainCatSelected = selectedVehicleCategories.includes(mainCat.key);
            newCategorySelections[mainCat.key] = isMainCatSelected;
        });
        return newCategorySelections;
    });
  }, [selectedVehicleCategories]);

  const toggleService = (serviceId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelections(prev => {
        const currentSelection = prev[serviceId];
        const isNowSelected = !currentSelection.selected;
        const updatedSelections = {
            ...prev,
            [serviceId]: {
                ...currentSelection,
                selected: isNowSelected,
                price: isNowSelected ? currentSelection.price : '',
            },
        };

        return updatedSelections;
    });
  };

  const toggleMainVehicleCategory = (mainCategoryKey: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedVehicleCategories(prev => {
        const isNowSelected = !prev.includes(mainCategoryKey);
        const updatedMainCategories = isNowSelected
            ? [...prev, mainCategoryKey]
            : prev.filter(cat => cat !== mainCategoryKey);
        return updatedMainCategories;
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

  const handleNext = async () => {
    if (!garageId) {
      console.error('garageId is undefined');
      Alert.alert('Error', 'Garage ID is missing. Please go back and try again.');
      return;
    }

    const selectedServices = Object.entries(selections)
      .filter(([, value]) => value.selected)
      .map(([serviceId, value]) => {
        const service = masterServices.find(s => s.id === serviceId);
        const isNoPriceCategory = service?.category === 'INGARAGE_CAR' || service?.category === 'INGARAGE_BIKE';
        
        return {
          serviceId,
          garageId,
          price: isNoPriceCategory ? 0 : parseFloat(value.price),
          duration: 60, // Default duration of 60 minutes, adjust as needed
          // Temporary property for validation
          _isNoPriceCategory: isNoPriceCategory,
        };
      });
  
    if (selectedServices.length === 0) {
      return Alert.alert('No Services Selected', 'You must offer at least one service.');
    }
    
    const invalidPriceService = selectedServices.find(s => !s._isNoPriceCategory && (isNaN(s.price) || s.price <= 0));
    if (invalidPriceService) {
      return Alert.alert('Invalid Price', 'Please enter a valid, positive price for all selected services that require pricing.');
    }
  
    try {
      setIsNavigating(true);
      
      // Prepare data for the store by removing the temporary property
      const servicesToStore = selectedServices.map(({ _isNoPriceCategory, ...rest }) => rest);

      // Save services to store
      saveServicesToStore(servicesToStore);
      console.log("EditServicesScreen: Saving selectedVehicleCategories to store:", selectedVehicleCategories);
      setSupportedVehicleTypes(selectedVehicleCategories);
      
      // Navigate to the next screen
      router.push({
        pathname: '/settings/add-business/businesssetup/location-picker',
        params: { garageId }
      });
      
    } catch (error) {
      console.error('Error saving services:', error);
      Alert.alert('Error', 'Failed to save services. Please try again.');
      setIsNavigating(false);
    }
  };

  const categorizedServices = useMemo(() => {
    if (!masterServices.length) return [];
    
    let garageServices = masterServices.filter(service => service.category !== 'TOWING');

    const groups = garageServices.reduce((acc, service) => {
        const key = service.category || 'GENERAL_LISTING';
        if (!acc[key]) { acc[key] = []; }
        acc[key].push(service);
        return acc;
    }, {} as Record<string, ApiService[]>);

    return Object.entries(groups).map(([categoryKey, servicesList]) => ({
        title: MAIN_VEHICLE_CATEGORIES.find(cat => cat.key === categoryKey)?.label || categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        key: categoryKey,
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
    <View style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Step 2: Update Services' }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Update Your Services</Text>
            <Text style={styles.headerSubtitle}>Add or remove offerings and adjust your prices.</Text>
        </View>

        <View style={styles.mainCategoryContainer}>
            <Text style={styles.mainCategoryTitle}>Vehicle Types Serviced</Text>
            {MAIN_VEHICLE_CATEGORIES.map(mainCat => (
                <View key={mainCat.key} style={styles.mainCategoryItem}>
                    <Text style={styles.mainCategoryItemText}>{mainCat.label}</Text>
                    <Switch
                        trackColor={{ false: "#ccc", true: "#b95528" }}
                        thumbColor={"#fff"}
                        onValueChange={() => toggleMainVehicleCategory(mainCat.key)}
                        value={selectedVehicleCategories.includes(mainCat.key)}
                    />
                </View>
            ))}
        </View>
        
        {categorizedServices.map((category) => (
            <View key={category.title} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
                {categorySelections[category.key] && category.services.map((service, index) => {
                    const selectionState = selections[service.id];
                    if (!selectionState) return null;

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
                            {selectionState.selected && !['INGARAGE_CAR', 'INGARAGE_BIKE'].includes(service.category) && (
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

      <View style={styles.fabContainer}>
        <Pressable 
          onPress={handleNext} 
          disabled={loading || isNavigating}
          style={({ pressed }) => [
            styles.fab,
            (loading || isNavigating) && styles.disabledFab,
            pressed && !loading && !isNavigating && styles.pressedFab
          ]}
        >
          <LinearGradient 
            colors={['#c3683c', '#b95528']} 
            style={styles.fabGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            {isNavigating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.fabContent}>
                <Text style={styles.fabText}>
                  {selectedCount > 0 
                    ? 'Next: Update Location' 
                    : 'Select Services to Continue'}
                </Text>
                {!isNavigating && selectedCount > 0 && (
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.arrowIcon} />
                )}
              </View>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    fabContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      alignItems: 'center',
      borderRadius: 30,
      elevation: 8,
    },
    safeArea: { flex: 1, backgroundColor: '#f8f9fa',paddingTop: 28 },
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
    },
    fab: {
      width: '100%',
      borderRadius: 30,
      overflow: 'hidden',
    },
    fabGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      width: '100%',
      borderRadius: 30,
    },
    disabledFab: {
      opacity: 0.6,
    },
    pressedFab: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    fabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      position: 'relative',
    },
    fabText: { 
      color: '#fff', 
      fontSize: 18, 
      fontWeight: 'bold', 
      textAlign: 'center',
    },
    arrowIcon: {
      marginLeft: 8,
    },
    fabBadge: {
        backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24,
    },
    fabBadgeText: { color: '#b95528', fontWeight: 'bold', fontSize: 14 },
    mainCategoryContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        padding: 15,
    },
    mainCategoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    mainCategoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    mainCategoryItemText: {
        fontSize: 16,
        color: '#444',
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#7b381a',
        padding: 15,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
});