import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { io } from "socket.io-client";

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

const BookingCard = ({ booking, onAccept, onDecline, onPress }: { booking: any, onAccept: (id: string) => void, onDecline: (id: string) => void, onPress: (booking: any) => void }) => (
    <TouchableOpacity style={styles.bookingCard} onPress={() => onPress(booking)}>
        <View style={styles.bookingHeader}>
            <Text style={styles.bookingDate}>{new Date(booking.bookedAt).toLocaleDateString()}</Text>
            <Text style={styles.bookingPrice}>AED {booking.finalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="build" size={20} color="#3498db" />
            <Text style={styles.bookingText}>{booking.service.name}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="person-circle" size={20} color="#9b59b6" />
            <Text style={styles.bookingText}>{booking.user.firstName} {booking.user.lastName}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="car" size={20} color="#E67E22" />
            <Text style={styles.bookingText}>{booking.vehicle.brand} {booking.vehicle.name} ({booking.vehicle.plateNumber})</Text>
        </View>

        {booking.distance != null && (
             <View style={styles.bookingDetails}>
                <Ionicons name="map-outline" size={20} color="#16a085" />
                <Text style={styles.bookingText}>~{booking.distance.toFixed(1)} km away</Text>
            </View>
        )}

        {booking.status === 'SEARCHING' && (
            <View style={styles.bookingActions}>
                <TouchableOpacity style={[styles.bookingButton, styles.declineButton]} onPress={() => onDecline(booking.id)}>
                    <Text style={styles.bookingButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bookingButton, styles.acceptButton]} onPress={() => onAccept(booking.id)}>
                    <Text style={styles.bookingButtonText}>Accept</Text>
                </TouchableOpacity>
            </View>
        )}
    </TouchableOpacity>
);

// --- Main Dashboard Component ---

