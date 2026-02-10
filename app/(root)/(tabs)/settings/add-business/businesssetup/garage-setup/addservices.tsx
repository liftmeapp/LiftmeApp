// /app/(root)/(tabs)/settings/add-business/businesssetup/garage-setup/add-services.tsx

import RotatingLoader from "@/components/RotatingLoader";
import { useGarageStore } from "@/store/garageStore";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const MAIN_VEHICLE_CATEGORIES = [
  { key: "INGARAGE_CAR", label: "In-Garage Car Services" },
  { key: "INGARAGE_BIKE", label: "In-Garage Bike Services" },
  { key: "INGARAGE_ELECTRIC", label: "In-Garage Electric Vehicle Services" },
  { key: "ROADSIDE_CAR", label: "Roadside Car Services" },
  { key: "ROADSIDE_BIKE", label: "Roadside Bike Services" },
  { key: "ELECTRIC_VEHICLE", label: "Electric Vehicle Services" },
  { key: "HOME_SERVICE", label: "Home Services" },
  { key: "LUXURY", label: "Luxury Services" },
];

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TYPE DEFINITIONS ---
interface ApiService {
  id: string;
  name: string;
  description: string;
  type: string; // Keep as string for flexibility from API
  category: string;
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
  const { garageId } = useLocalSearchParams<{ garageId: string }>();
  const { getToken, isSignedIn } = useAuth();
  const { setServices: saveServicesToStore, setSupportedVehicleTypes } =
    useGarageStore();
  const [isNavigating, setIsNavigating] = useState(false);
  // REFACTORED STATE: Two separate, clean states
  const [masterServices, setMasterServices] = useState<ApiService[]>([]); // Original data from API
  const [selections, setSelections] = useState<ServiceSelectionState>({}); // User's interactions
  const [categorySelections, setCategorySelections] = useState<{
    [key: string]: boolean;
  }>({}); // New state for category selection
  const [selectedVehicleCategories, setSelectedVehicleCategories] = useState<
    string[]
  >([]); // New state for top-level vehicle categories

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

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
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
          data.forEach((service) => {
            initialSelections[service.id] = { selected: false, price: "" };
          });

