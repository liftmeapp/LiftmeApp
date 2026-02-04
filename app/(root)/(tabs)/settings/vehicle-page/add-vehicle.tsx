import EmptyState from '@/components/EmptyState';
import RotatingLoader from '@/components/RotatingLoader';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, LayoutAnimation, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const VehicleCard = ({ vehicle }: { vehicle: any }) => (
    <View style={styles.card}>
        <View style={styles.iconContainer}>
            {vehicle.type === 'BIKE' ? (
                <Ionicons name="bicycle" size={24} color="#005C70" />
            ) : (
                <Ionicons name="car-sport" size={24} color="#005C70" />
            )}
        </View>
        <View style={styles.cardDetails}>
            <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.name}</Text>
            <Text style={styles.vehiclePlate}>{vehicle.plateNumber}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
        </TouchableOpacity>
    </View>
);

export default function MyVehiclesScreen() {
    const { getToken } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stable Fetch Function
    const fetchVehicles = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/vehicle/my-vehicles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setVehicles(data);
            } else {
                throw new Error("Failed to fetch vehicles");
            }
        } catch (err: any) {
            console.error("Error fetching vehicles:", err);
            setError("Unable to load your garage. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial Fetch on Focus
    useFocusEffect(
        useCallback(() => {
            fetchVehicles();
        }, [])
    );

    // Manual Refresh Handler
    const onRefresh = () => {
        setRefreshing(true);
        fetchVehicles(true);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header with Padding */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Vehicles</Text>
            </View>

            {/* Scrollable Content */}
            {loading && vehicles.length === 0 ? (
                <View style={styles.centered}>
                    <RotatingLoader size={40} color="#005C70" />
                </View>
            ) : error ? (
                <EmptyState
                    title="Connection Issue"
                    message={error}
                    iconName="cloud-offline-outline"
                    actionLabel="Retry"
                    onAction={() => fetchVehicles(false)}
                />
            ) : (
                <FlatList
                    style={{ flex: 1 }}
                    data={vehicles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <VehicleCard vehicle={item} />}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            title="No Vehicles Found"
                            message="Add a vehicle to manage your garage."
                            iconName="car-sport-outline"
                        />
                    }
                />
            )}

            {/* Floating Action Button */}
            {/* Raised to 100 to clear any potential Bottom Tab Bar */}
            <View style={[styles.buttonWrapper, { bottom: 100 }]}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/settings/vehicle-page/new-vehicle')}
                >
                    <Ionicons name="add" size={24} color="#005C70" style={{ marginRight: 8 }} />
                    <Text style={styles.addButtonText}>Add New Vehicle</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // ... previous styles ...
    container: {
        flex: 1,
        backgroundColor: '#e0e0e0',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        backgroundColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for the floating button
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 10, // Reduced from 15
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#b3e5fc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardDetails: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    vehiclePlate: {
        fontSize: 14,
        color: '#333',
        marginTop: 2,
    },
    moreButton: {
        padding: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    buttonWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 999,
        elevation: 10,
    },
    addButton: {
        backgroundColor: '#fff',
        // width: '100%', // Removed full width to be "just wide enough"
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30, // Pill shape
        flexDirection: 'row', // Icon + Text
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    addButtonText: {
        color: '#005C70',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