export default function GarageDashboard() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { garageId } = useLocalSearchParams<{ garageId: string }>();
    const { setDetails, setServices, setLocation, reset: resetGarageStore } = useGarageStore();

    const [garage, setGarage] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // State for the main tabs: Jobs or Profile
    const [mainTab, setMainTab] = useState<'Jobs' | 'Profile'>('Jobs');
    // State for the sub-tabs within Jobs
    const [jobsSubTab, setJobsSubTab] = useState<'Pending' | 'History'>('Pending');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

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
                    <InfoRow icon="build-outline" label="Service" value={booking.service.name} />
                    {booking.distance != null && <InfoRow icon="map-outline" label="Distance" value={`~${booking.distance.toFixed(1)} km`} />}
                    <InfoRow icon="cash-outline" label="Amount" value={`AED ${booking.finalAmount.toFixed(2)}`} />
                    <InfoRow icon="time-outline" label="Booked At" value={new Date(booking.bookedAt).toLocaleString()} />
                    <InfoRow icon="information-circle-outline" label="Status" value={booking.status} />
                </View>
            </View>
        );
    };

    // --- Data Fetching Logic ---
    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!garageId) return;
        console.log(`[GarageDashboard] Fetching data for garageId: ${garageId}`);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed.");

            const status = jobsSubTab === 'Pending' 
                ? 'SEARCHING,AWAITING_PAYMENT,CONFIRMED,IN_PROGRESS' 
                : 'COMPLETED,CANCELLED,EXPIRED';
            
            const [garageRes, bookingsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/garages/${garageId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/garage/bookings?status=${status}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!garageRes.ok) {
                const errorText = await garageRes.text();
                console.error("--- GARAGE DETAILS FETCH ERROR --- ", errorText);
                throw new Error(`Failed to load garage details: ${errorText}`);
            }
            if (!bookingsRes.ok) {
                const errorText = await bookingsRes.text();
                console.error("--- BOOKINGS FETCH ERROR --- ", errorText);
                throw new Error(`Failed to load bookings: ${errorText}`);
            }

            const garageData = await garageRes.json();
            const bookingsData = await bookingsRes.json();

            setGarage(garageData);
            setBookings(bookingsData);

        } catch (error: any) {
            console.error("--- FULL DATA FETCH ERROR OBJECT ---", error);
        } finally {
            if (isManualRefresh) {
                setRefreshing(false);
            }
            setLoading(false);
        }
    }, [garageId, jobsSubTab, getToken]);

    // --- Real-time WebSocket Logic ---
    useEffect(() => {
        if (!garageId) return;

        const socket = io(API_BASE_URL!, {
            reconnection: true,
            reconnectionAttempts: 5,
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log(`--- [Socket.IO] Connected with ID: ${socket.id} ---`);
            socket.emit('register_provider', garageId);
        });

        socket.on('new_booking', (newBooking: any) => {
            console.log('🎉 [Socket.IO] Received new booking:', newBooking);
            setBookings(prevBookings => {
                if (prevBookings.some(b => b.id === newBooking.id)) {
                    return prevBookings;
                }
                return [newBooking, ...prevBookings];
            });
        });

        socket.on('disconnect', (reason) => {
            console.log(`--- [Socket.IO] Disconnected: ${reason} ---`);
        });

        return () => {
            console.log("--- [Socket.IO] Disconnecting socket... ---");
            socket.disconnect();
        };
    }, [garageId]);

    useEffect(() => {
        fetchData(); // Fetch immediately on mount/tab change
    }, [fetchData]); 
        
    const onRefresh = useCallback(() => {
        fetchData(true); // Pass true to show refresh indicator
    }, [fetchData]);
    
    // --- Action Handlers ---
    const handleEdit = () => {
        if (!garage) return;
        setDetails({
            name: garage.name,
            licenseNumber: garage.licenseNumber,
            address: garage.address,
            ownerName: garage.ownerName,
            numberOfEmployees: garage.numberOfEmployees,
            contactEmail: garage.contactEmail,
            contactPhone: garage.contactPhone,
            operatingHours: garage.operatingHours,
            stripeAccountId: garage.stripeAccountId,
        });
        setServices(garage.services.map((s: any) => ({ serviceId: s.service.id, price: s.price })));
        if (garage.location?.coordinates) {
            setLocation({ latitude: garage.location.coordinates[1], longitude: garage.location.coordinates[0] });
        }
        router.push({
            pathname: '/settings/add-business/businesssetup/edit-garage/edit-details',
            params: { garageId },
        });
    };

    const handleDelete = () => {
        Alert.alert("Delete Garage", "Are you sure? This action is permanent.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: performDelete }
        ]);
    };

    const performDelete = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/garages/${garageId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to delete garage.");
            Alert.alert("Success", "Your garage profile has been deleted.");
            resetGarageStore();
            router.replace('/settings/main-settings');
        } catch (error: any) {
            Alert.alert("Deletion Error", error.message);
        }
    };

    const handleAccept = async (bookingId: string) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("--- ACCEPTANCE API ERROR ---", errorText);
                // Try to parse as JSON, but fall back to raw text if it fails
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || 'Failed to accept request');
                } catch (parseError) {
                    throw new Error(errorText || 'Failed to accept request');
                }
            }

            Alert.alert('Request accepted successfully!');
            fetchData(); // Refresh the whole dashboard
        } catch (error: any) {
            console.error("Acceptance Error:", error);
            Alert.alert(`Error: ${error.message}`);
        }
    };
    
    const handleDecline = async (bookingId: string) => {
        try {
            const token = await getToken();
             await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/decline`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(); // Refresh the whole dashboard
        } catch (error) {
            console.error("Decline Error:", error);
            Alert.alert("Failed to decline request.");
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (jobsSubTab === 'Pending') return ['SEARCHING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
        return ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(b.status);
    });
    
    if (loading && !garage) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#b95528" /></View>;
    }

    if (!garage) {
        return <View style={styles.centered}><Text style={styles.errorText}>Could not load your garage data.</Text></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: garage.name || 'Garage Dashboard' }} />
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b95528" />}>
                {/* Header Card - Always visible */}
                <View style={styles.headerCard}>
                    <Ionicons name="business" size={40} color="#b95528" />
                    <Text style={styles.truckName}>{garage.name}</Text>
                    <Text style={styles.truckPlate}>{garage.address}</Text>
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

                {/* Conditional Content Based on Main Tab */}
                {mainTab === 'Jobs' ? (
                    <View>
                        {/* Bookings Section */}
                        <Text style={styles.bookingsHeader}>Job Requests</Text>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity onPress={() => setJobsSubTab('Pending')} style={[styles.tab, jobsSubTab === 'Pending' && styles.activeTab]}>
                                <Text style={[styles.tabText, jobsSubTab === 'Pending' && styles.activeTabText]}>Pending</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setJobsSubTab('History')} style={[styles.tab, jobsSubTab === 'History' && styles.activeTab]}>
                                <Text style={[styles.tabText, jobsSubTab === 'History' && styles.activeTabText]}>History</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => <BookingCard 
                                key={booking.id} 
                                booking={booking} 
                                onAccept={handleAccept} 
                                onDecline={handleDecline} 
                                onPress={(b) => { setSelectedBooking(b); setIsModalVisible(true); }}
                            />)
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
                            <InfoRow icon="person-circle-outline" label="Owner" value={garage.ownerName} />
                            <InfoRow icon="id-card-outline" label="License No" value={garage.licenseNumber} />
                            <InfoRow icon="call-outline" label="Phone" value={garage.contactPhone} />
                            <InfoRow icon="mail-outline" label="Email" value={garage.contactEmail} />
                        </View>
                        
                        {/* Services Card */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardTitle}>Services & Pricing</Text>
                            {garage.services.length > 0 ? (
                                garage.services.map((serviceItem: any) => (
                                    <View key={serviceItem.id} style={styles.serviceRow}>
                                        <Text style={styles.serviceName}>{serviceItem.service.name}</Text>
                                        <Text style={styles.servicePrice}>AED {serviceItem.price.toFixed(2)}</Text>
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
            {isModalVisible && <BookingDetailsModal booking={selectedBooking} onClose={() => setIsModalVisible(false)} />}
        </SafeAreaView>
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
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#34495e' },
    closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, color: '#e74c3c', textAlign: 'center' },
    headerCard: {
        backgroundColor: '#fff', margin: 15, borderRadius: 16, padding: 20, alignItems: 'center',
        elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
    },
    truckName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
    truckPlate: { fontSize: 16, color: '#7f8c8d', marginTop: 2, marginBottom: 10, letterSpacing: 1, textAlign: 'center' },
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
    tabContainer: { flexDirection: 'row', backgroundColor: '#e9ecef', marginHorizontal: 15, borderRadius: 10, padding: 4, marginTop: 15, marginBottom: 10 },
    tab: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
    activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
    tabText: { fontSize: 16, fontWeight: '600', color: '#6c757d' },
    activeTabText: { color: '#b95528' },
    tabContent: { marginTop: 10, paddingHorizontal: 15 },
    noBookingsText: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 30, fontStyle: 'italic', paddingBottom: 30 },
    bookingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, marginHorizontal: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10, marginBottom: 10, },
    bookingDate: { fontSize: 14, color: '#7f8c8d' },
    bookingPrice: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    bookingDetails: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    bookingText: { fontSize: 15, color: '#34495e', marginLeft: 10 },
    bookingActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    bookingButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
    acceptButton: { backgroundColor: '#27ae60' },
    declineButton: { backgroundColor: '#c0392b' },
    bookingButtonText: { color: 'white', fontWeight: 'bold' },
    mainTabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 15,
        borderRadius: 10,
        padding: 5,
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
        backgroundColor: '#b95528',
    },
    mainTabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#b95528',
    },
    activeMainTabText: {
        color: '#fff',
    },
});
