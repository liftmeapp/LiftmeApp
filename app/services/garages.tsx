import GarageMap from '@/components/GarageMap';
import { ServiceCategory } from '@/constants/enums';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// --- Helper: Filter Button Component ---
const FilterButton = ({ icon, label, isActive, onPress }: any) => (
    <TouchableOpacity
        style={[styles.filterButton, isActive && styles.activeFilterButton]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={20} color={isActive ? '#fff' : '#333'} />
        <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>{label}</Text>
    </TouchableOpacity>
);

// --- Helper: Haversine Distance Calculation ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const ServiceItem = ({ service, isSelected, onPress }: any) => (
    <TouchableOpacity
        style={[
            modalStyles.serviceItem,
            isSelected && modalStyles.selectedServiceItem,
            {
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 12,
                marginBottom: 12,
                backgroundColor: isSelected ? '#f8f4ff' : '#ffffff',
                borderWidth: 1.5,
                borderColor: isSelected ? '#b95528' : '#e8e8e8',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
            }
        ]}
        activeOpacity={0.7}
        onPress={onPress}
    >
        <Text style={[
            modalStyles.serviceItemText,
            isSelected && modalStyles.selectedServiceItemText,
            {
                fontSize: 16,
                fontWeight: isSelected ? '600' : '500',
                color: isSelected ? '#b95528' : '#2d3748',
                flex: 1,
            }
        ]}>
            {service.name}
        </Text>
        {isSelected && (
            <Ionicons
                name="checkmark-circle"
                size={24}
                color="#b95528"
                style={{ marginLeft: 8 }}
            />
        )}
    </TouchableOpacity>
);

