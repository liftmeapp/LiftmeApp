import GarageMap from '@/components/GarageMap';
import { ServiceCategory } from '@/constants/enums';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// --- Filter Button Component ---
const FilterButton = ({ icon, label, isActive, onPress }: any) => (
    <TouchableOpacity 
        style={[styles.filterButton, isActive && styles.activeFilterButton]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={20} color={isActive ? '#fff' : '#333'} />
        <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>{label}</Text>
    </TouchableOpacity>
);

// --- Service Item Component for Modal ---
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

    const [activeCategory, setActiveCategory] = useState<ServiceCategory[] | null>(null);
    const [showServiceList, setShowServiceList] = useState(false);
    const [selectedCategoryServices, setSelectedCategoryServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

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

    const handleCategoryFilterPress = (categories: ServiceCategory[] | null) => {
        setActiveCategory(categories);
        setSelectedServiceId(null); // Reset selected service when category changes
        if (categories) {
            fetchServicesForCategory(categories);
            setShowServiceList(true);
        } else {
            setShowServiceList(false);
        }
    };

    const handleServiceSelect = (serviceId: string) => {
        setSelectedServiceId(serviceId);
        setShowServiceList(false);
    };

    const filters = {
        category: activeCategory ? activeCategory.join(',') : null, // Pass categories as comma-separated string
        serviceId: selectedServiceId,
    };

    console.log('[GaragesScreen] Filters being passed to GarageMap:', filters);

    return (
        <View style={styles.container}>
            <GarageMap 
                providerType='garage'
                filters={filters}
                isPinningLocation={false}
                onPinLocationChange={() => {}} // Not used in this screen
            />
            <View style={styles.scrollViewContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    <FilterButton 
                        icon="apps-outline" 
                        label="All"
                        isActive={!activeCategory}
                        onPress={() => handleCategoryFilterPress(null)}
                    />
                    <FilterButton 
                        icon="car-sport-outline" 
                        label="Car"
                        isActive={activeCategory?.includes(ServiceCategory.ROADSIDE_CAR) || activeCategory?.includes(ServiceCategory.LUXURY)}
                        onPress={() => handleCategoryFilterPress([ServiceCategory.ROADSIDE_CAR, ServiceCategory.LUXURY])}
                    />
                    <FilterButton 
                        icon="bicycle-outline" 
                        label="Bike"
                        isActive={activeCategory?.includes(ServiceCategory.ROADSIDE_BIKE)}
                        onPress={() => handleCategoryFilterPress([ServiceCategory.ROADSIDE_BIKE])}
                    />
                    <FilterButton 
                        icon="flash-outline" 
                        label="EV"
                        isActive={activeCategory?.includes(ServiceCategory.ELECTRIC_VEHICLE)}
                        onPress={() => handleCategoryFilterPress([ServiceCategory.ELECTRIC_VEHICLE])}
                    />
                </ScrollView>
            </View>

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
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContainer: {
        position: 'absolute',
        bottom: 90,
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

export default GaragesScreen;