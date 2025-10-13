import { useTowTruckStore } from '@/store/towtruckStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { io } from 'socket.io-client';

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// --- Reusable Components ---

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
    const showChatButton = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status);


    return (
    <TouchableOpacity style={styles.bookingCard} onPress={() => onPress(booking)}>
        <View style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(255, 255, 0, 0.7)', padding: 4, borderRadius: 4, zIndex: 10 }}>
            <Text style={{fontSize: 10, color: 'black', fontWeight: 'bold'}}>{booking.status} / {booking.subStatus || 'N/A'}</Text>
        </View>
        <View style={styles.bookingHeader}>
            <Text style={styles.bookingDate}>{new Date(booking.bookedAt).toLocaleDateString()}</Text>
            <Text style={styles.bookingPrice}>INR {booking.finalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="person-circle" size={20} color="#9b55b6" />
            <Text style={styles.bookingText}>{booking.user.firstName} {booking.user.lastName}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="car" size={20} color="#E67E22" />
            <Text style={styles.bookingText}>{booking.vehicle.brand} {booking.vehicle.name} ({booking.vehicle.plateNumber})</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="navigate-circle-outline" size={20} color="#3498db" />
            <Text style={styles.bookingText}>From: {booking.pickupLocation?.description || 'N/A'}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="flag-outline" size={20} color="#e74c3c" />
            <Text style={styles.bookingText}>To: {booking.destinationLocation?.description || booking.garage?.name || 'N/A'}</Text>
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
                <Ionicons name="map-outline" size={18} color="#fff" />
                <Text style={styles.checkMapButtonText}>Check Route</Text>
            </TouchableOpacity>
        )}
        {booking.totalDistance != null && (
             <View style={styles.bookingDetails}>
                <Ionicons name="map-outline" size={20} color="#16a085" />
                <Text style={styles.bookingText}>Total Distance: ~{booking.totalDistance.toFixed(1)} km</Text>
            </View>
        )}
        {booking.distance != null && (
             <View style={styles.bookingDetails}>
                <Ionicons name="location-outline" size={20} color="#16a085" />
                <Text style={styles.bookingText}>Pickup is ~{booking.distance.toFixed(1)} km away</Text>
            </View>
        )}
        {(booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && (
            <View style={styles.bookingActions}>
                <TouchableOpacity 
                    style={[styles.bookingButton, styles.cancelButton]} 
                    onPress={() => onCancel(booking.id)}
                >
                    <Text style={styles.bookingButtonText}>Cancel</Text>
                </TouchableOpacity>
                 <View style={styles.bookingActions}>
                <TouchableOpacity style={[styles.bookingButton, styles.chatButton]} onPress={() => onChat(booking.id)}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                    <Text style={styles.bookingButtonText}>Chat</Text>
                </TouchableOpacity>
            </View>
                <TouchableOpacity 
                    style={[styles.bookingButton, styles.completeButton]} 
                    onPress={() => onComplete(booking.id)}
                >
                    <Text style={styles.bookingButtonText}>
                        {booking.bookingType === 'TOW_TO_GARAGE' ? 'Confirm Delivery' : 'Complete Service'}
                    </Text>
                </TouchableOpacity>
            </View>
        )}
        {booking.status === 'SEARCHING' && (
            <View style={styles.bookingActions}>
                <TouchableOpacity 
                    style={[styles.bookingButton, styles.declineButton, (isDeclining || isAccepting) && styles.disabledButton]} 
                    onPress={() => onDecline(booking.id)}
                    disabled={isDeclining || isAccepting}
                >
                    {isDeclining ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.bookingButtonText}>Decline</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.bookingButton, styles.acceptButton, (isAccepting || isDeclining) && styles.disabledButton]} 
                    onPress={() => onAccept(booking.id)}
                    disabled={isAccepting || isDeclining}
                >
                    {isAccepting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.bookingButtonText}>Accept</Text>
                    )}
                </TouchableOpacity>
            </View>
        )}
    </TouchableOpacity>
    );
};


