import RotatingLoader from '@/components/RotatingLoader';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Reusable Vehicle Card Component
const VehicleCard = ({ vehicle, onDelete }: { vehicle: any, onDelete: (id: string) => void }) => (
    <View style={styles.card}>
        <View style={styles.cardIcon}>
            <Ionicons name="car-sport" size={24} color="#005C70" />
        </View>
        <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>{`${vehicle.brand} ${vehicle.name}`}</Text>
            <Text style={styles.cardSubtitle}>{vehicle.plateNumber}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(vehicle.id)}>
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
    </View>
);

export default function VehicleDashboard() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { user } = useUser(); // Clerk hook to get user info, including premium status

    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Use ref to ensure getToken doesn't trigger effect re-runs if it changes identity
    const getTokenRef = React.useRef(getToken);
    React.useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

    const fetchData = useCallback(async () => {
        try {
            const token = await getTokenRef.current();
            const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Could not load your vehicles.");
            const data = await response.json();
            setVehicles(data);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        fetchData();
    }, [fetchData]));

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleDelete = (vehicleId: string) => {
        Alert.alert(
            "Delete Vehicle",
            "Are you sure you want to delete this vehicle? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => performDelete(vehicleId) }
            ]
        );
    };

    const performDelete = async (vehicleId: string) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error("Failed to delete vehicle. Please try again.");
            }
            Alert.alert("Success", "Vehicle has been deleted.");
            fetchData(); // Refresh the list after deleting
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    if (loading || refreshing) {
        return (
            <View style={styles.centered}>
                <RotatingLoader />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#005C70" />
                </TouchableOpacity>
                <Text style={styles.heading}>My Vehicles</Text>
            </View>

            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <VehicleCard vehicle={item} onDelete={handleDelete} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="car-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No vehicles found.</Text>
                        <Text style={styles.emptySubtext}>Add your first vehicle to get started!</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 150 }} // Increased space for FAB
            />

            <View style={styles.fabContainer}>
                <TouchableOpacity
                    onPress={() => router.push('/settings/vehicle-page/new-vehicle')}
                    activeOpacity={0.8}
                    style={styles.fab}
                >
                    <Ionicons name="add" size={24} color="#005C70" />
                    <Text style={styles.fabText}>Add New Vehicle</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa" },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header: Added top padding for Android/Safe Area
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: Platform.OS === 'android' ? 50 : 10,
        backgroundColor: '#f8f9fa' // Match bg to blend in or keep white
    },
    backButton: { marginRight: 15, padding: 5 },
    heading: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },

    card: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
        marginVertical: 6,
        padding: 16, // Bigger
        borderRadius: 20, // Modern rounded
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardIcon: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#b3e5fc', // Teal-ish/Blue tint
        borderRadius: 15,
        marginRight: 15
    },
    cardDetails: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
    cardSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },
    deleteButton: { padding: 10 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { marginTop: 15, fontSize: 18, fontWeight: '600', color: '#999' },
    emptySubtext: { marginTop: 5, fontSize: 14, color: '#aaa' },

    fabContainer: { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center' },
    fab: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 30,
        backgroundColor: '#fff', // White pill
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#005C70',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    fabText: { color: '#005C70', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});