import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, SafeAreaView, FlatList } from "react-native";
import { useRouter, useFocusEffect, Stack } from "expo-router";
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RotatingLoader from '@/components/RotatingLoader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Reusable Vehicle Card Component
const VehicleCard = ({ vehicle, onDelete }: { vehicle: any, onDelete: (id: string) => void }) => (
    <View style={styles.card}>
        <View style={styles.cardIcon}>
            <Ionicons name="car-sport" size={30} color="#b95528" />
        </View>
        <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>{`${vehicle.brand} ${vehicle.name}`}</Text>
            <Text style={styles.cardSubtitle}>{vehicle.plateNumber}</Text>
            <Text style={styles.cardInfo}>{`${vehicle.type} • ${vehicle.year}`}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(vehicle.id)}>
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
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

    const vehicleLimit = 3;
    const isPremium = user?.publicMetadata?.isPremium === true; // Check for premium status
    const canAddVehicle = isPremium || vehicles.length < vehicleLimit;

    const fetchData = useCallback(async () => {
        try {
            const token = await getToken();
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
    }, [getToken]);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

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
            <Stack.Screen options={{ title: 'My Vehicles' }} />
            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <VehicleCard vehicle={item} onDelete={handleDelete} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.heading}>My Vehicles</Text>
                        <Text style={styles.subheading}>Manage your saved vehicles here.</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="car-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No vehicles found.</Text>
                        <Text style={styles.emptySubtext}>Add your first vehicle to get started!</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 120 }} // Space for the button
            />

            <View style={styles.fabContainer}>
                {!canAddVehicle && (
                    <Text style={styles.limitText}>
                        Vehicle limit reached. Go Premium to add more.
                    </Text>
                )}
                <TouchableOpacity
                    onPress={() => router.push('/settings/vehicle-page/add-vehicle')}
                    disabled={!canAddVehicle}
                >
                    <LinearGradient
                        colors={canAddVehicle ? ['#c3683c', '#b95528'] : ['#b0b0b0', '#999999']}
                        style={styles.fab}
                    >
                        <Ionicons name="add" size={28} color="#fff" />
                        <Text style={styles.fabText}>Add New Vehicle</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa",marginTop:40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingBottom: 10, alignItems: 'center' },
    heading: { fontSize: 28, fontWeight: 'bold' },
    subheading: { fontSize: 16, color: '#666', marginTop: 4 },
    card: {
        backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 15, marginVertical: 8, padding: 15, borderRadius: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    cardIcon: { padding: 12, backgroundColor: '#fdf0e7', borderRadius: 50, marginRight: 15 },
    cardDetails: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 15, color: '#555', marginTop: 2, fontWeight: '500' },
    cardInfo: { fontSize: 13, color: '#888', marginTop: 3 },
    deleteButton: { padding: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { marginTop: 15, fontSize: 20, fontWeight: '600', color: '#999' },
    emptySubtext: { marginTop: 5, fontSize: 16, color: '#aaa' },
    fabContainer: { position: 'absolute', bottom: 20, left: 20, right: 20, alignItems: 'center' },
    limitText: { color: '#c0392b', marginBottom: 10, fontWeight: '500', backgroundColor: '#f5e1e1', padding: 8, borderRadius: 6 },
    fab: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, alignItems: 'center', elevation: 5 },
    fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});