const OtpVerificationModal = ({ visible, onClose, otp, setOtp, onVerify, isVerifying }: { visible: boolean, onClose: () => void, otp: string, setOtp: (otp: string) => void, onVerify: () => void, isVerifying: boolean }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContent}>
                <Text style={modalStyles.modalTitle}>Complete Service</Text>
                <Text style={modalStyles.modalSubtitle}>Enter the 6-digit OTP from the customer to confirm service completion and capture payment.</Text>
                <TextInput
                    style={modalStyles.otpInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="123456"
                />
                <TouchableOpacity 
                    style={[styles.bookingButton, styles.acceptButton, isVerifying && styles.disabledButton]} 
                    onPress={onVerify} 
                    disabled={isVerifying}
                >
                    {isVerifying 
                        ? <ActivityIndicator color="#fff" /> 
                        : <Text style={styles.bookingButtonText}>Verify & Complete</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={{marginTop: 10}} onPress={onClose}>
                    <Text style={{textAlign: 'center', color: '#7f8c8d'}}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

// --- Main Dashboard Component ---

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
        console.log(`[handleChat] Initiated for bookingId: ${bookingId}`);
        try {
            console.log('[handleChat] Getting auth token...');
            const token = await getToken();
            if (!token) {
                console.error('[handleChat] Auth token is null or undefined.');
                Alert.alert("Chat Error", "Authentication token not found. Please sign in again.");
                return;
            }
            console.log('[handleChat] Token retrieved. Fetching chat room...');
    
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/chat`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
    
            console.log(`[handleChat] API response status: ${response.status}`);
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
                console.error('[handleChat] API response not OK:', errorData);
                throw new Error(errorData.error || "Failed to get or create chat.");
            }
    
            const chat = await response.json();
            console.log('[handleChat] Chat data received:', chat);
    
            if (!chat || !chat.id) {
                console.error('[handleChat] Invalid chat data received from API:', chat);
                throw new Error("Received invalid chat data from server.");
            }
    
            console.log(`[handleChat] Navigating to /chat/${chat.id}`);
            router.push(`/conversation/${chat.id}`);
            console.log('[handleChat] Navigation command issued.');
    
        } catch (error: any) {
            console.error('[handleChat] CATCH block error:', error);
            Alert.alert("Chat Error", error.message);
        }
    };



    const BookingDetailsModal = ({ booking, onClose }: { booking: any, onClose: () => void }) => {
        if (!booking) return null;
        return (
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close-circle" size={30} color="#e74c3c" />
                    </TouchableOpacity>
                    <Text style={modalStyles.modalTitle}>Booking Details</Text>
                    <InfoRow icon="person-circle-outline" label="Customer" value={`${booking.user.firstName} ${booking.user.lastName}`} />
                    <InfoRow icon="call-outline" label="Phone" value={booking.user.phone} />
                    <InfoRow icon="car-outline" label="Vehicle" value={`${booking.vehicle.brand} ${booking.vehicle.name} (${booking.vehicle.plateNumber})`} />
                    <InfoRow icon="navigate-circle-outline" label="Pickup" value={booking.pickupLocation?.description} />
                    <InfoRow icon="flag-outline" label="Destination" value={booking.destinationLocation?.description} />
                    {booking.distance != null && <InfoRow icon="map-outline" label="Distance to Pickup" value={`~${booking.distance.toFixed(1)} km`} />}
                    {booking.totalDistance != null && <InfoRow icon="swap-horizontal-outline" label="Towing Distance" value={`~${booking.totalDistance.toFixed(1)} km`} />}
                    <InfoRow icon="cash-outline" label="Amount" value={`AED ${booking.finalAmount.toFixed(2)}`} />
                    <InfoRow icon="time-outline" label="Booked At" value={new Date(booking.bookedAt).toLocaleString()} />
                    <InfoRow icon="information-circle-outline" label="Status" value={booking.status} />
                </View>
            </View>
        );
    };

    const handleOpenOtpModal = (bookingId: string) => {
        setBookingToComplete(bookingId);
        setOtpModalVisible(true);
        setOtp('');
    };

    const handleVerifyOtp = async () => {
        if (!bookingToComplete || otp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP.");
            return;
        }
        setIsVerifying(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingToComplete}/verify-otp-tow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'OTP verification failed.');
            
            Alert.alert('Service Complete!', 'The payment has been captured successfully.');
            setOtpModalVisible(false);
            fetchData(); // Refresh the dashboard
        } catch (error: any) {
            Alert.alert('Verification Error', error.message);
        } finally {
            setIsVerifying(false);
        }
    };

    // --- Data Fetching Logic ---
    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!towTruckId) return;
        console.log(`[TowTruckDashboard] Fetching data for towTruckId: ${towTruckId}`);
        
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed.");

            const allStatuses = ['SEARCHING', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
            const bookingStatusQuery = new URLSearchParams({ status: allStatuses.join(',') }).toString();
            const bookingsUrl = `${API_BASE_URL}/api/tow-truck/bookings?${bookingStatusQuery}`;

            const [truckRes, bookingsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(bookingsUrl, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!truckRes.ok) {
                const errorText = await truckRes.text();
                console.error("--- TRUCK DETAILS FETCH ERROR --- ", errorText);
                throw new Error(`Failed to load truck details: ${errorText}`);
            }
            if (!bookingsRes.ok) {
                const errorText = await bookingsRes.text();
                console.error("--- BOOKINGS FETCH ERROR --- ", errorText);
                throw new Error(`Failed to load bookings: ${errorText}`);
            }

            const truckData = await truckRes.json();
            const bookingsData = await bookingsRes.json();

            setTruck(truckData);
            setBookings(bookingsData);

        } catch (error: any) {
            console.error("--- FULL DATA FETCH ERROR OBJECT ---", error);
            Alert.alert("Data Error", error.message);
        } finally {
            if (isManualRefresh) {
                setRefreshing(false);
            }
            setLoading(false);
        }
    }, [towTruckId, jobsSubTab]);

    // --- Real-time WebSocket Logic ---
    useEffect(() => {
        if (!towTruckId) return;

        const socket = io(API_BASE_URL!, {
            reconnection: true,
            reconnectionAttempts: 5,
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log(`--- [Socket.IO] Connected with ID: ${socket.id} ---`);
            socket.emit('register_provider', towTruckId);
        });

        const handleNewBooking = (newBooking: any, type: string) => {
            console.log(`🎉 [Socket.IO] Received ${type}:`, newBooking);
            setBookings(prevBookings => {
                if (prevBookings.some(b => b.id === newBooking.id)) {
                    return prevBookings;
                }
                return [newBooking, ...prevBookings];
            });
        };

        socket.on('new_booking', (newBooking: any) => handleNewBooking(newBooking, 'new_booking'));
        socket.on('new_tow_request_for_garage', (newBooking: any) => handleNewBooking(newBooking, 'new_tow_request_for_garage'));

        socket.on('disconnect', (reason) => {
            console.log(`--- [Socket.IO] Disconnected: ${reason} ---`);
        });

        return () => {
            console.log("--- [Socket.IO] Disconnecting socket... ---");
            socket.disconnect();
        };
    }, [towTruckId]);

    useEffect(() => {
        fetchData(); // Fetch immediately on mount/tab change
    }, [fetchData]); 
        
    const onRefresh = useCallback(() => {
        fetchData(true); // Pass true to show refresh indicator
    }, [fetchData]);
    
    // --- Action Handlers ---
    const handleEdit = () => {
        if (!truck) return;
        setDetails({
            name: truck.name,
            driverName: truck.driverName,
            model: truck.model,
            make: truck.make,
            year: truck.year,
            plateNumber: truck.plateNumber,
            licenseNumber: truck.licenseNumber,
        });
        setServices(truck.services);
        
        router.push({
            pathname: '/settings/add-business/businesssetup/edit-tow-truck/edit-tow-truck-details',
            params: { towTruckId },
        });
    };

    const handleDelete = () => {
        Alert.alert("Delete Tow Truck", "Are you sure? This action is permanent.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: performDelete }
        ]);
    };

    const performDelete = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to delete tow truck.");
            Alert.alert("Success", "Your tow truck profile has been deleted.");
            resetTowTruckStore();
            router.replace('/settings/add-business/businesssetup/businesspage');
        } catch (error: any) {
            Alert.alert("Deletion Error", error.message);
        }
    };

    const handleAccept = async (bookingId: string) => {
        console.log(`[handleAccept] Attempting to accept booking: ${bookingId}`);
        setAcceptingId(bookingId);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/accept-tow`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("--- ACCEPTANCE API ERROR ---", errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || 'Failed to accept request');
                } catch (parseError) {
                    throw new Error(errorText || 'Failed to accept request');
                }
            }

            Alert.alert('Request accepted successfully!');
            fetchData();
        } catch (error: any) {
            console.error("Acceptance Error:", error);
            Alert.alert(`Error: ${error.message}`);
        } finally {
            setAcceptingId(null);
        }
    };
    
    const handleDecline = async (bookingId: string) => {
        setDecliningId(bookingId);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/decline-tow`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            fetchData(); // Refresh the whole dashboard
        } catch (error: any) {
            console.error("Decline Error:", error);
            Alert.alert("Failed to decline request.");
        } finally {
            setDecliningId(null);
        }
    };

   

    const handleCancel = (bookingId: string) => {
        Alert.alert(
            "Cancel Booking",
            "You have not completed the service. Are you sure you want to cancel?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                        const reason = "Service cancelled by tow truck provider."; // Default reason
                        try {
                            const token = await getToken();
                            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel-by-provider`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ reason }),
                            });
                            if (!response.ok) {
                                const data = await response.json();
                                throw new Error(data.error || "Failed to cancel booking.");
                            }
                            Alert.alert("Success", "The booking has been cancelled.");
                            fetchData();
                        } catch (error: any) {
                            Alert.alert("Cancellation Error", error.message);
                        }
                    },
                },
            ]
        );
    };

    const filteredBookings = bookings.filter(b => {
        const isTowToGarage = b.bookingType === 'TOW_TO_GARAGE';

        if (jobsSubTab === 'Pending') {
            return b.status === 'SEARCHING';
        }
        if (jobsSubTab === 'Current') {
            // A tow-to-garage job is no longer "current" for the trucker once the vehicle is delivered (which sets status to IN_PROGRESS)
            if (isTowToGarage && b.status === 'IN_PROGRESS') {
                return false;
            }
            return ['AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
        }
        if (jobsSubTab === 'History') {
            // A tow-to-garage job is "history" for the trucker once delivered (IN_PROGRESS), or if the whole booking is done.
            const isDeliveredTowToGarage = isTowToGarage && b.status === 'IN_PROGRESS';
            return ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(b.status) || isDeliveredTowToGarage;
        }
        return false;
    });
    
    if (loading && !truck) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#ed8b65" /></View>;
    }

    if (!truck) {
        return <View style={styles.centered}><Text style={styles.errorText}>Could not load your tow truck data.</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: truck.name || 'Truck Dashboard' }} />
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ed8b65" />}>
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <Ionicons name="car-sport" size={40} color="#ed8b65" />
                    <Text style={styles.truckName}>{truck.name}</Text>
                    <Text style={styles.truckPlate}>{truck.plateNumber}</Text>
                    <TouchableOpacity onPress={() => router.push('/settings/add-business/businesssetup/towtruck-setup/tow-truck-live-tracking')}>
                        <LinearGradient colors={['#F2994A', '#F2C94C']} style={styles.liveButton}>
                            <Ionicons name="map" size={20} color="#fff" />
                            <Text style={styles.liveButtonText}>Enter Live Driver Mode</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Main Tab Navigation */}
                <View style={styles.mainTabContainer}>
                    <TouchableOpacity onPress={() => setMainTab('Jobs')} style={[styles.mainTab, mainTab === 'Jobs' && styles.activeMainTab]}>
                        <Text style={[styles.mainTabText, mainTab === 'Jobs' && styles.activeMainTabText]}>Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMainTab('Profile')} style={[styles.mainTab, mainTab === 'Profile' && styles.activeMainTab]}>
                        <Text style={[styles.mainTabText, mainTab === 'Profile' && styles.activeMainTabText]}>Profile</Text>
                    </TouchableOpacity>
                </View>

                {mainTab === 'Jobs' ? (
                    <View>
                        {/* Bookings Section */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity onPress={() => setJobsSubTab('Pending')} style={[styles.tab, jobsSubTab === 'Pending' && styles.activeTab]}>
                                <Text style={[styles.tabText, jobsSubTab === 'Pending' && styles.activeTabText]}>Pending</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setJobsSubTab('Current')} style={[styles.tab, jobsSubTab === 'Current' && styles.activeTab]}>
                                <Text style={[styles.tabText, jobsSubTab === 'Current' && styles.activeTabText]}>Current</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setJobsSubTab('History')} style={[styles.tab, jobsSubTab === 'History' && styles.activeTab]}>
                                <Text style={[styles.tabText, jobsSubTab === 'History' && styles.activeTabText]}>History</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <BookingCard 
                                    key={booking.id} 
                                    booking={booking} 
                                    onAccept={handleAccept} 
                                    onDecline={handleDecline} 
                                    onCancel={handleCancel}
                                    onComplete={handleOpenOtpModal}
                                    onChat={handleChat}
                                    onPress={(b) => { setSelectedBooking(b); setIsModalVisible(true); }}
                                    isAccepting={acceptingId === booking.id}
                                    isDeclining={decliningId === booking.id}
                                    jobsSubTab={jobsSubTab}
                                />
                            ))
                        ) : (
                            <View style={styles.tabContent}>
                                <Text style={styles.noBookingsText}>No {jobsSubTab.toLowerCase()} bookings found.</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View>
                        {/* Details Card */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardTitle}>Details</Text>
                            <InfoRow icon="person-circle-outline" label="Driver" value={truck.driverName} />
                            <InfoRow icon="car-outline" label="Make & Model" value={`${truck.make} ${truck.model}`} />
                            <InfoRow icon="calendar-outline" label="Year" value={truck.year} />
                            <InfoRow icon="id-card-outline" label="License No" value={truck.licenseNumber} />
                        </View>
                        
                        {/* Services Card */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardTitle}>Services & Pricing</Text>
                            {truck.services.length > 0 ? (
                                truck.services.map((service: any) => (
                                    <View key={service.id} style={styles.serviceRow}>
                                        <Text style={styles.serviceName}>{service.vehicleType.replace('_', ' ')}</Text>
                                        <Text style={styles.servicePrice}>AED {service.price.toFixed(2)}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noServicesText}>No services configured.</Text>
                            )}
                        </View>

                        {/* Management Actions */}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
                                <Ionicons name="pencil" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                                <Ionicons name="trash" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
            {isModalVisible && (
                <BookingDetailsModal 
                booking={selectedBooking} 
                onClose={() => setIsModalVisible(false)} />
            )}
            <OtpVerificationModal 
                visible={otpModalVisible}
                onClose={() => setOtpModalVisible(false)}
                otp={otp}
                setOtp={setOtp}
                onVerify={handleVerifyOtp}
                isVerifying={isVerifying}
            />
        </View>
    );
}

