import { useTowTruckStore } from '@/store/towtruckStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { io } from 'socket.io-client';


// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// --- PUSH NOTIFICATIONS ---
async function registerForPushNotificationsAsync(providerId: string, type: 'garage' | 'towTruck', getToken: () => Promise<string | null>) {
    let token;
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        Alert.alert('Permission not granted', 'Failed to get push token for push notification!');
        return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    try {
        const authToken = await getToken();
        if (!authToken) return;
        await fetch(`${API_BASE_URL}/api/notifications/register-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ token, providerId, type }),
        });
    } catch (error) { console.error('Error sending push token:', error); }
    return token;
}

const InfoRow = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap, label: string, value?: string | number | null }) => (
    value ? (
        <View style={styles.infoRow}>
            <Ionicons name={icon} size={20} color="#888" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>{label}:</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    ) : null
);

const BookingCard = ({ booking, onAccept, onDecline, onCancel, onPress, onComplete, onChat, isAccepting, isDeclining, jobsSubTab }: { booking: any, onAccept: (id: string) => void, onDecline: (id: string) => void, onCancel: (id: string) => void, onPress: (booking: any) => void, onComplete: (id: string) => void, onChat: (bookingId: string) => void, isAccepting: boolean, isDeclining: boolean, jobsSubTab: 'Pending' | 'Current' | 'History' }) => {
    const getCoords = (loc: any) => {
        if (loc?.coordinates) return loc.coordinates;
        if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
            return [loc.longitude, loc.latitude];
        }
        return null;
    };

    const pickupCoords = getCoords(booking.pickupLocation);
    const destinationCoords = getCoords(booking.destinationLocation);

    return (
        <TouchableOpacity style={styles.bookingCard} onPress={() => onPress(booking)}>
            <View style={[styles.badge,
            booking.status === 'SEARCHING' ? styles.badgePending :
                booking.status === 'CONFIRMED' ? styles.badgeActive :
                    booking.status === 'IN_PROGRESS' ? styles.badgeActive : styles.badgeCompleted
            ]}>
                <Text style={styles.badgeText}>{booking.status.replace(/_/g, ' ')}</Text>
            </View>

            <View style={styles.bookingHeader}>
                <Text style={styles.bookingDate}>{new Date(booking.bookedAt).toLocaleDateString()} • {new Date(booking.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.bookingPrice}>AED {booking.finalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.serviceIconContainer}>
                    <Ionicons name="car-sport" size={24} color="#005C70" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{booking.user.firstName} {booking.user.lastName}</Text>
                    <Text style={styles.vehicleInfo}>{booking.vehicle.brand} {booking.vehicle.name} • {booking.vehicle.plateNumber}</Text>
                    <View style={{ marginTop: 4 }}>
                        <Text style={styles.bookingText} numberOfLines={1}><Text style={{ fontWeight: '600' }}>From:</Text> {booking.pickupLocation?.description || 'N/A'}</Text>
                        <Text style={styles.bookingText} numberOfLines={1}><Text style={{ fontWeight: '600' }}>To:</Text> {booking.destinationLocation?.description || booking.garage?.name || 'N/A'}</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>

            {(pickupCoords && destinationCoords) && (
                <TouchableOpacity
                    style={styles.checkMapButton}
                    onPress={() => {
                        const waypoints = `${pickupCoords[1]},${pickupCoords[0]}`;
                        const dest = `${destinationCoords[1]},${destinationCoords[0]}`;
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&waypoints=${waypoints}`;
                        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
                    }}
                >
                    <Ionicons name="map" size={16} color="#005C70" />
                    <Text style={styles.checkMapButtonText}>Open Route</Text>
                </TouchableOpacity>
            )}

            {/* Action Buttons Row */}
            {(booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && (
                <View style={styles.cardActionsRow}>
                    <TouchableOpacity style={[styles.cardActionButton, styles.chatButtonStyle]} onPress={() => onChat(booking.id)}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#005C70" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.cardActionButton, styles.completeButtonStyle]} onPress={() => onComplete(booking.id)}>
                        <Text style={styles.completeButtonText}>{booking.bookingType === 'TOW_TO_GARAGE' ? 'Confirm Delivery' : 'Complete Job'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.cardActionButton, styles.cancelButtonStyle]} onPress={() => onCancel(booking.id)}>
                        <Ionicons name="close-circle-outline" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                </View>
            )}

            {booking.status === 'SEARCHING' && (
                <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                        style={[styles.bookingButton, styles.declineButton]}
                        onPress={() => onDecline(booking.id)}
                        disabled={isDeclining || isAccepting}
                    >
                        {isDeclining ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.bookingButtonText}>Decline</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bookingButton, styles.acceptButton]}
                        onPress={() => onAccept(booking.id)}
                        disabled={isAccepting || isDeclining}
                    >
                        {isAccepting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.bookingButtonText}>Accept Job</Text>}
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