          setSelections(initialSelections);
          setSelectedVehicleCategories([]); // Initialize as empty
          console.log("6. State initialized.");
        } catch (e: any) {
          console.error("💥 CATCH BLOCK ERROR:", e);
          setError(e.message || "An unknown error occurred.");
        } finally {
          setLoading(false);
          console.log("7. fetchServices finished.");
        }
      };

      fetchServices();
    }
    // 4. The dependency array now includes `isSignedIn`. The ref handles the "run once" logic.
  }, [isSignedIn]);

  useEffect(() => {
    // This effect ensures that when main vehicle categories are toggled,
    // the individual category sections are shown or hidden.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategorySelections((prevCategorySelections) => {
      const newCategorySelections: { [key: string]: boolean } = {
        ...prevCategorySelections,
      };
      MAIN_VEHICLE_CATEGORIES.forEach((mainCat) => {
        const isMainCatSelected = selectedVehicleCategories.includes(
          mainCat.key,
        );
        newCategorySelections[mainCat.key] = isMainCatSelected;
      });
      return newCategorySelections;
    });
  }, [selectedVehicleCategories]);

  const toggleService = (serviceId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelections((prev) => {
      const currentSelection = prev[serviceId];
      const isNowSelected = !currentSelection.selected;
      const updatedSelections = {
        ...prev,
        [serviceId]: {
          ...currentSelection,
          selected: isNowSelected,
          price: isNowSelected ? currentSelection.price : "",
        },
      };

      return updatedSelections;
    });
  };

  const toggleMainVehicleCategory = (mainCategoryKey: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedVehicleCategories((prev) => {
      const isNowSelected = !prev.includes(mainCategoryKey);
      const updatedMainCategories = isNowSelected
        ? [...prev, mainCategoryKey]
        : prev.filter((cat) => cat !== mainCategoryKey);
      return updatedMainCategories;
    });
  };

  const handlePriceChange = (text: string, serviceId: string) => {
    setSelections((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        price: text.replace(/[^0-9.]/g, ""),
      },
    }));
  };

  const handleNext = () => {
    const selectedServices = Object.entries(selections)
      .filter(([, value]) => value.selected)
      .map(([serviceId, value]) => {
        const service = masterServices.find((s) => s.id === serviceId);
        const isNoPriceCategory =
          service?.category === "INGARAGE_CAR" ||
          service?.category === "INGARAGE_BIKE";

        return {
          serviceId,
          price: isNoPriceCategory ? 0 : parseFloat(value.price),
          duration: 60, // Add default duration
          garageId: "", // Add placeholder for new garage
          // Temporary property for validation
          _isNoPriceCategory: isNoPriceCategory,
        };
      });

    if (selectedServices.length === 0) {
      return Alert.alert(
        "No Services Selected",
        "Please select and price at least one service to offer.",
      );
    }

    // Validate prices only for services that require them
    const invalidPriceService = selectedServices.find(
      (s) => !s._isNoPriceCategory && (isNaN(s.price) || s.price <= 0),
    );
    if (invalidPriceService) {
      return Alert.alert(
        "Invalid Price",
        "Please enter a valid, positive price for all selected services that require pricing.",
      );
    }

    // Prepare data for the store by removing the temporary property
    const servicesToStore = selectedServices.map(
      ({ _isNoPriceCategory, ...rest }) => rest,
    );

    saveServicesToStore(servicesToStore);
    console.log(
      "AddServicesScreen: Saving selectedVehicleCategories to store:",
      selectedVehicleCategories,
    );
    setSupportedVehicleTypes(selectedVehicleCategories);
    router.push({
      pathname: "/settings/add-business/businesssetup/location-picker",
      params: { garageId, mode: 'garage' }
    });
  };

  const categorizedServices = useMemo(() => {
    if (!masterServices.length) return [];

    let garageServices = masterServices.filter(
      (service) => service.category !== "TOWING",
    );

    const groups = garageServices.reduce(
      (acc, service) => {
        const key = service.category || "GENERAL_LISTING";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(service);
        return acc;
      },
      {} as Record<string, ApiService[]>,
    );

    return Object.entries(groups).map(([categoryKey, servicesList]) => ({
      title:
        MAIN_VEHICLE_CATEGORIES.find((cat) => cat.key === categoryKey)?.label ||
        categoryKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      key: categoryKey,
      services: servicesList,
    }));
  }, [masterServices]);

  const selectedCount = useMemo(
    () => Object.values(selections).filter((s) => s.selected).length,
    [selections],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <RotatingLoader
          iconName="navigate-circle-outline"
          message="Loading Services..."
          color="#005C70"
          size={50}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color="#d9534f" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Step 2: Add Services" }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Select Your Services</Text>
          <Text style={styles.headerSubtitle}>
            Choose what you offer and set your prices.
          </Text>
        </View>

        <View style={styles.mainCategoryContainer}>
          <Text style={styles.mainCategoryTitle}>Services Offered</Text>
          {MAIN_VEHICLE_CATEGORIES.map((mainCat) => (
            <View key={mainCat.key} style={styles.mainCategoryItem}>
              <Text style={styles.mainCategoryItemText}>{mainCat.label}</Text>
              <Switch
                trackColor={{ false: "#ccc", true: "#005C70" }}
                thumbColor={"#fff"}
                onValueChange={() => toggleMainVehicleCategory(mainCat.key)}
                value={selectedVehicleCategories.includes(mainCat.key)}
                style={{ transform: [{ scale: 0.7 }] }}
              />
            </View>
          ))}
        </View>

        {categorizedServices.map((category) => {
          // Only show the category (heading + list) if it matches a selected vehicle type
          if (!selectedVehicleCategories.includes(category.key)) {
            return null;
          }

          return (
            <View key={category.title} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>
              {category.services.map((service, index) => {
                const selectionState = selections[service.id];
                if (!selectionState) return null;

                return (
                  <View
                    key={service.id}
                    style={[
                      styles.serviceItemContainer,
                      index === category.services.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    <View style={styles.serviceRow}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Switch
                        trackColor={{ false: "#ccc", true: "#005C70" }}
                        thumbColor={"#fff"}
                        onValueChange={() => toggleService(service.id)}
                        value={selectionState.selected}
                        style={{ transform: [{ scale: 0.7 }] }}
                      />
                    </View>
                    {selectionState.selected &&
                      !["INGARAGE_CAR", "INGARAGE_BIKE"].includes(
                        service.category,
                      ) && (
                        <View style={styles.priceInputContainer}>
                          <TextInput
                            style={styles.priceInput}
                            placeholder="e.g., 120.00 INR"
                            placeholderTextColor="#999"
                            keyboardType="decimal-pad"
                            value={selectionState.price}
                            onChangeText={(text) =>
                              handlePriceChange(text, service.id)
                            }
                          />
                        </View>
                      )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.fabContainer}>
        <Pressable
          onPress={handleNext}
          disabled={loading || isNavigating}
          style={({ pressed }) => [
            styles.fab,
            (loading || isNavigating) && styles.disabledFab,
            pressed && !loading && !isNavigating && styles.pressedFab,
          ]}
        >
          <LinearGradient
            colors={["#005C70", "#003d4a"]} // Teal gradient
            style={styles.fabGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            {isNavigating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.fabContent}>
                <Text style={styles.fabText}>Next: Set Location</Text>
                <Ionicons
                  name="arrow-forward"
                  size={24}
                  color="#fff"
                  style={styles.arrowIcon}
                />
              </View>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingHorizontal: 12, paddingBottom: 180 }, // Add padding for FAB
  headerContainer: { paddingHorizontal: 10, paddingVertical: 16 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12, // Reduced
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff", // Reduced font size
    backgroundColor: "#005C70",
    padding: 0,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#005C70",
    paddingVertical: 12, // Reduced
    paddingHorizontal: 16,
  },
  serviceItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10, // Reduced
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceName: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    marginRight: 10,
    fontWeight: "500",
  },
  priceInputContainer: { marginTop: 8, paddingTop: 0 },
  priceInput: {
    height: 40,
    borderWidth: 0,
    borderRadius: 8, // Reduced height
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#f0f0f0",
    color: "#333",
    fontWeight: "500",
  },
  fab: {
    borderRadius: 16,
    width: "100%",
    shadowColor: "#005C70",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledFab: {
    opacity: 0.6,
  },
  pressedFab: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  fabGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
  },
  fabText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  fabBadge: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  fabBadgeText: {
    color: "#005C70",
    fontWeight: "bold",
    fontSize: 14,
  },
  mainCategoryContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16, // Reduced
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    padding: 16, // Reduced padding
  },
  mainCategoryTitle: {
    fontSize: 16, // Reduced
    fontWeight: "700",
    color: "#005C70", // Brand color
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  mainCategoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8, // Reduced padding
  },
  mainCategoryItemText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  safeArea: { flex: 1, backgroundColor: "#eef0f3", paddingTop: 10 },
  fabContainer: {
    position: "absolute",
    bottom: 110, // Adjusted back to 110 for better balance
    left: 20,
    right: 20,
    alignItems: "center",
    borderRadius: 30,
    elevation: 8,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    marginTop: 15,
    textAlign: "center",
    color: "#d9534f",
    fontSize: 16,
    fontWeight: "500",
  },
});
