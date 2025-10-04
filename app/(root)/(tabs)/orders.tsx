import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const OrderCard = ({ booking, onCancel }: { booking: any, onCancel: (bookingId: string) => void }) => {
    const provider = booking.garage || booking.towTruck;
    const travelEta = booking.providerEta || 0;
    const serviceEta = travelEta + 30; // 30 minutes for the service itself

    const [canCancel, setCanCancel] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (booking.status === 'CONFIRMED') {
            const confirmedAt = new Date(booking.updatedAt).getTime();
            const fiveMinutes = 5 * 60 * 1000;
            
            const updateTimer = () => {
                const now = Date.now();
                const timePassed = now - confirmedAt;

                if (timePassed < fiveMinutes) {
                    setCanCancel(true);
                    setTimeLeft(fiveMinutes - timePassed);
                    return true; // Continue timer
                } else {
                    setCanCancel(false);
                    setTimeLeft(0);
                    return false; // Stop timer
                }
            };

            if (updateTimer()) { // Initial check
                const interval = setInterval(() => {
                    if (!updateTimer()) {
                        clearInterval(interval);
                    }
                }, 1000);
                return () => clearInterval(interval);
            }
        }
    }, [booking.status, booking.updatedAt]);

    const formatTimeLeft = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleCall = () => {
        if (provider?.contactPhone) {
            Linking.openURL(`tel:${provider.contactPhone}`);
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.serviceName}>{booking.service?.name || 'Towing Service'}</Text>
                <Text style={[styles.status, styles[`status_${booking.status}`]]}>{booking.status.replace('_', ' ')}</Text>
            </View>

            <View style={styles.providerInfo}>
                <Ionicons name="business-outline" size={20} color="#555" />
                <Text style={styles.providerName}>{provider?.name || 'Provider details unavailable'}</Text>
            </View>

            {booking.status === 'CONFIRMED' && (
                <>
                    <View style={styles.etaContainer}>
                        <View style={styles.etaBox}>
                            <Text style={styles.etaLabel}>Provider Arrives In</Text>
                            <Text style={styles.etaValue}>~{travelEta} min</Text>
                        </View>
                        <View style={styles.etaBox}>
                            <Text style={styles.etaLabel}>Service Complete In</Text>
                            <Text style={styles.etaValue}>~{serviceEta} min</Text>
                        </View>
                    </View>
                    <View style={styles.otpContainer}>
                        <Text style={styles.otpLabel}>Share this OTP with provider on arrival:</Text>
                        <Text style={styles.otpCode}>{booking.otp}</Text>
                    </View>
                </>
            )}

            {booking.status === 'IN_PROGRESS' && (
                 <View style={styles.inProgressContainer}>
                    <ActivityIndicator color="#3498db" />
                    <Text style={styles.inProgressText}>Service is currently in progress...</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall} disabled={!provider?.contactPhone}>
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Call Provider</Text>
                </TouchableOpacity>

                {canCancel && (
                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => onCancel(booking.id)}>
                        <Ionicons name="close-circle-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Cancel ({formatTimeLeft(timeLeft)})</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default function OrdersScreen() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchActiveBookings = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(`${API_BASE_URL}/api/bookings/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Could not fetch active orders.");

            const data = await response.json();
            setBookings(data);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchActiveBookings();
        }, [fetchActiveBookings])
    );

    useEffect(() => {
        const socket = io(API_BASE_URL!, { reconnection: true, transports: ['websocket'] });
        const clerkId = getToken.toString();

        socket.on('connect', () => {
            console.log('[OrdersScreen] Socket connected');
            socket.emit('register_customer', clerkId);
        });

        socket.on('service_completed', (data:any) => {
            console.log('🎉 [OrdersScreen] Service completed event received:', data);
            Alert.alert("Service Completed", "Your service is complete. Thank you for using our app!");
            fetchActiveBookings();
        });

        socket.on('booking_cancelled_by_provider', (data:any) => {
            console.log('😢 [OrdersScreen] Booking cancelled by provider event received:', data);
            Alert.alert(
                "Booking Cancelled", 
                `Your booking was cancelled by the provider. Reason: ${data.reason || 'No reason provided.'}`
            );
            fetchActiveBookings();
        });

        return () => {
            console.log('[OrdersScreen] Socket disconnecting');
            socket.disconnect();
        };
    }, [fetchActiveBookings]);

    const handleCancelBooking = async (bookingId: string) => {
        Alert.alert(
            "Confirm Cancellation",
            "You can only cancel within the first 5 minutes. Are you sure?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel-by-user`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            });
                            if (!response.ok) {
                                const data = await response.json();
                                throw new Error(data.error || "Failed to cancel booking.");
                            }
                            Alert.alert("Success", "Your booking has been cancelled.");
                            fetchActiveBookings();
                        } catch (error: any) {
                            Alert.alert("Cancellation Failed", error.message);
                        }
                    }
                }
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchActiveBookings();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Active Orders</Text>
                <View style={styles.backButtonPlaceholder} />
            </View>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#b95528" />
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <OrderCard booking={item} onCancel={handleCancelBooking} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Ionicons name="file-tray-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>You have no active orders.</Text>
                            <Text style={styles.emptySubText}>Book a service to see it here.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    header: { 
        paddingHorizontal: 35, 
        paddingVertical: 29, // Increased padding
        borderBottomWidth: 1, 
        borderBottomColor: '#e0e0e0', 
        backgroundColor: '#fff',
        flexDirection: 'row', // Added for back button layout
        alignItems: 'center', // Added for back button layout
        justifyContent: 'space-between', // Added for back button layout
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', paddingTop:10 },
    backButton: {
        padding: 3,
        paddingTop: 15, // Add some padding to make it easier to tap
        marginTop:8
    },
    backButtonPlaceholder: {
        width: 34, // Same width as back button to center title
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    listContent: { padding: 15 },
    emptyText: { marginTop: 15, fontSize: 18, fontWeight: '600', color: '#888' },
    emptySubText: { marginTop: 5, fontSize: 14, color: '#aaa' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
        marginBottom: 10,
    },
    serviceName: { fontSize: 16, fontWeight: 'bold', color: '#34495e', flexShrink: 1 },
    status: { fontSize: 12, fontWeight: 'bold', color: '#fff', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, textTransform: 'uppercase', overflow: 'hidden' },
    status_CONFIRMED: { backgroundColor: '#3498db' },
    status_IN_PROGRESS: { backgroundColor: '#f1c40f' },
    providerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    providerName: { fontSize: 15, color: '#555', marginLeft: 10 },
    etaContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    etaBox: { alignItems: 'center', padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8, flex: 1, marginHorizontal: 5 },
    etaLabel: { fontSize: 12, color: '#7f8c8d', marginBottom: 4 },
    etaValue: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
    otpContainer: {
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#c8e6c9',
        marginBottom: 15,
    },
    otpLabel: { fontSize: 14, color: '#2e7d32', marginBottom: 8, fontWeight: '500' },
    otpCode: { fontSize: 28, fontWeight: 'bold', color: '#1b5e20', letterSpacing: 5 },
    inProgressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#eaf4fb', borderRadius: 8, marginVertical: 10 },
    inProgressText: { marginLeft: 10, fontSize: 15, fontWeight: '500', color: '#2980b9' },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    callButton: {
        backgroundColor: '#27ae60',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        marginLeft: 10,
    },
});