const modalStyles = StyleSheet.create({
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        width: '90%',
        maxHeight: '80%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#34495e' },
    modalSubtitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 25, textAlign: 'center', paddingHorizontal: 10 },
    closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
    otpInput: {
        height: 50,
        width: '100%',
        borderColor: '#3498db',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 24,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 15,
        backgroundColor: '#f8f9fa',
        letterSpacing: 8,
        alignSelf: 'center',
    },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8', paddingTop: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, color: '#e74c3c', textAlign: 'center' },
    headerCard: {
        backgroundColor: '#fff', margin: 15, borderRadius: 16, padding: 20, alignItems: 'center',
        elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
    },
    truckName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
    truckPlate: { fontSize: 16, color: '#7f8c8d', marginTop: 2, marginBottom: 20, letterSpacing: 1 },
    liveButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, elevation: 3 },
    liveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    detailsCard: { backgroundColor: '#fff', padding: 20, marginHorizontal: 15, marginBottom: 15, borderRadius: 12, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#34495e', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    infoIcon: { width: 30, textAlign: 'center' },
    infoLabel: { fontSize: 16, color: '#7f8c8d' },
    infoValue: { fontSize: 16, color: '#2c3e50', flex: 1, textAlign: 'right', fontWeight: '500' },
    serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f7f7f7' },
    serviceName: { fontSize: 16, color: '#34495e', textTransform: 'capitalize' },
    servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    noServicesText: { fontSize: 16, color: '#95a5a6', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-around', margin: 15, marginTop: 25, marginBottom: 40 },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
    editButton: { backgroundColor: '#3498db' },
    deleteButton: { backgroundColor: '#e74c3c' },
    actionButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    bookingsHeader: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 15, marginTop: 20, textAlign: 'center', color: '#34495e' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#e9ecef', marginHorizontal: 15, borderRadius: 10, padding: 2, marginTop: 15, marginBottom: 10 },
    tab: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
    activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
    tabText: { fontSize: 16, fontWeight: '600', color: '#6c757d' },
    activeTabText: { color: '#ed8b65' },
    tabContent: { marginTop: 10, paddingHorizontal: 15 },
    noBookingsText: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 30, fontStyle: 'italic', paddingBottom: 30 },
    bookingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, marginHorizontal: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10, marginBottom: 10, },
    bookingDate: { fontSize: 14, color: '#7f8c8d' },
    bookingPrice: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    bookingDetails: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    bookingText: { fontSize: 15, color: '#34495e', marginLeft: 10 },
    bookingActions: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        marginTop: 10, 
        paddingTop: 12, 
        borderTopWidth: 1, 
        borderTopColor: '#f0f0f0' 
    },
    bookingButton: { 
        paddingVertical: 8, 
        paddingHorizontal: 16, 
        borderRadius: 8, 
        marginLeft: 8,
        minHeight: 42,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: { backgroundColor: '#27ae60' },
    declineButton: { backgroundColor: '#c0392b' },
    cancelButton: { backgroundColor: '#f39c12' },
    completeButton: { backgroundColor: '#2980b9' },
    bookingButtonText: { 
        color: 'white', 
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
        width: '100%',
    },
    disabledButton: { backgroundColor: '#95a5a6' },
    mainTabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 15,
        borderRadius: 10,
        padding: 3,
        marginTop: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    mainTab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeMainTab: {
        backgroundColor: '#ed8b65',
    },
    mainTabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8b65',
    },
    activeMainTabText: {
        color: '#fff',
    },
    checkMapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3498db',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    checkMapButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 14,
    },
    chatButton: {
        backgroundColor: '#3498db',
        flex: 1,
        marginRight: 10,
    },
});
