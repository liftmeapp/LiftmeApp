import GarageMap from '@/components/GarageMap';
import { ServiceCategory } from '@/constants/enums';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

// --- Main Component ---
const GaragesScreen = () => {
    const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);

    const filters = {
        category: activeCategory,
        services: [], // We will add specific service filters here later
    };

    return (
        <View style={styles.container}>
            <GarageMap 
                providerType='garage'
                filters={filters}
                isPinningLocation={false}
                onPinLocationChange={() => {}} // Not used in this screen
            />
            <View style={styles.filterContainer}>
                <FilterButton 
                    icon="apps-outline" 
                    label="All"
                    isActive={!activeCategory}
                    onPress={() => setActiveCategory(null)}
                />
                <FilterButton 
                    icon="car-sport-outline" 
                    label="Car"
                    isActive={activeCategory === ServiceCategory.ROADSIDE_CAR}
                    onPress={() => setActiveCategory(ServiceCategory.ROADSIDE_CAR)}
                />
                <FilterButton 
                    icon="bicycle-outline" 
                    label="Bike"
                    isActive={activeCategory === ServiceCategory.ROADSIDE_BIKE}
                    onPress={() => setActiveCategory(ServiceCategory.ROADSIDE_BIKE)}
                />
            </View>
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterContainer: {
        position: 'absolute',
        bottom: 90, // Increased to clear the tab bar
        left: 10,
        right: 10,
        zIndex: 10, // Ensure it's on top of the map
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
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

export default GaragesScreen;