// --- Main Component ---
const GaragesScreen = () => {
    const { getToken } = useAuth();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const [activeCategory, setActiveCategory] = useState<ServiceCategory[] | null>(null);
    const [filteredGarages, setFilteredGarages] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showServiceList, setShowServiceList] = useState(false);
    const [selectedCategoryServices, setSelectedCategoryServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [mapFilters, setMapFilters] = useState<{ category: string | null; serviceId: string | null }>({ category: null, serviceId: null });

    // --- Bottom Sheet Configuration ---
    const snapPoints = useMemo(() => ['10%', '50%', '85%'], []);

    // --- Fetch User Location ---
    useEffect(() => {
        const getUserLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied.');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);
        };
        getUserLocation();
    }, []);

    const fetchServicesForCategory = useCallback(async (categories: ServiceCategory[] | null) => {
        setLoadingServices(true);
        setSelectedCategoryServices([]);
        try {
            const token = await getToken();
            let url = `${API_BASE_URL}/api/services`;
            if (categories && categories.length > 0) {
                url += `?categories=${categories.join(',')}`;
            }
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Failed to fetch services.");
            const data = await response.json();
            setSelectedCategoryServices(data);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoadingServices(false);
        }
    }, [getToken]);

    // --- Handlers ---
    const handleCategoryFilterPress = (categories: ServiceCategory[] | null) => {
        setActiveCategory(categories);
        setSelectedServiceId(null);
        if (categories) {
            fetchServicesForCategory(categories);
            setShowServiceList(true);
        } else { // "All" is clicked
            setShowServiceList(false);
            setMapFilters({ category: null, serviceId: null });
            bottomSheetRef.current?.snapToIndex(1);
        }
    };

    const handleServiceSelect = (serviceId: string) => {
        setSelectedServiceId(serviceId);
        setShowServiceList(false);
        setMapFilters({ category: activeCategory ? activeCategory.join(',') : null, serviceId: serviceId });
        bottomSheetRef.current?.snapToIndex(1);
    };

    const handleGetDirections = (latitude: number, longitude: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url).catch(err => console.error('An error occurred opening maps', err));
    };

    const handleGaragesFiltered = (garages: any[]) => {
        setFilteredGarages(garages);
    };

    // --- Render Garage Item for Bottom Sheet ---
    const renderGarageItem = ({ item }: { item: any }) => {
        const distance = userLocation
            ? calculateDistance(userLocation.latitude, userLocation.longitude, item.location.coordinates[1], item.location.coordinates[0]).toFixed(2)
            : null;

        return (
            <View style={bottomSheetStyles.itemContainer}>
                <View style={bottomSheetStyles.itemDetails}>
                    <Text style={bottomSheetStyles.itemName}>{item.name}</Text>
                    <Text style={bottomSheetStyles.itemAddress}>{item.address}</Text>
                    {distance && <Text style={bottomSheetStyles.itemDistance}>{distance} km away</Text>}
                </View>
                <TouchableOpacity
                    style={bottomSheetStyles.directionButton}
                    onPress={() => handleGetDirections(item.location.coordinates[1], item.location.coordinates[0])}
                >
                    <Text style={bottomSheetStyles.directionButtonText}>Directions</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <GarageMap
                    providerType='garage'
                    filters={mapFilters}
                    isPinningLocation={false}
                    onPinLocationChange={() => { }}
                    onGaragesFiltered={handleGaragesFiltered} // Pass the callback here
                />
                <View style={styles.scrollViewContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                        <FilterButton
                            key="all"
                            icon="apps-outline"
                            label="All"
                            isActive={!activeCategory}
                            onPress={() => handleCategoryFilterPress(null)}
                        />
                        <FilterButton
                            key="car"
                            icon="car-sport-outline"
                            label="Car"
                            isActive={activeCategory?.includes(ServiceCategory.INGARAGE_CAR)}
                            onPress={() => handleCategoryFilterPress([ServiceCategory.INGARAGE_CAR])}
                        />
                        <FilterButton
                            key="bike"
                            icon="bicycle-outline"
                            label="Bike"
                            isActive={activeCategory?.includes(ServiceCategory.INGARAGE_BIKE)}
                            onPress={() => handleCategoryFilterPress([ServiceCategory.INGARAGE_BIKE])}
                        />
                        <FilterButton
                            key="ev"
                            icon="flash-outline"
                            label="EV"
                            isActive={activeCategory?.includes(ServiceCategory.INGARAGE_ELECTRIC)}
                            onPress={() => handleCategoryFilterPress([ServiceCategory.INGARAGE_ELECTRIC])}
                        />
                    </ScrollView>
                </View>

                <BottomSheet
                    ref={bottomSheetRef}
                    index={1} // Initially open
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                    backgroundStyle={bottomSheetStyles.background}
                    handleIndicatorStyle={bottomSheetStyles.handleIndicator}
                >
                    <BottomSheetFlatList
                        data={filteredGarages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderGarageItem}
                        contentContainerStyle={bottomSheetStyles.contentContainer}
                        ListHeaderComponent={<Text style={bottomSheetStyles.headerText}>Nearby Garages</Text>}
                        ListEmptyComponent={<Text style={bottomSheetStyles.emptyText}>No garages found for this category.</Text>}
                    />
                </BottomSheet>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showServiceList}
                    onRequestClose={() => setShowServiceList(false)}
                >
                    <View style={modalStyles.modalOverlay}>
                        <View style={modalStyles.modalContent}>
                            <Text style={modalStyles.modalTitle}>Select a Service</Text>
                            {loadingServices ? (
                                <ActivityIndicator size="large" color="#b95528" />
                            ) : (
                                <FlatList
                                    data={selectedCategoryServices}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <ServiceItem
                                            service={item}
                                            isSelected={selectedServiceId === item.id}
                                            onPress={() => handleServiceSelect(item.id)}
                                        />
                                    )}
                                    ListEmptyComponent={<Text style={modalStyles.emptyText}>No services found for this category.</Text>}
                                />
                            )}
                            <TouchableOpacity style={modalStyles.closeButton} onPress={() => setShowServiceList(false)}>
                                <Text style={modalStyles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </GestureHandlerRootView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContainer: {
        position: 'absolute',
        top: 100, // Positioned below the search bar
        left: 0,
        right: 0,
        zIndex: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        marginHorizontal: 5,
    },
    activeFilterButton: {
        backgroundColor: '#b95528',
    },
    filterButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    activeFilterButtonText: {
        color: '#fff',
    },
});

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    serviceItem: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedServiceItem: {
        backgroundColor: '#f0f8ff',
        borderColor: '#b95528',
    },
    serviceItemText: {
        fontSize: 18,
        color: '#333',
    },
    selectedServiceItemText: {
        fontWeight: 'bold',
        color: '#b95528',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    closeButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#b95528',
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const bottomSheetStyles = StyleSheet.create({
    background: {
        backgroundColor: '#f8f9fa',
    },
    handleIndicator: {
        backgroundColor: '#b95528',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#343a40',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    itemDetails: {
        flex: 1,
        marginRight: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    itemAddress: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    itemDistance: {
        fontSize: 14,
        color: '#b95528',
        fontWeight: '500',
        marginTop: 4,
    },
    directionButton: {
        backgroundColor: '#b95528',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    directionButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        color: '#6c757d',
    },
});

export default GaragesScreen;