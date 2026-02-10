import BusinessBookingModal from '@/components/BusinessBookingModal';
import { OtpVerificationModal } from '@/components/GarageModals';
import TowTruckBookingCard from '@/components/TowTruckBookingCard';
import { useTowTruckStore } from '@/store/towtruckStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import io from 'socket.io-client';

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
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

export default function TowTruckDashboard() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { towTruckId } = useLocalSearchParams<{ towTruckId: string }>();
    const { setDetails, setServices } = useTowTruckStore();

    const [truck, setTruck] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [decliningId, setDecliningId] = useState<string | null>(null);
    const [mainTab, setMainTab] = useState<'Jobs' | 'Profile' | 'Analytics'>('Jobs');
    const [analyticsData, setAnalyticsData] = useState<any>(null); // State for analytics
    const [jobsSubTab, setJobsSubTab] = useState<'Pending' | 'Current' | 'History'>('Pending');

    // Modals
    const [isBusinessModalVisible, setIsBusinessModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [bookingToComplete, setBookingToComplete] = useState<string | null>(null);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const getTokenRef = useRef(getToken);

    // Live Location State
    const [isOnline, setIsOnline] = useState(true);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);
    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    const stopLocationTracking = useCallback(async (showAlert = true) => {
        setIsOnline(false);
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
        try {
            const token = await getTokenRef.current();
            if (token) {
                await fetch(`${API_BASE_URL}/api/tow-trucks/location`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        latitude: 0,
                        longitude: 0,
                        isAvailable: false
                    })
                });
            }
        } catch (err) {
            console.error("Failed to set offline status", err);
        }

        if (showAlert) {
            Alert.alert("You are Offline", "You will no longer receive new requests.");
        }
    }, []);

    const startLocationTracking = useCallback(async (showAlert = true) => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setIsOnline(false);
            Alert.alert('Permission Denied', 'Allow location access to go online.');
            return;
        }

        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        setIsOnline(true);
        try {
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                async (location) => {
                    const { latitude, longitude } = location.coords;
                    try {
                        const token = await getTokenRef.current();
                        if (token) {
                            await fetch(`${API_BASE_URL}/api/tow-trucks/location`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    latitude,
                                    longitude,
                                    isAvailable: true
                                })
                            });
                        }
                    } catch (err) {
                        console.error("Failed to update location", err);
                    }
                }
            );
            if (showAlert) {
                Alert.alert("You are Online", "Your location is now being shared with customers.");
            }
        } catch (err) {
            console.error("Error starting location watch", err);
            setIsOnline(false);
            Alert.alert("Error", "Could not start location tracking.");
        }
    }, []);

    const toggleOnlineStatus = async (value: boolean) => {
        if (value) {
            await startLocationTracking(true);
            return;
        }
        await stopLocationTracking(true);
    };

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
            setIsBusinessModalVisible(false);
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
            setIsBusinessModalVisible(false);
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
                        setIsBusinessModalVisible(false);
                    } catch (err: any) { Alert.alert("Error", err.message); }
                }
            }
        ])
    }

    const [isRequestingOtp, setIsRequestingOtp] = useState(false);

    const handleOpenOtpModal = async (bookingId: string) => {
        setIsRequestingOtp(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/request-completion-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to request OTP.');

            setBookingToComplete(bookingId);
            setOtpModalVisible(true);
            setOtp('');
        } catch (error: any) {
            Alert.alert('OTP Error', error.message || 'Could not request OTP.');
        } finally {
            setIsRequestingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!bookingToComplete || otp.length !== 6) { Alert.alert("Invalid OTP", "Enter 6 digits."); return; }
        setIsVerifying(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingToComplete}/verify-otp-tow`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'OTP verification failed.');
            Alert.alert('Service Complete!', 'Payment captured.');
            setOtpModalVisible(false); fetchData();
        } catch (error: any) { Alert.alert('Error', error.message); } finally { setIsVerifying(false); }
    };

    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!towTruckId) return;
        if (!isManualRefresh) setLoading(true);
        try {
            const token = await getTokenRef.current();
            if (!token) throw new Error("Authentication failed.");

            if (mainTab === 'Analytics') {
                const statsRes = await fetch(`${API_BASE_URL}/api/analytics/stats?providerId=${towTruckId}&type=towTruck`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    setAnalyticsData(stats);
                }
                const truckRes = await fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (truckRes.ok) setTruck(await truckRes.json());
            } else {
                const allStatuses = ['SEARCHING', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
                const bookingStatusQuery = new URLSearchParams({ status: allStatuses.join(',') }).toString();
                const [truckRes, bookingsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/tow-truck/bookings?${bookingStatusQuery}`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                if (!truckRes.ok || !bookingsRes.ok) {
                    throw new Error("Failed to load data.");
                }
                setTruck(await truckRes.json());
                setBookings(await bookingsRes.json());
            }
        } catch (error: any) { console.error("Fetch error", error); } finally {
            if (isManualRefresh) setRefreshing(false);
            setLoading(false);
        }
    }, [towTruckId, mainTab]);

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
        if (towTruckId) { registerForPushNotificationsAsync(towTruckId, 'towTruck', () => getTokenRef.current()); }
        fetchData();
    }, [fetchData, towTruckId]);

    useEffect(() => {
        let isMounted = true;
        if (!towTruckId) return;

        const syncOnlineStatus = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const nextOnlineStatus = response.ok
                    ? (await response.json()).isAvailable ?? true
                    : true;

                if (!isMounted) return;

                setIsOnline(nextOnlineStatus);
                if (nextOnlineStatus) {
                    await startLocationTracking(false);
                } else if (locationSubscription.current) {
                    locationSubscription.current.remove();
                    locationSubscription.current = null;
                }
            } catch {
                if (!isMounted) return;
                setIsOnline(true);
                await startLocationTracking(false);
            }
        };

        syncOnlineStatus();
        return () => { isMounted = false; };
    }, [towTruckId, getToken, startLocationTracking]);
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

    const renderModalActions = () => {
        if (!selectedBooking) return null;
        const b = selectedBooking;
        const isHistory = jobsSubTab === 'History';

        return (
            <View style={{ gap: 10 }}>
                {!isHistory && (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') && (
                    <TouchableOpacity style={[styles.mainActionButton, styles.chatButtonStyle]} onPress={() => { setIsBusinessModalVisible(false); handleChat(b.id); }}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#005C70" style={{ marginRight: 8 }} />
                        <Text style={[styles.mainActionButtonText, { color: '#005C70' }]}>Chat with Customer</Text>
                    </TouchableOpacity>
                )}

                {jobsSubTab === 'Pending' && !isHistory && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={[styles.mainActionButton, styles.declineButtonNew, { flex: 1 }]} onPress={() => handleDecline(b.id)} disabled={acceptingId === b.id || decliningId === b.id}>
                            {decliningId === b.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainActionButtonText}>Decline</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.mainActionButton, styles.acceptButtonNew, { flex: 1 }]} onPress={() => handleAccept(b.id)} disabled={acceptingId === b.id || decliningId === b.id}>
                            {acceptingId === b.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainActionButtonText}>Accept Job</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {!isHistory && (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') && (
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.mainActionButton, styles.completeButtonStyle]}
                            onPress={() => { setIsBusinessModalVisible(false); handleOpenOtpModal(b.id); }}
                            disabled={isRequestingOtp}
                        >
                            {isRequestingOtp ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.mainActionButtonText}>{b.bookingType === 'TOW_TO_GARAGE' ? 'Confirm Delivery' : 'Complete Job'}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.mainActionButton, styles.cancelButtonStyle]} onPress={() => handleCancel(b.id)}>
                            <Text style={[styles.mainActionButtonText, { color: '#e74c3c' }]}>Cancel Booking</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    if (loading && !truck) return <View style={styles.centered}><ActivityIndicator size="large" color="#005C70" /></View>;
    if (!truck) return <View style={styles.centered}><Text style={styles.errorText}>Could not load your tow truck data.</Text></View>;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005C70" />}>
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.headerTitle}>{truck.name}</Text>
                        <Text style={styles.headerSubtitle}>{truck.plateNumber}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginRight: 8, color: isOnline ? '#27ae60' : '#7f8c8d', fontWeight: 'bold' }}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#27ae60" }}
                            thumbColor={isOnline ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleOnlineStatus}
                            value={isOnline}
                        />
                    </View>
                </View>

                {/* Custom Tab Bar */}
                <View style={styles.tabBar}>
                    {['Jobs', 'Profile', 'Analytics'].map((tab) => (
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
                                <TowTruckBookingCard
                                    key={b.id}
                                    booking={b}
                                    onPress={(b) => { setSelectedBooking(b); setIsBusinessModalVisible(true); }}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No bookings found.</Text>
                            </View>
                        )}
                    </View>
                ) : mainTab === 'Analytics' ? (
                    <View style={{ marginTop: 20 }}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Business Analytics</Text>
                            {analyticsData ? (
                                <View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#e0f7fa', padding: 10, borderRadius: 10 }}>
                                            <Ionicons name="cash-outline" size={24} color="#006064" />
                                            <Text style={{ fontSize: 12, color: '#006064', marginTop: 5 }}>Total Revenue</Text>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#006064' }}>₹{analyticsData.totalRevenue.toLocaleString()}</Text>
                                        </View>
                                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#fff3e0', padding: 10, borderRadius: 10 }}>
                                            <Ionicons name="calendar-outline" size={24} color="#e65100" />
                                            <Text style={{ fontSize: 12, color: '#e65100', marginTop: 5 }}>Total Bookings</Text>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#e65100' }}>{analyticsData.totalBookings}</Text>
                                        </View>
                                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#f3e5f5', padding: 10, borderRadius: 10 }}>
                                            <Ionicons name="trending-up-outline" size={24} color="#4a148c" />
                                            <Text style={{ fontSize: 12, color: '#4a148c', marginTop: 5 }}>Avg. Order Value</Text>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4a148c' }}>₹{analyticsData.averageRevenue.toFixed(0)}</Text>
                                        </View>
                                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#e8f5e9', padding: 10, borderRadius: 10 }}>
                                            <Ionicons name="checkbox-outline" size={24} color="#1b5e20" />
                                            <Text style={{ fontSize: 12, color: '#1b5e20', marginTop: 5 }}>Completed Jobs</Text>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1b5e20' }}>{analyticsData.completedBookings}</Text>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                            <Ionicons name="trophy" size={20} color="#fbc02d" />
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#333' }}>Top Customer</Text>
                                        </View>
                                        {analyticsData.topCustomer.name !== 'N/A' ? (
                                            <View>
                                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#005C70' }}>{analyticsData.topCustomer.name}</Text>
                                                <Text style={{ color: '#666', fontSize: 14 }}>
                                                    {analyticsData.topCustomer.bookings} Bookings
                                                </Text>
                                            </View>
                                        ) : (
                                            <Text style={{ color: '#999', fontStyle: 'italic' }}>No data yet.</Text>
                                        )}
                                    </View>
                                </View>
                            ) : (
                                <ActivityIndicator size="large" color="#005C70" />
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={{ marginTop: 20 }}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Profile Details</Text>
                            <InfoRow icon="person-outline" label="Driver" value={truck.driverName} />
                            <InfoRow icon="car-outline" label="Vehicle" value={`${truck.make} ${truck.model} (${truck.year})`} />
                            <InfoRow icon="card-outline" label="License" value={truck.licenseNumber} />
                            <View style={styles.detailsDivider} />
                            <Text style={styles.sectionSubtitle}>Payment Details</Text>
                            <InfoRow icon="card-outline" label="Partner" value="Razorpay" />
                            <InfoRow
                                icon={truck.razorpayAccountId ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                                label="Status"
                                value={truck.razorpayAccountId ? 'Connected' : 'Not connected'}
                            />
                            <InfoRow icon="wallet-outline" label="Payout ID" value={truck.razorpayAccountId || '-'} />
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

            <BusinessBookingModal
                visible={isBusinessModalVisible}
                onClose={() => setIsBusinessModalVisible(false)}
                booking={selectedBooking}
            >
                {renderModalActions()}
            </BusinessBookingModal>

            <OtpVerificationModal
                visible={otpModalVisible}
                onClose={() => setOtpModalVisible(false)}
                otp={otp}
                setOtp={setOtp}
                onVerify={handleVerifyOtp}
                isVerifying={isVerifying}
            />
        </SafeAreaView>
    );
}

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

    subTabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16 },
    subTabItem: { marginRight: 12, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#eef2f5' },
    subTabItemActive: { backgroundColor: '#005C70' },
    subTabText: { fontSize: 13, color: '#666', fontWeight: '600' },
    subTabTextActive: { color: '#fff' },

    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyStateText: { fontSize: 16, color: '#999', fontStyle: 'italic' },

    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 20, marginBottom: 16, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#005C70', marginBottom: 12 },
    sectionSubtitle: { fontSize: 14, fontWeight: '700', color: '#005C70', marginTop: 4, marginBottom: 8 },
    detailsDivider: { height: 1, backgroundColor: '#eef2f5', marginTop: 2, marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    infoIcon: { width: 24, textAlign: 'center', marginRight: 10 },
    infoLabel: { fontSize: 14, color: '#666', width: 70 },
    infoValue: { fontSize: 14, color: '#333', fontWeight: '600', flex: 1 },

    serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    serviceName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    servicePrice: { fontSize: 14, color: '#005C70', fontWeight: '700' },
    activeLabel: { fontSize: 10, color: '#005C70', fontWeight: '700', marginRight: 6 },

    actionsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 10, marginBottom: 40 },
    actionButtonOutline: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#005C70', alignItems: 'center' },
    actionButtonOutlineText: { color: '#005C70', fontWeight: '700' },
    deleteButtonOutline: { borderColor: '#e74c3c' },

    mainActionButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14,
        shadowColor: '#000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee'
    },
    mainActionButtonText: { fontWeight: '700', fontSize: 15, color: '#fff' },
    acceptButtonNew: { backgroundColor: '#005C70', borderColor: '#005C70' },
    declineButtonNew: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
    completeButtonStyle: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
    chatButtonStyle: { backgroundColor: '#fff', borderColor: '#005C70' },
    cancelButtonStyle: { backgroundColor: '#fff', borderColor: '#e74c3c' }
});