const OtpVerificationModal = ({ visible, onClose, otp, setOtp, onVerify, isVerifying }: any) => (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContent}>
                <Text style={modalStyles.modalTitle}>Complete Service</Text>
                <Text style={modalStyles.modalSubtitle}>Enter the 6-digit OTP from the customer to verify.</Text>
                <TextInput style={modalStyles.otpInput} keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} placeholder="• • • • • •" placeholderTextColor="#ccc" />
                <TouchableOpacity style={[styles.bookingButton, styles.acceptButton, isVerifying && styles.disabledButton]} onPress={onVerify} disabled={isVerifying}>
                    {isVerifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookingButtonText}>Verify & Complete</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 16 }} onPress={onClose}><Text style={{ textAlign: 'center', color: '#999' }}>Cancel</Text></TouchableOpacity>
            </View>
        </View>
    </Modal>
);

export default function TowTruckDashboard() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { towTruckId } = useLocalSearchParams<{ towTruckId: string }>();
    const { setDetails, setServices, reset: resetTowTruckStore } = useTowTruckStore();
    const [truck, setTruck] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [decliningId, setDecliningId] = useState<string | null>(null);
    const [mainTab, setMainTab] = useState<'Jobs' | 'Profile'>('Jobs');
    const [jobsSubTab, setJobsSubTab] = useState<'Pending' | 'Current' | 'History'>('Pending');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [bookingToComplete, setBookingToComplete] = useState<string | null>(null);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleChat = async (bookingId: string) => {
        try {
            const token = await getToken();
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/chat`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Failed to get chat.");
            const chat = await response.json();
            router.push(`/conversation/${chat.id}`);
        } catch (error: any) { Alert.alert("Chat Error", error.message); }
    };

    const handleAccept = async (bookingId: string) => {
        setAcceptingId(bookingId);
        try {
            const token = await getToken();
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/api/tow-truck/bookings/${bookingId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to accept booking.");
            await fetchData();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setAcceptingId(null);
        }
    };

    const handleDecline = async (bookingId: string) => {
        setDecliningId(bookingId);
        try {
            const token = await getToken();
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/api/tow-truck/bookings/${bookingId}/decline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to decline booking.");
            await fetchData();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setDecliningId(null);
        }
    };

    const handleCancel = async (bookingId: string) => {
        Alert.alert("Cancel Booking", "Are you sure?", [
            { text: "No", style: 'cancel' },
            {
                text: "Yes, Cancel", style: 'destructive', onPress: async () => {
                    try {
                        const token = await getToken();
                        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ reason: 'Provider cancelled' })
                        });
                        if (!response.ok) throw new Error("Failed to cancel.");
                        fetchData();
                    } catch (err: any) { Alert.alert("Error", err.message); }
                }
            }
        ])
    }

    const handleOpenOtpModal = (bookingId: string) => { setBookingToComplete(bookingId); setOtpModalVisible(true); setOtp(''); };

    const handleVerifyOtp = async () => {
        if (!bookingToComplete || otp.length !== 6) { Alert.alert("Invalid OTP", "Enter 6 digits."); return; }
        setIsVerifying(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingToComplete}/verify-otp-tow`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ otp }),
            });
            if (!response.ok) throw new Error('OTP verification failed.');
            Alert.alert('Service Complete!', 'Payment captured.');
            setOtpModalVisible(false); fetchData();
        } catch (error: any) { Alert.alert('Error', error.message); } finally { setIsVerifying(false); }
    };

    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!towTruckId) return;
        if (!isManualRefresh) setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed.");
            const allStatuses = ['SEARCHING', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
            const bookingStatusQuery = new URLSearchParams({ status: allStatuses.join(',') }).toString();
            const [truckRes, bookingsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/tow-truck/bookings?${bookingStatusQuery}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!truckRes.ok || !bookingsRes.ok) throw new Error("Failed to load data");
            setTruck(await truckRes.json());
            setBookings(await bookingsRes.json());
        } catch (error: any) { console.error("Fetch error", error); } finally {
            if (isManualRefresh) setRefreshing(false);
            setLoading(false);
        }
    }, [towTruckId, jobsSubTab]);

    useEffect(() => {
        if (!towTruckId) return;
        const socket = io(API_BASE_URL!, { reconnection: true, transports: ['websocket'] });
        socket.on('connect', () => socket.emit('register_provider', towTruckId));
        socket.on('booking_status_updated', () => fetchData());
        socket.on('new_booking_request', () => {
            Alert.alert("New Job!", "Check Pending tab.");
            fetchData();
        });
        return () => { socket.disconnect(); };
    }, [towTruckId, fetchData]);

    useEffect(() => {
        if (towTruckId) { registerForPushNotificationsAsync(towTruckId, 'towTruck', getToken); }
        fetchData();
    }, [fetchData, towTruckId]);
    const onRefresh = useCallback(() => { fetchData(true); }, [fetchData]);


    const handleEdit = () => {
        if (!truck) return;
        setDetails({ name: truck.name, driverName: truck.driverName, model: truck.model, make: truck.make, year: truck.year, plateNumber: truck.plateNumber, licenseNumber: truck.licenseNumber });
        setServices(truck.services);
        router.push({ pathname: '/settings/add-business/businesssetup/edit-tow-truck/edit-tow-truck-details', params: { towTruckId } });
    };

    const handleDelete = async () => {
        Alert.alert('Delete Tow Truck', 'Are you sure? This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await getToken();
                        await fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                        router.replace('/settings/add-business/businesssetup/businesspage');
                    } catch (error: any) { Alert.alert("Error", error.message); }
                }
            }
        ]);
    };

    const filteredBookings = bookings.filter(b => {
        const isTowToGarage = b.bookingType === 'TOW_TO_GARAGE';
        if (jobsSubTab === 'Pending') return b.status === 'SEARCHING';
        if (jobsSubTab === 'Current') {
            if (isTowToGarage && b.status === 'IN_PROGRESS') return false;
            return ['AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
        }
        if (jobsSubTab === 'History') {
            const isDeliveredTowToGarage = isTowToGarage && b.status === 'IN_PROGRESS';
            return ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(b.status) || isDeliveredTowToGarage;
        }
        return false;
    });

    if (loading && !truck) return <View style={styles.centered}><ActivityIndicator size="large" color="#005C70" /></View>;
    if (!truck) return <View style={styles.centered}><Text style={styles.errorText}>Could not load your tow truck data.</Text></View>;

    const BookingDetailsModal = ({ booking, onClose }: { booking: any, onClose: () => void }) => {
        if (!booking) return null;
        return (
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}><Ionicons name="close-circle" size={30} color="#e74c3c" /></TouchableOpacity>
                    <ScrollView>
                        <Text style={modalStyles.modalTitle}>Booking Details</Text>
                        <InfoRow icon="person-circle-outline" label="Customer" value={`${booking.user.firstName} ${booking.user.lastName}`} />
                        <InfoRow icon="call-outline" label="Phone" value={booking.user.phone} />
                        <InfoRow icon="car-outline" label="Vehicle" value={`${booking.vehicle.brand} ${booking.vehicle.name}`} />
                        <InfoRow icon="card-outline" label="Plate" value={booking.vehicle.plateNumber} />
                        <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
                        <Text style={{ fontWeight: '600', marginBottom: 4, color: '#005C70' }}>Locations:</Text>
                        <Text style={{ fontSize: 13, marginBottom: 8 }}>From: {booking.pickupLocation?.description}</Text>
                        <Text style={{ fontSize: 13, marginBottom: 8 }}>To: {booking.destinationLocation?.description || booking.garage?.name}</Text>
                        <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
                        <InfoRow icon="cash-outline" label="Total" value={`AED ${booking.finalAmount.toFixed(2)}`} />
                    </ScrollView>
                </View>
            </View>
        )
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005C70" />}>
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.headerTitle}>{truck.name}</Text>
                        <Text style={styles.headerSubtitle}>{truck.plateNumber}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/settings/add-business/businesssetup/towtruck-setup/tow-truck-live-tracking')}>
                        <LinearGradient colors={['#005C70', '#004252']} style={styles.liveButton}>
                            <Ionicons name="map" size={16} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.liveButtonText}>Track Live</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Custom Tab Bar */}
                <View style={styles.tabBar}>
                    {['Jobs', 'Profile'].map((tab) => (
                        <TouchableOpacity key={tab} onPress={() => setMainTab(tab as any)} style={[styles.tabItem, mainTab === tab && styles.tabItemActive]}>
                            <Text style={[styles.tabText, mainTab === tab && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {mainTab === 'Jobs' ? (
                    <View>
                        <View style={styles.subTabContainer}>
                            {['Pending', 'Current', 'History'].map((tab) => (
                                <TouchableOpacity key={tab} onPress={() => setJobsSubTab(tab as any)} style={[styles.subTabItem, jobsSubTab === tab && styles.subTabItemActive]}>
                                    <Text style={[styles.subTabText, jobsSubTab === tab && styles.subTabTextActive]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map(b => (
                                <BookingCard
                                    key={b.id}
                                    booking={b}
                                    onAccept={handleAccept}
                                    onDecline={handleDecline}
                                    onCancel={handleCancel}
                                    onComplete={handleOpenOtpModal}
                                    onChat={handleChat}
                                    onPress={(b) => { setSelectedBooking(b); setIsModalVisible(true); }}
                                    isAccepting={acceptingId === b.id}
                                    isDeclining={decliningId === b.id}
                                    jobsSubTab={jobsSubTab}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No bookings found.</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Profile Details</Text>
                            <InfoRow icon="person-outline" label="Driver" value={truck.driverName} />
                            <InfoRow icon="car-outline" label="Vehicle" value={`${truck.make} ${truck.model} (${truck.year})`} />
                            <InfoRow icon="card-outline" label="License" value={truck.licenseNumber} />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Services & Pricing</Text>
                            {truck.services.length > 0 ? (
                                truck.services.map((service: any) => (
                                    <View key={service.id} style={styles.serviceRow}>
                                        <View>
                                            <Text style={styles.serviceName}>{service.vehicleType.replace('_', ' ')}</Text>
                                            <Text style={styles.servicePrice}>AED {service.price.toFixed(2)} / km</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.activeLabel}>ACTIVE</Text>
                                            <Switch
                                                trackColor={{ false: "#ccc", true: "#005C70" }}
                                                thumbColor={"#fff"}
                                                value={true}
                                                style={{ transform: [{ scale: 0.7 }] }}
                                                onValueChange={handleEdit}
                                            />
                                        </View>
                                    </View>
                                ))
                            ) : <Text>No services.</Text>}
                        </View>
                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={[styles.actionButtonOutline]} onPress={handleEdit}>
                                <Text style={styles.actionButtonOutlineText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButtonOutline, styles.deleteButtonOutline]} onPress={handleDelete}>
                                <Text style={[styles.actionButtonOutlineText, { color: '#e74c3c' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
            {isModalVisible && <BookingDetailsModal booking={selectedBooking} onClose={() => setIsModalVisible(false)} />}
            <OtpVerificationModal visible={otpModalVisible} onClose={() => setOtpModalVisible(false)} otp={otp} setOtp={setOtp} onVerify={handleVerifyOtp} isVerifying={isVerifying} />
        </SafeAreaView>
    );
}

const modalStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: '90%', borderRadius: 24, padding: 24, elevation: 5, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#005C70', marginBottom: 15, textAlign: 'center' },
    modalSubtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20 },
    closeButton: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
    otpInput: { height: 60, borderRadius: 12, backgroundColor: '#f5f5f5', textAlign: 'center', fontSize: 24, letterSpacing: 8, marginBottom: 20, color: '#333' }
});

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContainer: { paddingBottom: 100 },
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', textAlign: 'center', margin: 20 },

    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#005C70' },
    headerSubtitle: { fontSize: 13, color: '#666', fontWeight: '500' },
    liveButton: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, alignItems: 'center' },
    liveButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    tabItem: { marginRight: 24, paddingVertical: 14 },
    tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#005C70' },
    tabText: { fontSize: 16, color: '#999', fontWeight: '600' },
    tabTextActive: { color: '#005C70' },

    subTabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12 },
    subTabItem: { marginRight: 12, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#eef2f5' },
    subTabItemActive: { backgroundColor: '#005C70' },
    subTabText: { fontSize: 13, color: '#666', fontWeight: '600' },
    subTabTextActive: { color: '#fff' },

    bookingCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 16, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    badge: { position: 'absolute', top: 16, right: 16, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#e0f2f1' },
    badgePending: { backgroundColor: '#fff3e0' },
    badgeActive: { backgroundColor: '#e8f5e9' },
    badgeCompleted: { backgroundColor: '#f5f5f5' },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#005C70', textTransform: 'uppercase' },

    bookingHeader: { marginBottom: 12 },
    bookingDate: { fontSize: 12, color: '#999', fontWeight: '500' },
    bookingPrice: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 4 },

    bookingDetails: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    serviceIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0f7fa', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    customerName: { fontSize: 15, fontWeight: '700', color: '#333' },
    vehicleInfo: { fontSize: 13, color: '#666' },
    bookingText: { fontSize: 13, color: '#555' },

    checkMapButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: '#f5faff', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e1f5fe' },
    checkMapButtonText: { color: '#005C70', fontWeight: '600', marginLeft: 6, fontSize: 13 },

    cardActionsRow: { flexDirection: 'row', gap: 10 },
    cardActionButton: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    chatButtonStyle: { flex: 0.25, backgroundColor: '#f0f9fa' },
    completeButtonStyle: { flex: 1, backgroundColor: '#005C70' },
    cancelButtonStyle: { flex: 0.25, backgroundColor: '#fff5f5' },

    completeButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    bookingActions: { flexDirection: 'row', gap: 12 },
    bookingButton: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    declineButton: { backgroundColor: '#fee2e2' },
    acceptButton: { backgroundColor: '#005C70' },
    bookingButtonText: { fontWeight: '700', color: '#fff' },
    disabledButton: { opacity: 0.6 },

    emptyState: { alignItems: 'center', padding: 40 },
    emptyStateText: { color: '#999' },

    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginHorizontal: 20, marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#005C70', marginBottom: 16 },
    infoRow: { flexDirection: 'row', marginBottom: 12 },
    infoIcon: { width: 24, marginRight: 12 },
    infoLabel: { width: 80, fontSize: 14, color: '#888' },
    infoValue: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },

    serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
    serviceName: { fontSize: 15, fontWeight: '600', color: '#333' },
    servicePrice: { fontSize: 13, color: '#666', marginTop: 2 },
    activeLabel: { fontSize: 10, fontWeight: '700', color: '#005C70', marginRight: 6 },

    actionsRow: { paddingHorizontal: 20, marginBottom: 40 },
    actionButtonOutline: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
    actionButtonOutlineText: { fontWeight: '600', color: '#555' },
    deleteButtonOutline: { borderColor: '#fee2e2', backgroundColor: '#fff5f5' }
});
