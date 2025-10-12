import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

interface Booking {
    id: string;
    // Add other properties of booking as needed
    [key: string]: any;
}

// ===================================================================
//  MODALS
// ===================================================================

const QuoteDetailsModal = ({ booking, visible, onClose, onPaymentSuccess, onReject }: { booking: any, visible: boolean, onClose: () => void, onPaymentSuccess: () => void, onReject: () => void }) => {
    if (!visible || !booking) return null;

    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { getToken } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
    const [isPaying, setIsPaying] = useState(false);

    const handleCardPayment = async () => {
        setIsPaying(true);
        try {
            const token = await getToken();
            // 1. Create a payment intent on the server
            const response = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/create-garage-payment-intent`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const { clientSecret, error: intentError } = await response.json();
            if (intentError) throw new Error(intentError);

            // 2. Initialize the payment sheet
            const { error: initError } = await initPaymentSheet({ 
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'Afthuliftme Inc.',
             });
            if (initError) throw new Error(initError.message);

            // 3. Present the payment sheet
            const { error: presentError } = await presentPaymentSheet();
            if (presentError) {
                if (presentError.code !== 'Canceled') {
                    throw new Error(presentError.message);
                }
                setIsPaying(false);
                return; // User cancelled
            }

            // 4. Confirm payment on the server
            const confirmRes = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/confirm-garage-payment`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!confirmRes.ok) throw new Error('Failed to confirm payment on server.');

            Alert.alert("Payment Successful", "The garage has been notified to start the service.");
            onPaymentSuccess();

        } catch (error: any) {
            Alert.alert("Payment Failed", error.message);
        } finally {
            setIsPaying(false);
        }
    };

    const handleCashPayment = async () => {
        setIsPaying(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/confirm-garage-cash`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to confirm cash payment.');

            Alert.alert("Booking Confirmed", "The garage has been notified to start the service. Please pay the amount in cash.");
            onPaymentSuccess();
        } catch (error: any) {
            Alert.alert("Confirmation Failed", error.message);
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={modalStyles.modalTitle}>Service Quote</Text>
                            <TouchableOpacity onPress={onClose} style={[styles.bookingButton, styles.cancelButton, { marginLeft: 0, paddingHorizontal: 12, paddingVertical: 6 }]}>
                                <Text style={styles.bookingButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={modalStyles.quoteDetailRow}>
                            <Text style={modalStyles.quoteLabel}>Vehicle Status:</Text>
                            <Text style={modalStyles.quoteValue}>{booking.vehicleStatus || 'N/A'}</Text>
                        </View>
                        <View style={modalStyles.quoteDetailRow}>
                            <Text style={modalStyles.quoteLabel}>Services Required:</Text>
                            <Text style={modalStyles.quoteValue}>{booking.servicesRequired || 'N/A'}</Text>
                        </View>
                        <View style={modalStyles.quoteDetailRow}>
                            <Text style={modalStyles.quoteLabel}>Services Estimate:</Text>
                            <Text style={modalStyles.quoteValue}>{booking.servicesEstimate || 'N/A'}</Text>
                        </View>
                        <View style={modalStyles.quoteDetailRow}>
                            <Text style={modalStyles.quoteLabel}>Job Estimate:</Text>
                            <Text style={modalStyles.quoteValue}>INR {booking.jobEstimate?.toFixed(2)}</Text>
                        </View>
                        <View style={modalStyles.notesContainer}>
                            <Text style={modalStyles.quoteLabel}>Garage Notes:</Text>
                            <Text style={modalStyles.notesText}>{booking.notes || 'No notes provided.'}</Text>
                        </View>

                        <Text style={modalStyles.paymentHeader}>Select Payment Method</Text>
                        <TouchableOpacity style={[modalStyles.paymentOption, paymentMethod === 'CASH' && modalStyles.selectedPaymentOption]} onPress={() => setPaymentMethod('CASH')}>
                            <Ionicons name="cash-outline" size={24} color="#27ae60" />
                            <Text style={modalStyles.paymentText}>Pay with Cash</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[modalStyles.paymentOption, paymentMethod === 'CARD' && modalStyles.selectedPaymentOption]} onPress={() => setPaymentMethod('CARD')}>
                            <Ionicons name="card-outline" size={24} color="#2980b9" />
                            <Text style={modalStyles.paymentText}>Pay with Card</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[modalStyles.confirmButton, isPaying && { backgroundColor: '#95a5a6' }]} 
                            onPress={paymentMethod === 'CARD' ? handleCardPayment : handleCashPayment}
                            disabled={isPaying}
                        >
                            {isPaying ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.confirmButtonText}>Confirm & Proceed</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[modalStyles.cancelButton, isPaying && { backgroundColor: '#95a5a6' }]}
                            onPress={onReject}
                            disabled={isPaying}
                        >
                            <Text style={modalStyles.confirmButtonText}>Reject Order</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const SparePartPaymentModal = ({ booking, visible, onClose, onPaymentSuccess }: { booking: any, visible: boolean, onClose: () => void, onPaymentSuccess: () => void }) => {
    if (!visible || !booking) return null;

    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { getToken } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
    const [isPaying, setIsPaying] = useState(false);

    const handleCardPayment = async () => {
        setIsPaying(true);
        try {
            const token = await getToken();
            // 1. Create a payment intent on the server (already created by seller acceptance, just need clientSecret)
            // The clientSecret should ideally come from the WebSocket event or be fetched if missing.
            // For now, we assume booking.paymentIntentId is set and we can retrieve clientSecret.
            const response = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/create-payment-intent`, { // Re-using generic create-payment-intent
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const { clientSecret, error: intentError } = await response.json();
            if (intentError) throw new Error(intentError);

            // 2. Initialize the payment sheet
            const { error: initError } = await initPaymentSheet({ 
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'Afthuliftme Inc.',
             });
            if (initError) throw new Error(initError.message);

            // 3. Present the payment sheet
            const { error: presentError } = await presentPaymentSheet();
            if (presentError) {
                if (presentError.code !== 'Canceled') {
                    throw new Error(presentError.message);
                }
                setIsPaying(false);
                return; // User cancelled
            }

            // 4. Confirm payment on the server
            const confirmRes = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/confirm-spare-part-payment`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!confirmRes.ok) throw new Error('Failed to confirm payment on server.');

            Alert.alert("Payment Successful", "Your spare part order is confirmed!");
            onPaymentSuccess();

        } catch (error: any) {
            Alert.alert("Payment Failed", error.message);
        } finally {
            setIsPaying(false);
        }
    };

    const handleCashPayment = async () => {
        setIsPaying(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/confirm-spare-part-cash`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to confirm cash payment.');

            Alert.alert("Order Confirmed", "Your spare part order is confirmed! Please pay the amount in cash upon delivery/pickup.");
            onPaymentSuccess();
        } catch (error: any) {
            Alert.alert("Confirmation Failed", error.message);
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Ionicons name="close-circle" size={30} color="#e74c3c" />
                    </TouchableOpacity>
                    <Text style={modalStyles.modalTitle}>Confirm Spare Part Order</Text>
                    
                    <View style={modalStyles.quoteDetailRow}>
                        <Text style={modalStyles.quoteLabel}>Part:</Text>
                        <Text style={modalStyles.quoteValue}>{booking.sparePart?.partName}</Text>
                    </View>
                    <View style={modalStyles.quoteDetailRow}>
                        <Text style={modalStyles.quoteLabel}>Quantity:</Text>
                        <Text style={modalStyles.quoteValue}>{booking.basePrice / booking.sparePart?.price}</Text>
                    </View>
                    <View style={modalStyles.quoteDetailRow}>
                        <Text style={modalStyles.quoteLabel}>Total Amount:</Text>
                        <Text style={modalStyles.quoteValue}>INR {booking.finalAmount?.toFixed(2)}</Text>
                    </View>
                    <View style={modalStyles.quoteDetailRow}>
                        <Text style={modalStyles.quoteLabel}>Seller:</Text>
                        <Text style={modalStyles.quoteValue}>{booking.sparePartStore?.name}</Text>
                    </View>

                    <Text style={modalStyles.paymentHeader}>Select Payment Method</Text>
                    <TouchableOpacity style={[modalStyles.paymentOption, paymentMethod === 'CASH' && modalStyles.selectedPaymentOption]} onPress={() => setPaymentMethod('CASH')}>
                        <Ionicons name="cash-outline" size={24} color="#27ae60" />
                        <Text style={modalStyles.paymentText}>Pay with Cash</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[modalStyles.paymentOption, paymentMethod === 'CARD' && modalStyles.selectedPaymentOption]} onPress={() => setPaymentMethod('CARD')}>
                        <Ionicons name="card-outline" size={24} color="#2980b9" />
                        <Text style={modalStyles.paymentText}>Pay with Card</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[modalStyles.confirmButton, isPaying && { backgroundColor: '#95a5a6' }]} 
                        onPress={paymentMethod === 'CARD' ? handleCardPayment : handleCashPayment}
                        disabled={isPaying}
                    >
                        {isPaying ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.confirmButtonText}>Confirm & Proceed</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ===================================================================
//  ORDER CARD COMPONENT
// ===================================================================

const OrderCard = ({ booking, onCancel, onViewQuote, onPaySparePart, onChat }: { booking: any, onCancel: (bookingId: string) => void, onViewQuote: (booking: any) => void, onPaySparePart: (booking: any) => void, onChat: (bookingId: string) => void }) => {
    console.log('Rendering OrderCard for booking:', booking.id, 'Status:', booking.status);
    let provider;
    let serviceName;
    let isTowingPhase = false;

    if (booking.bookingType === 'TOW_TO_GARAGE') {
        if (booking.subStatus !== 'VEHICLE_DELIVERED' && booking.subStatus !== 'AWAITING_GARAGE_QUOTE' && booking.subStatus !== 'AWAITING_QUOTE_APPROVAL' && booking.subStatus !== 'SERVICE_IN_PROGRESS' && booking.subStatus !== 'SERVICE_COMPLETED') {
            // Phase 1: Towing to the garage
            provider = booking.towTruck;
            serviceName = `Towing to ${booking.garage?.name || 'Garage'}`;
            isTowingPhase = true;
        } else {
            // Phase 2: At the garage
            provider = booking.garage;
            serviceName = 'Garage Service';
            isTowingPhase = false;
        }
    } else if (booking.bookingType === 'SPARE_PART') {
        provider = booking.sparePartStore; // The store is the provider for spare parts
        serviceName = booking.sparePart?.partName || 'Spare Part Order';
        isTowingPhase = false; // Not a towing phase
    } else {
        provider = booking.garage || booking.towTruck;
        serviceName = booking.service?.name || 'Towing Service';
        isTowingPhase = true; 
    }

    const travelEta = booking.providerEta || 0;
    const serviceEta = travelEta + 30;

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
        } else if (booking.bookingType === 'SPARE_PART' && booking.sparePartStore?.owner?.phone) {
            // For spare parts, call the store owner
            Linking.openURL(`tel:${booking.sparePartStore.owner.phone}`);
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.serviceName}>{serviceName}</Text>
                <Text style={[styles.status, styles[`status_${booking.status}` as keyof typeof styles]]}>
                    {booking.status.replace('_', ' ')}
                </Text>
            </View>

            {booking.bookingType === 'SPARE_PART' ? (
                <View>
                    <View style={styles.providerInfo}>
                        <Ionicons name="storefront-outline" size={20} color="#555" />
                        <Text style={styles.providerName}>{provider?.name || 'Store details unavailable'}</Text>
                    </View>
                    <View style={styles.bookingDetails}>
                        <Ionicons name="cube-outline" size={20} color="#3498db" />
                        <Text style={styles.bookingText}>Part: {booking.sparePart?.partName}</Text>
                    </View>
                    <View style={styles.bookingDetails}>
                        <Ionicons name="pricetag-outline" size={20} color="#27ae60" />
                        <Text style={styles.bookingText}>Price: INR {booking.finalAmount?.toFixed(2)}</Text>
                    </View>
                    <View style={styles.bookingDetails}>
                        <Ionicons name="apps-outline" size={20} color="#E67E22" />
                        <Text style={styles.bookingText}>Quantity: {booking.basePrice / booking.sparePart?.price}</Text>
                    </View>
                    {booking.status === 'PENDING_ACCEPTANCE' && (
                        <View style={styles.inProgressContainer}>
                            <Ionicons name="hourglass-outline" size={20} color="#f1c40f" />
                            <Text style={styles.inProgressText}>Awaiting seller confirmation.</Text>
                        </View>
                    )}
                    {booking.status === 'AWAITING_PAYMENT' && (
                        <View style={styles.bookingActions}>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.payButton]} 
                                onPress={() => onPaySparePart(booking)}
                            >
                                <Ionicons name="wallet-outline" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Pay Now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {booking.status === 'CONFIRMED' && booking.paymentMethod === 'CASH' && (
                        <View style={styles.inProgressContainer}>
                            <Ionicons name="cash-outline" size={20} color="#27ae60" />
                            <Text style={styles.inProgressText}>Confirmed. Pay cash on delivery/pickup.</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View>
                    <View style={styles.providerInfo}>
                        <Ionicons name={isTowingPhase ? "car-sport-outline" : "business-outline"} size={20} color="#555" />
                        <Text style={styles.providerName}>{provider?.name || 'Provider details unavailable'}</Text>
                    </View>

                    {booking.status === 'CONFIRMED' && isTowingPhase && (
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
                                <Text style={styles.otpLabel}>Share this OTP with tow truck on arrival:</Text>
                                <Text style={styles.otpCode}>{booking.otp}</Text>
                            </View>
                        </>
                    )}

                    {booking.subStatus === 'AWAITING_GARAGE_QUOTE' && (
                        <View style={styles.inProgressContainer}>
                            <Ionicons name="build-outline" size={20} color="#2980b9" />
                            <Text style={styles.inProgressText}>Your vehicle is at the garage. Awaiting service quote.</Text>
                        </View>
                    )}

                    {booking.subStatus === 'AWAITING_QUOTE_APPROVAL' && (
                        <View style={[styles.quoteContainer, { backgroundColor: '#fff8e1', borderColor: '#ffecb3' }]}>
                            <Ionicons name="document-text-outline" size={24} color="#f57f17" />
                            <View style={{flex: 1, marginLeft: 10}}>
                                <Text style={[styles.quoteText, { color: '#f57f17' }]}>Quote Received!</Text>
                                <Text style={styles.quoteAmount}>INR {booking.jobEstimate?.toFixed(2)}</Text>
                            </View>
                            <TouchableOpacity style={styles.viewQuoteButton} onPress={() => onViewQuote(booking)}>
                                <Text style={styles.viewQuoteButtonText}>View & Pay</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {booking.subStatus === 'SERVICE_IN_PROGRESS' && booking.otp && (
                        <View style={[styles.otpContainer, { backgroundColor: '#e9f5ff', borderColor: '#d0e7ff' }]}>
                            <Text style={[styles.otpLabel, { color: '#1a5f99' }]}>Share this code with the garage to complete the service:</Text>
                            <Text style={[styles.otpCode, { color: '#0d47a1' }]}>{booking.otp}</Text>
                        </View>
                    )}
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall} disabled={!provider?.contactPhone && !(booking.bookingType === 'SPARE_PART' && booking.sparePartStore?.owner?.phone)}>
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Call Provider</Text>
                </TouchableOpacity>

                {(booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && (
                    <TouchableOpacity style={[styles.actionButton, styles.chatButton]} onPress={() => onChat(booking.id)}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Chat</Text>
                    </TouchableOpacity>
                )}

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
    const { getToken, userId } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [quoteModalVisible, setQuoteModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const [sparePartPaymentModalVisible, setSparePartPaymentModalVisible] = useState(false);
    const [selectedSparePartBooking, setSelectedSparePartBooking] = useState(null);

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

        socket.on('connect', () => {
            console.log('[OrdersScreen] Socket connected');
            if (userId) {
                socket.emit('register_customer', userId);
            }
        });

        const handleEvent = (eventName: string, data: any) => {
            console.log(`🎉 [OrdersScreen] ${eventName} event received:`, data);
            let alertTitle = 'Booking Update';
            let alertMessage = 'Your booking has been updated.';

            if (eventName === 'booking_accepted') {
                alertTitle = "Booking Accepted!";
                alertMessage = "A provider has accepted your request and is on the way.";
            } else if (eventName === 'service_completed') {
                alertTitle = "Service Completed";
                alertMessage = "Your service is complete. Thank you for using our app!";
            } else if (eventName === 'booking_cancelled_by_provider') {
                alertTitle = "Booking Cancelled";
                alertMessage = `Your booking was cancelled by the provider. Reason: ${data.reason || 'No reason provided.'}`;
            } else if (eventName === 'garage_quote_ready') {
                alertTitle = "Quote Ready";
                alertMessage = "A garage has submitted a quote for your vehicle service.";
            } else if (eventName === 'spare_part_order_accepted') {
                alertTitle = "Order Accepted!";
                alertMessage = "Your spare part order has been accepted by the seller. Please proceed to payment.";
                // Optionally, open the payment modal directly
                fetchActiveBookings(); // Refresh to get updated booking status
                // Find the booking and open modal
                // const acceptedBooking = bookings.find(b => b.id === data.bookingId);
                // if (acceptedBooking) {
                //     setSelectedSparePartBooking(acceptedBooking);
                //     setSparePartPaymentModalVisible(true);
                // }
            } else if (eventName === 'spare_part_order_confirmed') {
                alertTitle = "Order Confirmed!";
                alertMessage = "Your cash spare part order has been confirmed by the seller.";
            } else if (eventName === 'spare_part_order_rejected') {
                alertTitle = "Order Rejected";
                alertMessage = "Your spare part order has been rejected by the seller.";
            }

            Alert.alert(alertTitle, alertMessage);
            fetchActiveBookings();
        };

        socket.on('booking_accepted', (data:any) => handleEvent('booking_accepted', data));
        socket.on('service_completed', (data:any) => handleEvent('service_completed', data));
        socket.on('booking_cancelled_by_provider', (data:any) => handleEvent('booking_cancelled_by_provider', data));
        socket.on('garage_quote_ready', (data:any) => handleEvent('garage_quote_ready', data));
        socket.on('spare_part_order_accepted', (data:any) => handleEvent('spare_part_order_accepted', data));
        socket.on('spare_part_order_confirmed', (data:any) => handleEvent('spare_part_order_confirmed', data));
        socket.on('spare_part_order_rejected', (data:any) => handleEvent('spare_part_order_rejected', data));

        return () => {
            console.log('[OrdersScreen] Socket disconnecting');
            socket.disconnect();
        };
    }, [fetchActiveBookings]);

    const handleRejectQuote = async (bookingId: string | undefined) => {
        if (!bookingId) return;
        Alert.alert(
            "Reject Quote",
            "Are you sure you want to reject this quote and cancel the booking? This action cannot be undone.",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Reject",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/reject-quote`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                            });
                            if (!response.ok) {
                                const data = await response.json();
                                throw new Error(data.error || "Failed to reject quote.");
                            }
                            Alert.alert("Quote Rejected", "The booking has been cancelled.");
                            setQuoteModalVisible(false);
                            fetchActiveBookings();
                        } catch (error: any) {
                            Alert.alert("Error", error.message);
                        }
                    }
                }
            ]
        );
    };

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

    const handleViewQuote = (booking: any) => {
        setSelectedBooking(booking);
        setQuoteModalVisible(true);
    };

    const handlePaySparePart = (booking: any) => {
        setSelectedSparePartBooking(booking);
        setSparePartPaymentModalVisible(true);
    };

    const handlePaymentSuccess = () => {
        setQuoteModalVisible(false);
        setSparePartPaymentModalVisible(false);
        fetchActiveBookings();
    };

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

    const onRefresh = () => {
        setRefreshing(true);
        fetchActiveBookings();
    };

    return (
        <StripeProvider publishableKey={STRIPE_KEY!}>
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
                        renderItem={({ item }) => <OrderCard booking={item} onCancel={handleCancelBooking} onViewQuote={handleViewQuote} onPaySparePart={handlePaySparePart} onChat={handleChat} />}
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
                 <QuoteDetailsModal 
                    booking={selectedBooking}
                    visible={quoteModalVisible}
                    onClose={() => setQuoteModalVisible(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                    onReject={() => handleRejectQuote(selectedBooking?.id)}
                />
                <SparePartPaymentModal
                    booking={selectedSparePartBooking}
                    visible={sparePartPaymentModalVisible}
                    onClose={() => setSparePartPaymentModalVisible(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            </View>
        </StripeProvider>
    );
}

const modalStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '90%', maxHeight: '80%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    quoteDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    quoteLabel: { fontSize: 16, color: '#555', marginRight: 10 },
    quoteValue: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'right' },
    notesContainer: { marginTop: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
    notesText: { fontSize: 15, color: '#555', fontStyle: 'italic' },
    paymentHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 20,
        marginBottom: 15,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    selectedPaymentOption: {
        borderColor: '#b95528',
        backgroundColor: '#fff8f2',
        borderWidth: 2,
    },
    paymentText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
        fontWeight: '500',
    },
    confirmButton: {
        backgroundColor: '#27ae60',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

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
    status_PENDING_ACCEPTANCE: { backgroundColor: '#f1c40f' }, // Added for spare parts
    status_AWAITING_PAYMENT: { backgroundColor: '#f39c12' }, // Added for spare parts
    status_REJECTED: { backgroundColor: '#e74c3c' }, // Added for spare parts
    providerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    providerName: { fontSize: 15, color: '#555', marginLeft: 10 },
    etaContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    etaBox: { alignItems: 'center', padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8, flex: 1, marginHorizontal: 5 },
    etaLabel: { fontSize: 12, color: '#7f8c8d', marginBottom: 4 },
    etaValue: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
    otpContainer: {
        marginTop: 20,
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff8e1',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffecb3'
    },
    otpLabel: { fontSize: 14, color: '#2e7d32', marginBottom: 8, fontWeight: '500' },
    otpCode: { fontSize: 32, fontWeight: 'bold', color: '#1b5e20', letterSpacing: 8 },
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
    chatButton: {
        backgroundColor: '#3498db',
        marginLeft: 10,
    },
    payButton: {
        backgroundColor: '#b95528',
        marginLeft: 10,
    },
    quoteContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 8, borderWidth: 1, marginVertical: 10 },
    quoteText: { fontSize: 16, fontWeight: 'bold' },
    quoteAmount: { fontSize: 14, color: '#555' },
    viewQuoteButton: { backgroundColor: '#f57f17', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 10 },
    viewQuoteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    bookingButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    bookingButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    bookingDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 5,
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    bookingText: {
        fontSize: 14,
        color: '#2c3e50',
        marginLeft: 10,
    },
    bookingActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 15,
    },
});