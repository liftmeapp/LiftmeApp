import BusinessBookingModal from '@/components/BusinessBookingModal';
import EmptyState from '@/components/EmptyState';
import GarageBookingCard from '@/components/GarageBookingCard';
import { FinalQuoteModal, OtpVerificationModal, QuoteModal } from '@/components/GarageModals';
import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import io from "socket.io-client";

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// --- NOTIFICATION HANDLER ---
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

// --- Reusable Components ---

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
    console.log('Expo Push Token:', token);

    // Send the token to your backend
    try {
        const authToken = await getToken();
        if (!authToken) {
            console.error('Auth token not available for sending push token to backend.');
            return;
        }
        const response = await fetch(`${API_BASE_URL}/api/notifications/register-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ token, providerId, type }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to send push token to backend:', errorData);
        } else {
            console.log('Push token sent to backend successfully.');
        }
    } catch (error) {
        console.error('Error sending push token to backend:', error);
    }

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

// --- Main Dashboard Component ---

export default function GarageDashboard() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { garageId } = useLocalSearchParams<{ garageId: string }>();
    const { setDetails, setServices, setLocation, setSupportedVehicleTypes, reset: resetGarageStore } = useGarageStore();

    const [garage, setGarage] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    // Action Loading States
    const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

    // State for the main tabs: Jobs or Profile
    const [mainTab, setMainTab] = useState<'Jobs' | 'Profile' | 'Analytics'>('Jobs');
    const [analyticsData, setAnalyticsData] = useState<any>(null); // State for analytics
    // State for the sub-tabs within Jobs
    const [jobsSubTab, setJobsSubTab] = useState<'Pending' | 'Current' | 'History'>('Pending');

    // Modals
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isBusinessModalVisible, setIsBusinessModalVisible] = useState(false);

    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [bookingToComplete, setBookingToComplete] = useState<string | null>(null);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // New state for the quote modal
    const [quoteModalVisible, setQuoteModalVisible] = useState(false);
    const [bookingToQuote, setBookingToQuote] = useState<any>(null);
    const [quoteVehicleStatus, setQuoteVehicleStatus] = useState('');
    const [quoteServicesRequired, setQuoteServicesRequired] = useState('');
    const [quoteServicesEstimate, setQuoteServicesEstimate] = useState('');
    const [quoteJobEstimate, setQuoteJobEstimate] = useState('');
    const [quoteNotes, setQuoteNotes] = useState(''); // General notes
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

    // State for the final quote modal
    const [finalQuoteModalVisible, setFinalQuoteModalVisible] = useState(false);
    const [bookingToFinalQuote, setBookingToFinalQuote] = useState<any>(null);
    const [finalQuoteJobEstimate, setFinalQuoteJobEstimate] = useState('');
    const [finalQuoteNotes, setFinalQuoteNotes] = useState('');
    const [isSubmittingFinalQuote, setIsSubmittingFinalQuote] = useState(false);


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

        } catch (error: any) {
            console.error('[handleChat] CATCH block error:', error);
            Alert.alert("Chat Error", error.message);
        }
    };

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
        if (!bookingToComplete || otp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP.");
            return;
        }
        setIsVerifying(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingToComplete}/verify-otp`, {
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

    const handleOpenQuoteModal = (booking: any) => {
        setBookingToQuote(booking);
        // Initialize new quote fields
        setQuoteVehicleStatus(booking.vehicleStatus || '');
        setQuoteServicesRequired(booking.servicesRequired || '');
        setQuoteServicesEstimate(booking.servicesEstimate || '');
        setQuoteJobEstimate(booking.jobEstimate ? booking.jobEstimate.toString() : '');
        setQuoteNotes(booking.notes || '');
        setQuoteModalVisible(true);
    };

    const handleSubmitQuote = async () => {
        if (!bookingToQuote || !quoteJobEstimate || !quoteServicesRequired) {
            Alert.alert("Invalid Input", "Please provide Job Estimate and Services Required.");
            return;
        }
        setIsSubmittingQuote(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingToQuote.id}/submit-quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    vehicleStatus: quoteVehicleStatus,
                    servicesRequired: quoteServicesRequired,
                    servicesEstimate: quoteServicesEstimate,
                    jobEstimate: parseFloat(quoteJobEstimate),
                    notes: quoteNotes,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to submit Estimate.');

            Alert.alert('Quote Submitted!', 'The customer has been notified and is awaiting to approve the payment.');
            setQuoteModalVisible(false);
            fetchData(); // Refresh dashboard
        } catch (error: any) {
            Alert.alert('Submission Error', error.message);
        } finally {
            setIsSubmittingQuote(false);
        }
    };

    const handleOpenFinalQuoteModal = (booking: any) => {
        setBookingToFinalQuote(booking);
        setFinalQuoteJobEstimate('');
        setFinalQuoteNotes('');
        setFinalQuoteModalVisible(true);
    };

    const handleSubmitFinalQuote = async () => {
        if (!bookingToFinalQuote || !finalQuoteJobEstimate) {
            Alert.alert("Invalid Input", "Please provide a Final Job Estimate.");
            return;
        }
        setIsSubmittingFinalQuote(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingToFinalQuote.id}/submit-final-quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    jobEstimate: parseFloat(finalQuoteJobEstimate),
                    notes: finalQuoteNotes,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to submit final quote.');

            Alert.alert('Final Quote Submitted!', 'The customer has been notified to approve the final payment.');
            setFinalQuoteModalVisible(false);
            fetchData(); // Refresh dashboard
        } catch (error: any) {
            Alert.alert('Submission Error', error.message);
        } finally {
            setIsSubmittingFinalQuote(false);
        }
    };

    // --- Data Fetching Logic ---
    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!garageId) return;
        console.log(`[GarageDashboard] Fetching data for garageId: ${garageId}`);
        if (!isManualRefresh) {
            setLoading(true);
        }
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed.");

            if (mainTab === 'Analytics') {
                const statsRes = await fetch(`${API_BASE_URL}/api/analytics/stats?providerId=${garageId}&type=garage`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    setAnalyticsData(stats);
                }
            } else {
                const allStatuses = ['SEARCHING', 'CONFIRMED', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
                const bookingStatusQuery = new URLSearchParams({ status: allStatuses.join(',') }).toString();
                const bookingsUrl = `${API_BASE_URL}/api/garage/bookings?${bookingStatusQuery}`;

                const [garageRes, bookingsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/garages/${garageId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(bookingsUrl, { headers: { 'Authorization': `Bearer ${token}` } })
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
            }

        } catch (error: any) {
            console.error("--- FULL DATA FETCH ERROR OBJECT ---", error);
        } finally {
            if (isManualRefresh) {
                setRefreshing(false);
            }
            setLoading(false);
        }
    }, [garageId, jobsSubTab, mainTab]);

    const fetchDataRef = useRef(fetchData);
    useEffect(() => {
        fetchDataRef.current = fetchData;
    }, [fetchData]);

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

        const handleNewBooking = async (newBooking: any, type: string) => {
            console.log(`🎉 [Socket.IO] Received ${type}:`, newBooking);
            let title = '';
            let body = '';
            if (type === 'new_tow_in_request') {
                title = 'New Tow-In Request!';
                body = `A customer needs a ${newBooking.vehicle.name} towed to your garage for service.`;
            } else {
                title = 'New Job Request!';
                body = `You have a new job request in your pending list.`;
            }
            Alert.alert(title, body);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: title,
                    body: body,
                    data: { bookingId: newBooking.id, type: type },
                },
                trigger: null,
            });
            fetchDataRef.current();
        };

        socket.on('new_booking', (newBooking: any) => handleNewBooking(newBooking, 'new_booking'));
        socket.on('new_tow_in_request', (newBooking: any) => handleNewBooking(newBooking, 'new_tow_in_request'));
        socket.on('payment_confirmed', (data: { bookingId: string }) => {
            Alert.alert("Payment Confirmed", `The customer has paid. The job is confirmed.`);
            fetchDataRef.current();
        });
        socket.on('booking_confirmed_by_user', (data: { bookingId: string }) => {
            Alert.alert("Booking Confirmed (Cash)", `The customer has confirmed a cash payment.`);
            fetchDataRef.current();
        });
        socket.on('tow_truck_assigned', (data: { bookingId: string; towTruck: any }) => {
            Alert.alert("Tow Truck Assigned!", `A tow truck is on the way.`);
            fetchDataRef.current();
        });
        socket.on('vehicle_delivered', (data: { bookingId: string }) => {
            Alert.alert("Vehicle Delivered!", `A vehicle has been delivered to your garage.`);
            fetchDataRef.current();
        });
        socket.on('quote_rejected_by_customer', (data: { bookingId: string; reason: string }) => {
            Alert.alert("Quote Rejected", `Reason: ${data.reason}`);
            fetchDataRef.current();
        });
        socket.on('booking_cancelled_by_customer', (data: { bookingId: string; reason: string }) => {
            Alert.alert("Booking Cancelled", `The customer cancelled the booking.`);
            fetchDataRef.current();
        });

        return () => {
            socket.disconnect();
        };
    }, [garageId]);

    useEffect(() => {
        if (garageId) {
            registerForPushNotificationsAsync(garageId, 'garage', getToken);
        }
        fetchData();
    }, [garageId]);

    const onRefresh = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    const seedGarageStoreFromCurrent = () => {
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
        setSupportedVehicleTypes(garage.supportedVehicleTypes || []);
        if (garage.location?.coordinates) {
            setLocation({ latitude: garage.location.coordinates[1], longitude: garage.location.coordinates[0] });
        }
    };

    const handleEdit = () => {
        seedGarageStoreFromCurrent();
        router.push({
            pathname: '/settings/add-business/businesssetup/edit-garage/edit-details',
            params: { garageId },
        });
    };

    const handleEditServicesOnly = () => {
        seedGarageStoreFromCurrent();
        router.push({
            pathname: '/settings/add-business/businesssetup/edit-garage/edit-services',
            params: { garageId },
        });
    };

    const handleEditLocationOnly = () => {
        seedGarageStoreFromCurrent();
        router.push({
            pathname: '/settings/add-business/businesssetup/location-picker',
            params: { garageId, mode: 'garage' },
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
            router.replace('../settings');
        } catch (error: any) {
            Alert.alert("Deletion Error", error.message);
        }
    };

    const handleAccept = async (booking: any) => {
        if (!booking || !booking.id) return;
        const { id: bookingId, bookingType } = booking;
        setAcceptingId(bookingId);
        const endpoint = bookingType === 'TOW_TO_GARAGE'
            ? `${API_BASE_URL}/api/bookings/${bookingId}/accept-tow-in`
            : `${API_BASE_URL}/api/bookings/${bookingId}/accept`;

        try {
            const token = await getToken();
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to accept request');
            }
            Alert.alert('Success', 'Request accepted successfully!');
            setIsBusinessModalVisible(false);
            fetchData();
        } catch (error: any) {
            Alert.alert(`Error: ${error.message}`);
        } finally {
            setAcceptingId(null);
        }
    };

    const handleDecline = async (bookingId: string) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/decline`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to decline request');
            Alert.alert("Declined", "You have declined the request.");
            setIsBusinessModalVisible(false);
            fetchData();
        } catch (error: any) {
            Alert.alert("Failed to decline request.", error.message);
        }
    };

    const handleCancel = (bookingId: string) => {
        Alert.alert(
            "Cancel Booking",
            "Are you sure you want to cancel?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel-by-provider`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ reason: "Service cancelled by garage." }),
                            });
                            if (!response.ok) throw new Error("Failed to cancel booking.");
                            Alert.alert("Success", "The booking has been cancelled.");
                            setIsBusinessModalVisible(false);
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
        if (jobsSubTab === 'Pending') {
            return b.status === 'SEARCHING' && (b.subStatus === 'AWAITING_GARAGE_ACCEPTANCE' || !b.subStatus);
        }
        if (jobsSubTab === 'Current') {
            return (
                (b.status === 'SEARCHING' && b.subStatus === 'AWAITING_TOW_TRUCK_ACCEPTANCE') ||
                b.status === 'AWAITING_PAYMENT' ||
                b.status === 'CONFIRMED' ||
                (b.status === 'IN_PROGRESS' && (b.subStatus === 'AWAITING_GARAGE_QUOTE' || b.subStatus === 'AWAITING_QUOTE_APPROVAL' || b.subStatus === 'AWAITING_FINAL_APPROVAL' || b.subStatus === 'SERVICE_IN_PROGRESS'))
            );
        }
        if (jobsSubTab === 'History') {
            return ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(b.status);
        }
        return false;
    });

    const renderModalActions = () => {
        if (!selectedBooking) return null;
        const b = selectedBooking;
        const isHistory = jobsSubTab === 'History';

        const hasFinalTowEstimate = b.finalEstimateAmount !== null && b.finalEstimateAmount !== undefined;
        const canVerifyStandardCompletion = b.bookingType !== 'TOW_TO_GARAGE' && (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
        const canVerifyTowCompletion = b.bookingType === 'TOW_TO_GARAGE' && (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') && b.subStatus === 'SERVICE_IN_PROGRESS' && hasFinalTowEstimate;
        const showCompleteButton = canVerifyStandardCompletion || canVerifyTowCompletion;
        const showSubmitQuoteButton = b.bookingType === 'TOW_TO_GARAGE' && ((b.status === 'IN_PROGRESS' && (b.subStatus === 'AWAITING_GARAGE_QUOTE' || b.subStatus === 'QUOTE_REJECTED')) || (b.status === 'CONFIRMED' && (b.subStatus === 'TOW_TRUCK_ASSIGNED' || b.subStatus === 'VEHICLE_DELIVERED')));
        const showSubmitFinalQuoteButton = b.bookingType === 'TOW_TO_GARAGE' && b.status === 'IN_PROGRESS' && b.subStatus === 'SERVICE_IN_PROGRESS' && !hasFinalTowEstimate;

        return (
            <View style={{ gap: 10 }}>
                {!isHistory && (
                    <TouchableOpacity style={[styles.mainActionButton, styles.chatButton]} onPress={() => { setIsBusinessModalVisible(false); handleChat(b.id); }}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.mainActionButtonText}>Chat with Customer</Text>
                    </TouchableOpacity>
                )}

                {jobsSubTab === 'Pending' && !isHistory && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={[styles.mainActionButton, styles.declineButtonNew, { flex: 1 }]} onPress={() => handleDecline(b.id)}>
                            <Text style={styles.mainActionButtonText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.mainActionButton, styles.acceptButtonNew, { flex: 1 }]} onPress={() => handleAccept(b)}>
                            {acceptingId === b.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainActionButtonText}>Accept Job</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {showSubmitQuoteButton && (
                    <TouchableOpacity style={[styles.mainActionButton, styles.acceptButtonNew]} onPress={() => { setIsBusinessModalVisible(false); handleOpenQuoteModal(b); }}>
                        <Text style={styles.mainActionButtonText}>Submit Estimate</Text>
                    </TouchableOpacity>
                )}

                {showSubmitFinalQuoteButton && (
                    <TouchableOpacity style={[styles.mainActionButton, styles.acceptButtonNew]} onPress={() => { setIsBusinessModalVisible(false); handleOpenFinalQuoteModal(b); }}>
                        <Text style={styles.mainActionButtonText}>Submit Final Invoice</Text>
                    </TouchableOpacity>
                )}

                {showCompleteButton && (
                    <TouchableOpacity style={[styles.mainActionButton, styles.completeButtonNew]} onPress={() => { setIsBusinessModalVisible(false); handleOpenOtpModal(b.id); }}>
                        <Text style={styles.mainActionButtonText}>Complete & Verify OTP</Text>
                    </TouchableOpacity>
                )}

                {jobsSubTab === 'Current' && !isHistory && (
                    <TouchableOpacity style={[styles.mainActionButton, styles.cancelButtonNew, { marginTop: 8 }]} onPress={() => handleCancel(b.id)}>
                        <Text style={styles.mainActionButtonText}>Cancel Booking</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading && !garage) return <View style={styles.centered}><ActivityIndicator size="large" color="#005C70" /></View>;
    if (!garage) return <View style={styles.centered}><Text style={styles.errorText}>Could not load your garage data.</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005C70" />}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View style={styles.headerCard}>
                    <Ionicons name="business" size={40} color="#005C70" />
                    <Text style={styles.truckName}>{garage.name}</Text>
                    <Text style={styles.truckPlate}>{garage.address}</Text>
                </View>

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

                        {loading ? (
                            <View style={styles.centeredTabContent}><ActivityIndicator size="large" color="#005C70" /></View>
                        ) : filteredBookings.length > 0 ? (
                            (() => {
                                const grouped = filteredBookings.reduce((acc: any, booking: any) => {
                                    const date = new Date(booking.bookedAt).toLocaleDateString();
                                    if (!acc[date]) acc[date] = [];
                                    acc[date].push(booking);
                                    return acc;
                                }, {});

                                return Object.keys(grouped).map(date => (
                                    <View key={date}>
                                        <View style={styles.dateHeaderContainer}>
                                            <Text style={styles.dateHeaderText}>{date}</Text>
                                            <View style={styles.dateDivider} />
                                        </View>
                                        {grouped[date].map((booking: any) => (
                                            <GarageBookingCard
                                                key={booking.id}
                                                booking={booking}
                                                currentTab={jobsSubTab}
                                                onPress={(b) => { setSelectedBooking(b); setIsBusinessModalVisible(true); }}
                                            />
                                        ))}
                                    </View>
                                ));
                            })()
                        ) : (
                            <EmptyState
                                title={`No ${jobsSubTab} Bookings`}
                                message={`You have no ${jobsSubTab.toLowerCase()} bookings at the moment.`}
                                iconName={jobsSubTab === 'History' ? 'time-outline' : 'list-outline'}
                            />
                        )}
                    </View>
                ) : mainTab === 'Profile' ? (
                    <View>
                        <View style={{ height: 24 }} />
                        <View style={styles.detailsCard}>
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.cardTitle}>Details</Text>
                                <TouchableOpacity style={[styles.inlineEditButton, styles.editButton]} onPress={handleEdit}>
                                    <Ionicons name="person-circle-outline" size={14} color="#fff" />
                                    <Text style={styles.inlineEditButtonText}>Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                            <InfoRow icon="person-circle-outline" label="Owner" value={garage.ownerName} />
                            <InfoRow icon="id-card-outline" label="License No" value={garage.licenseNumber} />
                            <InfoRow icon="call-outline" label="Phone" value={garage.contactPhone} />
                            <InfoRow icon="mail-outline" label="Email" value={garage.contactEmail} />
                            <View style={styles.detailsDivider} />
                            <Text style={styles.sectionSubtitle}>Payment Details</Text>
                            <InfoRow icon="card-outline" label="Payment Partner" value="Razorpay" />
                            <InfoRow
                                icon={garage.razorpayAccountId ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                                label="Payout Status"
                                value={garage.razorpayAccountId ? 'Connected' : 'Not connected'}
                            />
                            <InfoRow icon="wallet-outline" label="Connected Payout ID" value={garage.razorpayAccountId || '-'} />
                        </View>

                        <View style={styles.detailsCard}>
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.cardTitle}>Services & Pricing</Text>
                                <TouchableOpacity style={[styles.inlineEditButton, styles.servicesButton]} onPress={handleEditServicesOnly}>
                                    <Ionicons name="build-outline" size={14} color="#fff" />
                                    <Text style={styles.inlineEditButtonText}>Edit Services</Text>
                                </TouchableOpacity>
                            </View>
                            {garage.services.length > 0 ? (
                                garage.services.map((serviceItem: any) => (
                                    <View key={serviceItem.id} style={styles.serviceRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.serviceName}>{serviceItem.service.name}</Text>
                                            {serviceItem.service.category !== 'INGARAGE_CAR' && serviceItem.service.category !== 'INGARAGE_BIKE' &&
                                                <Text style={styles.servicePrice}>INR {serviceItem.price.toFixed(2)}</Text>
                                            }
                                        </View>
                                        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                            <Text style={{ fontSize: 10, color: '#005C70', marginRight: 6, fontWeight: '600' }}>ACTIVE</Text>
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
                            ) : (
                                <Text style={styles.noServicesText}>No services configured.</Text>
                            )}
                        </View>

                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={[styles.actionButton, styles.locationButton]} onPress={handleEditLocationOnly}>
                                <Ionicons name="location-outline" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Update Location</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                                <Ionicons name="trash" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {mainTab === 'Analytics' && (
                    <View style={{ padding: 20, marginTop: 10 }}>
                        <Text style={styles.cardTitle}>Business Analytics</Text>
                        {analyticsData ? (
                            <View>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                                    <View style={[styles.card, { flex: 1, minWidth: '45%', backgroundColor: '#e0f7fa', marginHorizontal: 0 }]}>
                                        <Ionicons name="cash-outline" size={30} color="#006064" />
                                        <Text style={{ fontSize: 14, color: '#006064', marginTop: 10 }}>Total Revenue</Text>
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#006064' }}>₹{analyticsData.totalRevenue.toLocaleString()}</Text>
                                    </View>
                                    <View style={[styles.card, { flex: 1, minWidth: '45%', backgroundColor: '#fff3e0', marginHorizontal: 0 }]}>
                                        <Ionicons name="calendar-outline" size={30} color="#e65100" />
                                        <Text style={{ fontSize: 14, color: '#e65100', marginTop: 10 }}>Total Bookings</Text>
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#e65100' }}>{analyticsData.totalBookings}</Text>
                                    </View>
                                    <View style={[styles.card, { flex: 1, minWidth: '45%', backgroundColor: '#f3e5f5', marginHorizontal: 0 }]}>
                                        <Ionicons name="trending-up-outline" size={30} color="#4a148c" />
                                        <Text style={{ fontSize: 14, color: '#4a148c', marginTop: 10 }}>Avg. Order Value</Text>
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4a148c' }}>₹{analyticsData.averageRevenue.toFixed(0)}</Text>
                                    </View>
                                    <View style={[styles.card, { flex: 1, minWidth: '45%', backgroundColor: '#e8f5e9', marginHorizontal: 0 }]}>
                                        <Ionicons name="checkbox-outline" size={30} color="#1b5e20" />
                                        <Text style={{ fontSize: 14, color: '#1b5e20', marginTop: 10 }}>Completed Jobs</Text>
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1b5e20' }}>{analyticsData.completedBookings}</Text>
                                    </View>
                                </View>
                                <View style={[styles.card, { marginTop: 20, marginHorizontal: 0 }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                        <Ionicons name="trophy" size={24} color="#fbc02d" />
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' }}>Top Customer</Text>
                                    </View>
                                    {analyticsData.topCustomer.name !== 'N/A' ? (
                                        <View>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#005C70' }}>{analyticsData.topCustomer.name}</Text>
                                            <Text style={{ color: '#666', marginTop: 5 }}>
                                                Has booked <Text style={{ fontWeight: 'bold', color: '#333' }}>{analyticsData.topCustomer.bookings}</Text> times with you.
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={{ color: '#999', fontStyle: 'italic' }}>No customer data available yet.</Text>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <ActivityIndicator size="large" color="#005C70" style={{ marginTop: 50 }} />
                        )}
                    </View>
                )}
            </ScrollView>

            <BusinessBookingModal
                visible={isBusinessModalVisible}
                onClose={() => setIsBusinessModalVisible(false)}
                booking={selectedBooking}
                garageLocation={garage?.location}
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
            <QuoteModal
                visible={quoteModalVisible}
                onClose={() => setQuoteModalVisible(false)}
                vehicleStatus={quoteVehicleStatus}
                setVehicleStatus={setQuoteVehicleStatus}
                servicesRequired={quoteServicesRequired}
                setServicesRequired={setQuoteServicesRequired}
                servicesEstimate={quoteServicesEstimate}
                setServicesEstimate={setQuoteServicesEstimate}
                jobEstimate={quoteJobEstimate}
                setJobEstimate={setQuoteJobEstimate}
                notes={quoteNotes}
                setNotes={setQuoteNotes}
                onSubmit={handleSubmitQuote}
                isSubmitting={isSubmittingQuote}
            />
            <FinalQuoteModal
                visible={finalQuoteModalVisible}
                onClose={() => setFinalQuoteModalVisible(false)}
                jobEstimate={finalQuoteJobEstimate}
                setJobEstimate={setFinalQuoteJobEstimate}
                notes={finalQuoteNotes}
                setNotes={setFinalQuoteNotes}
                onSubmit={handleSubmitFinalQuote}
                isSubmitting={isSubmittingFinalQuote}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#eef0f3' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, color: '#e74c3c', textAlign: 'center' },
    headerCard: {
        backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, marginBottom: 16, borderRadius: 20, padding: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
        elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8,
    },
    truckName: { fontSize: 22, fontWeight: '700', color: '#005C70', flex: 1, marginLeft: 16 },
    truckPlate: { fontSize: 14, color: '#7f8c8d', letterSpacing: 0.5 },
    detailsCard: {
        backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 24, marginTop: 12, borderRadius: 20,
        elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8,
    },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#005C70', marginBottom: 0 },
    sectionSubtitle: { fontSize: 14, fontWeight: '700', color: '#005C70', marginTop: 4, marginBottom: 6 },
    inlineEditButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999, gap: 5 },
    inlineEditButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    detailsDivider: { height: 1, backgroundColor: '#eef2f5', marginTop: 6, marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    infoIcon: { width: 20, textAlign: 'center', marginRight: 10, opacity: 0.7 },
    infoLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
    infoValue: { fontSize: 14, color: '#333', flex: 1, textAlign: 'right', fontWeight: '600' },
    serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f7f7f7' },
    serviceName: { fontSize: 16, color: '#333', fontWeight: '500', textTransform: 'capitalize' },
    servicePrice: { fontSize: 16, fontWeight: '700', color: '#005C70' },
    noServicesText: { fontSize: 16, color: '#999', fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 10, marginBottom: 40, gap: 16 },
    editButton: { backgroundColor: '#3498db' },
    servicesButton: { backgroundColor: '#005C70' },
    locationButton: { backgroundColor: '#16a085' },
    deleteButton: { backgroundColor: '#e74c3c' },
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
    centeredTabContent: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    chatButton: { backgroundColor: '#3498db' },
    actionButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 8,
        borderRadius: 14, minHeight: 48, shadowColor: '#000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
    },
    actionButtonText: { color: 'white', fontSize: 14, fontWeight: '700', marginLeft: 8 },
    mainActionButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14,
        shadowColor: '#000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
    },
    mainActionButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    cancelButtonNew: { backgroundColor: '#95a5a6' },
    completeButtonNew: { backgroundColor: '#27ae60' },
    declineButtonNew: { backgroundColor: '#e74c3c' },
    acceptButtonNew: { backgroundColor: '#005C70' },
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    dateHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, marginTop: 16 },
    dateHeaderText: { fontSize: 14, color: '#555', fontWeight: '700', marginRight: 12, textTransform: 'uppercase', letterSpacing: 1 },
    dateDivider: { flex: 1, height: 1, backgroundColor: '#ddd' },
});
