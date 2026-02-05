import EmptyState from '@/components/EmptyState';
import RotatingLoader from '@/components/RotatingLoader';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, LayoutAnimation, Linking, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ===================================================================
//  REDESIGNED ORDER CARD COMPONENT
// ===================================================================

const OrderCard = ({
    booking,
    onCancel,
    onCall,
    onChat,
    onApproveQuote,
    onRejectQuote,
}: {
    booking: any,
    onCancel: (id: string) => void,
    onCall: () => void,
    onChat: (id: string) => void,
    onApproveQuote: (id: string) => void,
    onRejectQuote: (id: string) => void,
}) => {

    // Derived Data
    const serviceName = booking.service?.name || "Service Booking";
    const providerName = booking.garage?.name || booking.towTruck?.name || "Searching Provider...";
    const canCancel = booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
    const otp = booking.otp || "WAITING"; // Placeholder if waiting
    const travelEta = booking.providerEta || 10; // Mock default
    const serviceEta = travelEta + 30; // Mock logic
    const quoteHistory = Array.isArray(booking.quoteHistory) ? booking.quoteHistory : [];
    const latestQuote = quoteHistory.length > 0 ? quoteHistory[quoteHistory.length - 1] : null;
    const isAwaitingInitialQuoteApproval = booking.subStatus === 'AWAITING_QUOTE_APPROVAL';
    const isAwaitingFinalQuoteApproval = booking.subStatus === 'AWAITING_FINAL_APPROVAL';
    const showQuoteDecision = booking.bookingType === 'TOW_TO_GARAGE' && (isAwaitingInitialQuoteApproval || isAwaitingFinalQuoteApproval);

    return (
        <View style={styles.card}>
            {/* Header: Service Name & Status */}
            <View style={styles.cardHeader}>
                <Text style={styles.serviceName}>{serviceName}</Text>
                <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{booking.status === 'CONFIRMED' ? 'Confirmed' : booking.status}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Provider Info */}
            <View style={styles.providerContainer}>
                <View style={styles.iconBox}>
                    <Ionicons name="business" size={20} color="#005C70" />
                </View>
                <Text style={styles.providerName}>{providerName}</Text>
            </View>

            {/* Timing Info - Gray Boxes */}
            <View style={styles.timingContainer}>
                <View style={styles.timingBox}>
                    <Text style={styles.timingLabel}>Provider arrives in</Text>
                    <Text style={styles.timingValue}>~{travelEta} min</Text>
                </View>

                <View style={styles.timingBox}>
                    <Text style={styles.timingLabel}>Service Complete in</Text>
                    <Text style={styles.timingValue}>~{serviceEta} min</Text>
                </View>
            </View>

            {/* OTP Section - Blue Box */}
            <View style={styles.otpContainer}>
                <Text style={styles.otpCode}>{String(otp).split('').join(' ')}</Text>
            </View>
            <Text style={styles.otpHelperText}>Share the OTP when service completed</Text>

            {showQuoteDecision && (
                <View style={styles.quoteBox}>
                    <Text style={styles.quoteTitle}>{isAwaitingFinalQuoteApproval ? 'Final Quote Approval Needed' : 'Initial Quote Approval Needed'}</Text>
                    {latestQuote?.servicesRequired ? (
                        <Text style={styles.quoteText}>Work: {latestQuote.servicesRequired}</Text>
                    ) : null}
                    {latestQuote?.jobEstimate || booking.jobEstimate || booking.finalEstimateAmount ? (
                        <Text style={styles.quoteAmount}>INR {Number(latestQuote?.jobEstimate || booking.finalEstimateAmount || booking.jobEstimate || 0).toFixed(2)}</Text>
                    ) : null}
                    {latestQuote?.notes ? (
                        <Text style={styles.quoteText}>Note: {latestQuote.notes}</Text>
                    ) : null}

                    <View style={styles.quoteButtonsRow}>
                        <TouchableOpacity style={[styles.quoteActionButton, styles.rejectQuoteButton]} onPress={() => onRejectQuote(booking.id)}>
                            <Text style={styles.quoteActionText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quoteActionButton, styles.approveQuoteButton]} onPress={() => onApproveQuote(booking.id)}>
                            <Text style={styles.quoteActionText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Action Buttons Row */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={onCall}>
                    <Ionicons name="call" size={18} color="#fff" style={{ marginRight: 5 }} />
                    <Text style={styles.actionButtonText}>Call Provider</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.chatButton]} onPress={() => onChat(booking.id)}>
                    <Ionicons name="chatbubble-ellipses" size={18} color="#fff" style={{ marginRight: 5 }} />
                    <Text style={styles.actionButtonText}>Chat</Text>
                </TouchableOpacity>

                {canCancel && (
                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => onCancel(booking.id)}>
                        <Ionicons name="close-circle" size={18} color="#fff" style={{ marginRight: 5 }} />
                        <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default function OrdersScreen() {
    const { getToken } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // State
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stable Fetch Function
    const fetchActiveBookings = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            setError(null); // Reset error
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/bookings/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setBookings(data);
            } else {
                throw new Error("Failed to fetch orders");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Could not load your orders. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []); // Keep dependencies empty to prevent effect loops. getToken is stable enough.

    // Initial Fetch on Focus
    useFocusEffect(
        useCallback(() => {
            fetchActiveBookings();
        }, []) // Empty dependency array ensures this only runs on focus
    );

    // Manual Refresh Handler
    const onRefresh = () => {
        setRefreshing(true);
        fetchActiveBookings(true);
    };

    const handleCall = (phone?: string) => {
        if (phone) Linking.openURL(`tel:${phone}`);
        else Alert.alert("No Contact", "Provider phone number not available.");
    };

    const handleCancel = async (bookingId: string) => {
        Alert.alert("Cancel Booking", "Are you sure?", [
            { text: "No", style: "cancel" },
            {
                text: "Yes, Cancel",
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await getToken();
                        await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel-by-user`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        fetchActiveBookings(true); // Refresh
                    } catch (e) { Alert.alert("Error", "Failed to cancel"); }
                }
            }
        ]);
    };

    const handleChat = (id: string) => {
        // router.push(`/chat/${id}`);
        Alert.alert("Chat", "Opening chat...");
    };

    const handleApproveQuote = async (bookingId: string) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/approve-quote`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to approve quote.');
            Alert.alert('Quote Approved', 'The garage has been notified.');
            fetchActiveBookings(true);
        } catch (error: any) {
            Alert.alert('Approval Error', error.message || 'Failed to approve quote.');
        }
    };

    const handleRejectQuote = async (bookingId: string) => {
        Alert.alert('Reject Quote', 'Reject this quote and ask garage to update it?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Reject',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await getToken();
                        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/reject-quote`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reason: 'Please revise the quote.' }),
                        });
                        const data = await response.json().catch(() => ({}));
                        if (!response.ok) throw new Error(data.error || 'Failed to reject quote.');
                        Alert.alert('Quote Rejected', 'The garage has been asked to revise the quote.');
                        fetchActiveBookings(true);
                    } catch (error: any) {
                        Alert.alert('Rejection Error', error.message || 'Failed to reject quote.');
                    }
                }
            }
        ]);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Orders</Text>
            </View>

            {loading && bookings.length === 0 ? (
                <View style={styles.centered}>
                    <RotatingLoader size={40} color="#005C70" />
                </View>
            ) : error ? (
                <EmptyState
                    title="Something Went Wrong"
                    message={error}
                    iconName="alert-circle-outline"
                    actionLabel="Try Again"
                    onAction={() => fetchActiveBookings(false)}
                />
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <OrderCard
                            booking={item}
                            onCancel={handleCancel}
                            onCall={() => handleCall(item.garage?.contactPhone || item.towTruck?.contactPhone)}
                            onChat={handleChat}
                            onApproveQuote={handleApproveQuote}
                            onRejectQuote={handleRejectQuote}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <EmptyState
                            title="No Active Orders"
                            message="You don't have any ongoing services at the moment."
                            iconName="clipboard-outline"
                        />
                    }

                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e0e0e0', // Light Gray Background
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 34,
        color: '#005C70',
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
    // Card Styles
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005C70',
    },
    statusPill: {
        backgroundColor: '#005C70',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 15,
    },
    providerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E0F2F1', // Light teal background
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    providerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    timingContainer: {
        marginBottom: 20,
    },
    timingBox: {
        backgroundColor: '#F5F5F5', // Very light gray (almost white) for slight contrast against white card, or keep #e0e0e0 but cleaner
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    timingLabel: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    timingValue: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    otpContainer: {
        backgroundColor: '#E1F5FE', // Very Light Blue
        borderRadius: 15,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 10,
    },
    otpCode: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 8,
    },
    otpHelperText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 12,
        marginBottom: 20,
    },
    quoteBox: {
        backgroundColor: '#fff8e1',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ffe082',
    },
    quoteTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8a6d3b',
        marginBottom: 6,
    },
    quoteText: {
        fontSize: 13,
        color: '#5f5f5f',
        marginBottom: 4,
    },
    quoteAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#005C70',
        marginBottom: 8,
    },
    quoteButtonsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    quoteActionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    rejectQuoteButton: {
        backgroundColor: '#ef5350',
    },
    approveQuoteButton: {
        backgroundColor: '#2e7d32',
    },
    quoteActionText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 12,
        flex: 1,
    },
    callButton: {
        backgroundColor: '#74B768', // Green
    },
    chatButton: {
        backgroundColor: '#005C70', // Teal
    },
    cancelButton: {
        backgroundColor: '#FF7F50', // Orange
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
