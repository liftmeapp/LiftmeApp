import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import io from "socket.io-client";

// --- CONFIGURATION ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// --- NOTIFICATION HANDLER ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,  // Add this line
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

const BookingCard = ({ booking, onAccept, onDecline, onCancel, onPress, onComplete, onOpenQuoteModal, onOpenFinalQuoteModal, onChat, isAccepting, isDeclining = false, garageLocation, currentTab }: { booking: any, onAccept: (booking: any) => void, onDecline: (id: string) => void, onCancel: (id: string) => void, onPress: (booking: any) => void, onComplete: (id: string) => void, onOpenQuoteModal: (booking: any) => void, onOpenFinalQuoteModal: (booking: any) => void, onChat: (bookingId: string) => void, isAccepting: boolean, isDeclining?: boolean, garageLocation?: any, currentTab: 'Pending' | 'Current' | 'History' }) => {
    const getBadge = () => {
        if (booking.bookingType === 'TOW_TO_GARAGE') {
            if (booking.subStatus === 'AWAITING_TOW_TRUCK_ACCEPTANCE') {
                return <View style={[styles.badge, styles.badgeWaiting]}><Text style={styles.badgeText}>VEHICLE INCOMING</Text></View>;
            }
            if (booking.subStatus === 'AWAITING_GARAGE_QUOTE') {
                return <View style={[styles.badge, styles.badgeReceived]}><Text style={styles.badgeText}>VEHICLE RECEIVED</Text></View>;
            }
             if (booking.subStatus === 'AWAITING_QUOTE_APPROVAL') {
                return <View style={[styles.badge, styles.badgeWaiting]}><Text style={styles.badgeText}>QUOTE PENDING</Text></View>;
            }
            if (booking.subStatus === 'QUOTE_REJECTED') {
                return <View style={[styles.badge, styles.badgeRejected]}><Text style={styles.badgeText}>EST. REJECTED</Text></View>;
            }
        }
        return null;
    };

    const showCompleteButton =
        (booking.status === 'CONFIRMED' && booking.bookingType !== 'TOW_TO_GARAGE') ||
        (booking.status === 'IN_PROGRESS' && booking.subStatus === 'SERVICE_IN_PROGRESS');

        const showSubmitQuoteButton = 
            booking.bookingType === 'TOW_TO_GARAGE' &&
            booking.status === 'IN_PROGRESS' &&
            (booking.subStatus === 'AWAITING_GARAGE_QUOTE' || booking.subStatus === 'QUOTE_REJECTED');

        const showSubmitFinalQuoteButton = 
            booking.bookingType === 'TOW_TO_GARAGE' &&
            booking.status === 'IN_PROGRESS' &&
            booking.subStatus === 'SERVICE_IN_PROGRESS' &&
            !booking.finalEstimateAmount;

    const showChatButton = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status);

    const showCurrentTabActions =
        currentTab === 'Current' &&
        (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') &&
        (booking.bookingType !== 'TOW_TO_GARAGE' ||
            (booking.bookingType === 'TOW_TO_GARAGE' &&
                (booking.subStatus === 'AWAITING_QUOTE_APPROVAL' ||
                (booking.subStatus === 'SERVICE_IN_PROGRESS' && !!booking.finalEstimateAmount))
            )
        );


    return (
    <View style={styles.bookingCard}>
        {getBadge()}
        <View style={styles.bookingHeader}>
            <Text style={styles.bookingDate}>{new Date(booking.bookedAt).toLocaleDateString()}</Text>
            <Text style={styles.bookingPrice}>INR {booking.finalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="build" size={20} color="#3498db" />
            <Text style={styles.bookingText}>{booking.service?.name || 'Tow-to-Garage Service'}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="person-circle" size={20} color="#9b55b6" />
            <Text style={styles.bookingText}>{booking.user.firstName} {booking.user.lastName}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="car" size={20} color="#E67E22" />
            <Text style={styles.bookingText}>{booking.vehicle.brand} {booking.vehicle.name} ({booking.vehicle.plateNumber})</Text>
        </View>

        {booking.bookingType === 'TOW_TO_GARAGE' && booking.pickupLocation?.description ? (
            <View style={[styles.bookingDetails, { backgroundColor: '#fff0f0', padding: 5, borderRadius: 5, marginTop: 5 }]}>
                <Ionicons name="navigate-circle-outline" size={20} color="#c0392b" />
                <Text style={[styles.bookingText, {color: '#c0392b', fontWeight: 'bold', flexShrink: 1}]}>TOW-IN FROM: {booking.pickupLocation.description}</Text>
            </View>
        ) : booking.pickupLocation?.description && (
             <View style={[styles.bookingDetails, { backgroundColor: '#eaf5ff', padding: 5, borderRadius: 5, marginTop: 5 }]}>
                <Ionicons name="location-outline" size={20} color="#3498db" />
                <Text style={[styles.bookingText, {color: '#2980b9', fontWeight: 'bold', flexShrink: 1}]}>LOCATION: {booking.pickupLocation.description}</Text>
            </View>
        )}

        {booking.subStatus === 'QUOTE_REJECTED' && booking.quoteRejectionReason && (
            <View style={[styles.bookingDetails, { backgroundColor: '#ffebee', padding: 10, borderRadius: 5, marginTop: 5 }]}>
                <Ionicons name="information-circle-outline" size={20} color="#c62828" />
                <Text style={[styles.bookingText, {color: '#c62828', fontWeight: 'bold', flexShrink: 1}]}>Reason: {booking.quoteRejectionReason}</Text>
            </View>
        )}

        {booking.distance != null && (
             <View style={styles.bookingDetails}>
                <Ionicons name="map-outline" size={20} color="#16a085" />
                <Text style={styles.bookingText}>~{booking.distance.toFixed(1)} km away</Text>
            </View>
        )}

        {booking.pickupLocation?.coordinates && garageLocation?.coordinates && currentTab !== 'History' && (
            <TouchableOpacity
                style={styles.checkMapButton}
                onPress={() => {
                    const origin = garageLocation;
                    const destination = booking.pickupLocation;
                    if (origin?.coordinates && destination?.coordinates) {
                        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.coordinates[1]},${origin.coordinates[0]}&destination=${destination.coordinates[1]},${destination.coordinates[0]}`;
                        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
                    } else {
                        Alert.alert("Map Error", "Could not open map because location data is incomplete.");
                    }
                }}
            >
                <Ionicons name="map-outline" size={18} color="#fff" />
                <Text style={styles.checkMapButtonText}>Check Route</Text>
            </TouchableOpacity>
        )}

        {showCurrentTabActions && (
            <View style={styles.buttonRow}>
                <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => onCancel(booking.id)}
                >
                    <Ionicons name="close-circle-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.actionButton, styles.chatButton]}
                    onPress={() => onChat(booking.id)}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Chat</Text>
                </TouchableOpacity>
                
                {((booking.bookingType !== 'TOW_TO_GARAGE') || (booking.subStatus === 'SERVICE_IN_PROGRESS' && !!booking.finalEstimateAmount)) && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => onComplete(booking.id)}
                    >
                        <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Complete</Text>
                    </TouchableOpacity>
                )}
            </View>
        )}

        {showSubmitQuoteButton && (
            <View style={styles.buttonRow}>
                <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => onCancel(booking.id)}
                >
                    <Ionicons name="close-circle-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.actionButton, styles.chatButton]}
                    onPress={() => onChat(booking.id)}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]} // Using acceptButton style for green color
                    onPress={() => onOpenQuoteModal(booking)}
                >
                    <Ionicons name="document-text-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>{booking.subStatus === 'QUOTE_REJECTED' ? 'Resubmit Quote' : 'Job Estimate'}</Text>
                </TouchableOpacity>
            </View>
        )}

        {showSubmitFinalQuoteButton && (
            <View style={styles.buttonRow}>
                 <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => onCancel(booking.id)}
                >
                    <Ionicons name="close-circle-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.actionButton, styles.chatButton]}
                    onPress={() => onChat(booking.id)}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]} // Using acceptButton style for green color
                    onPress={() => onOpenFinalQuoteModal(booking)} // We need a new modal handler for this
                >
                    <Ionicons name="document-text-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Submit Final Price</Text>
                </TouchableOpacity>
            </View>
        )}

        {booking.status === 'SEARCHING' && (booking.subStatus === 'AWAITING_GARAGE_ACCEPTANCE' || !booking.subStatus) && (
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
                    style={[styles.bookingButton, styles.acceptButton, isAccepting && styles.disabledButton]} 
                    onPress={() => onAccept(booking)}
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
    </View>
    );
};

const OtpVerificationModal = ({ visible, onClose, otp, setOtp, onVerify, isVerifying }: any) => (
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

const QuoteModal = ({ visible, onClose, vehicleStatus, setVehicleStatus, servicesRequired, setServicesRequired, servicesEstimate, setServicesEstimate, jobEstimate, setJobEstimate, notes, setNotes, onSubmit, isSubmitting }: any) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={modalStyles.modalTitle}>Job Estimate</Text>
                        <Text style={modalStyles.modalSubtitle}>Enter Initial estiamtes after diagnosis. The customer will be notified to approve and pay.</Text>
                        
                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Vehicle Status"
                            value={vehicleStatus}
                            onChangeText={setVehicleStatus}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={[modalStyles.quoteInput, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Service Required"
                            multiline
                            blurOnSubmit={true}
                            value={servicesRequired}
                            onChangeText={setServicesRequired}
                        />
                        <TextInput
                            style={[modalStyles.quoteInput, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Services Estimate(e.g., Parts: INR 5000, Labor: INR 3000)"
                            multiline
                            blurOnSubmit={true}
                            value={servicesEstimate}
                            onChangeText={setServicesEstimate}
                        />
                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Job Estimate(Total Amount in INR)"
                            keyboardType="numeric"
                            value={jobEstimate}
                            onChangeText={setJobEstimate}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Notes for customer (Est Days)"
                            value={notes}
                            onChangeText={setNotes}
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />

                        <TouchableOpacity 
                            style={[styles.bookingButton, styles.acceptButton, isSubmitting && styles.disabledButton]} 
                            onPress={onSubmit} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting 
                                ? <ActivityIndicator color="#fff" /> 
                                : <Text style={styles.bookingButtonText}>Job Estimate for Customer</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginTop: 10}} onPress={onClose}>
                            <Text style={{textAlign: 'center', color: '#7f8c8d'}}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
);


const FinalQuoteModal = ({ visible, onClose, jobEstimate, setJobEstimate, notes, setNotes, onSubmit, isSubmitting }: any) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={modalStyles.modalTitle}>Submit Final Amount</Text>
                        <Text style={modalStyles.modalSubtitle}>Enter the final amount for the service. The customer will be notified to approve and pay.</Text>
                        
                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Final Job Amount (Total Amount in INR)"
                            keyboardType="numeric"
                            value={jobEstimate}
                            onChangeText={setJobEstimate}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Final notes for customer"
                            value={notes}
                            onChangeText={setNotes}
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />

                        <TouchableOpacity 
                            style={[styles.bookingButton, styles.acceptButton, isSubmitting && styles.disabledButton]} 
                            onPress={onSubmit} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting 
                                ? <ActivityIndicator color="#fff" /> 
                                : <Text style={styles.bookingButtonText}>Submit Final Price</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginTop: 10}} onPress={onClose}>
                            <Text style={{textAlign: 'center', color: '#7f8c8d'}}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
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
    
    // State for the main tabs: Jobs or Profile
    const [mainTab, setMainTab] = useState<'Jobs' | 'Profile'>('Jobs');
    // State for the sub-tabs within Jobs
    const [jobsSubTab, setJobsSubTab] = useState<'Pending' | 'Current' | 'History'>('Pending');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

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
            console.log('[handleChat] Navigation command issued.');
    
        } catch (error: any) {
            console.error('[handleChat] CATCH block error:', error);
            Alert.alert("Chat Error", error.message);
        }
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
                    <InfoRow icon="build-outline" label="Service" value={booking.service?.name || 'Tow-to-Garage Service'} />
                    {booking.distance != null && <InfoRow icon="map-outline" label="Distance" value={`~${booking.distance.toFixed(1)} km`} />}
                    <InfoRow icon="cash-outline" label="Amount" value={`INR ${booking.finalAmount.toFixed(2)}`} />
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
        if (!isManualRefresh) {
            setLoading(true);
        }
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed.");

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

        } catch (error: any) {
            console.error("--- FULL DATA FETCH ERROR OBJECT ---", error);
        } finally {
            if (isManualRefresh) {
                setRefreshing(false);
            }
            setLoading(false);
        }
    }, [garageId, jobsSubTab]);

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

            // Show alert for immediate feedback
            Alert.alert(title, body);

            // Schedule a local notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: title,
                    body: body,
                    data: { bookingId: newBooking.id, type: type },
                },
                trigger: null, // Show immediately
            });

            fetchData();
        };

        socket.on('new_booking', (newBooking: any) => handleNewBooking(newBooking, 'new_booking'));
        socket.on('new_tow_in_request', (newBooking: any) => handleNewBooking(newBooking, 'new_tow_in_request'));


        socket.on('payment_confirmed', (data: { bookingId: string }) => {
            console.log(`💳 [Socket.IO] Payment confirmed for booking ${data.bookingId}`);
            Alert.alert(
                "Payment Confirmed",
                `The customer has paid. The job is confirmed and moved to 'Current'.`
            );
            fetchData();
        });

        socket.on('booking_confirmed_by_user', (data: { bookingId: string }) => {
            console.log(`🤝 [Socket.IO] Booking confirmed (Cash) for ${data.bookingId}`);
            Alert.alert(
                "Booking Confirmed (Cash)",
                `The customer has confirmed a cash payment. The job is in your 'Current' list.`
            );
            fetchData();
        });

        socket.on('tow_truck_assigned', (data: { bookingId: string; towTruck: any }) => {
            console.log(`🚚 [Socket.IO] Tow truck assigned for booking ${data.bookingId}:`, data.towTruck);
            Alert.alert(
                "Tow Truck Assigned!",
                `A tow truck is on the way for one of your accepted tow-in jobs. The job has been moved to your 'Current' list.`
            );
            fetchData(); // Refresh data to update the booking's status
        });

        socket.on('vehicle_delivered', (data: { bookingId: string }) => {
            console.log(`📦 [Socket.IO] Vehicle delivered for booking ${data.bookingId}`);
            Alert.alert(
                "Vehicle Delivered!",
                `A vehicle has been successfully delivered to your garage.`
            );
            fetchData(); // Refresh data to update the booking's status
        });

        socket.on('quote_rejected_by_customer', (data: { bookingId: string; reason: string }) => {
            console.log(`❌ [Socket.IO] Quote for booking ${data.bookingId} rejected by customer: ${data.reason}`);
            Alert.alert("Quote Rejected", `A customer has rejected your quote. The booking has been cancelled.`);
            fetchData();
        });

        socket.on('quote_rejected_by_customer', (data: { bookingId: string; reason: string }) => {
            console.log(`❌ [Socket.IO] Quote for booking ${data.bookingId} rejected by customer: ${data.reason}`);
            Alert.alert("Quote Rejected", `A customer has rejected your quote. Reason: ${data.reason}`);
            fetchData();
        });

        socket.on('booking_cancelled_by_customer', (data: { bookingId: string; reason: string }) => {
            console.log(`❌ [Socket.IO] Booking ${data.bookingId} cancelled by customer: ${data.reason}`);
            Alert.alert("Booking Cancelled", `A booking has been cancelled by the customer.`);
            fetchData(); // Refresh data to update the booking list
        });

        socket.on('disconnect', (reason : any) => {
            console.log(`--- [Socket.IO] Disconnected: ${reason} ---`);
        });

        return () => {
            console.log("--- [Socket.IO] Disconnecting socket... ---");
            socket.disconnect();
        };
    }, [garageId, fetchData]);

    useEffect(() => {
        if (garageId) {
            registerForPushNotificationsAsync(garageId, 'garage', getToken);
        }
        fetchData(); // Fetch immediately on mount/tab change
    }, [fetchData, garageId]); 
        
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
        setSupportedVehicleTypes(garage.supportedVehicleTypes || []);
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
            router.replace('../settings');
        } catch (error: any) {
            Alert.alert("Deletion Error", error.message);
        }
    };

    const handleAccept = async (booking: any) => {
        if (!booking || !booking.id) return;
        const { id: bookingId, bookingType } = booking;

        console.log(`[handleAccept] Attempting to accept booking: ${bookingId} of type ${bookingType}`);
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

            const result = await response.json();
            const alertMessage = result.message || 'Request accepted successfully!';
            Alert.alert('Success', alertMessage);

            fetchData();
        } catch (error: any) {
            console.error("Acceptance Error:", error);
            Alert.alert(`Error: ${error.message}`);
        } finally {
            setAcceptingId(null);
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
                        const reason = "Service cancelled by garage."; // Default reason
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
        if (jobsSubTab === 'Pending') {
            return b.status === 'SEARCHING' && (b.subStatus === 'AWAITING_GARAGE_ACCEPTANCE' || !b.subStatus);
        }
        if (jobsSubTab === 'Current') {
            return (
                (b.status === 'SEARCHING' && b.subStatus === 'AWAITING_TOW_TRUCK_ACCEPTANCE') ||
                b.status === 'AWAITING_PAYMENT' ||
                b.status === 'CONFIRMED' ||
                (b.status === 'IN_PROGRESS' && (b.subStatus === 'AWAITING_GARAGE_QUOTE' || b.subStatus === 'AWAITING_QUOTE_APPROVAL' || b.subStatus === 'SERVICE_IN_PROGRESS'))
            );
        }
        if (jobsSubTab === 'History') {
            return ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(b.status);
        }
        return false;
    });
    
    if (loading && !garage) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#b95528" /></View>;
    }

    if (!garage) {
        return <View style={styles.centered}><Text style={styles.errorText}>Could not load your garage data.</Text></View>;
    }

    return (
        <View style={styles.container}>
            
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
                        
                        
                        {loading ? (
                            <View style={styles.centeredTabContent}>
                                <ActivityIndicator size="large" color="#b95528" />
                            </View>
                        ) : filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => 
                            <BookingCard 
                                key={booking.id} 
                                booking={booking} 
                                onAccept={handleAccept} 
                                onDecline={handleDecline} 
                                onCancel={handleCancel}
                                onComplete={handleOpenOtpModal}
                                onOpenQuoteModal={handleOpenQuoteModal}
                                onOpenFinalQuoteModal={handleOpenFinalQuoteModal}
                                onChat={handleChat}
                                onPress={(b) => { setSelectedBooking(b); setIsModalVisible(true); }}
                                isAccepting={acceptingId === booking.id}
                                garageLocation={garage?.location}
                                currentTab={jobsSubTab}
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
                                        {serviceItem.service.category !== 'INGARAGE_CAR' && serviceItem.service.category !== 'INGARAGE_BIKE' &&
                                            <Text style={styles.servicePrice}>INR {serviceItem.price.toFixed(2)}</Text>
                                        }
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#34495e' },
    closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
    modalSubtitle: { fontSize: 15, color: '#7f8c8d', textAlign: 'center', marginBottom: 20 },
    otpInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 15,
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 10,
        marginBottom: 20,
        width: '100%',
        height: 60,
    },
    quoteInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, color: '#e74c3c', textAlign: 'center' },
    headerCard: {
        backgroundColor: '#fff', marginHorizontal: 15,marginTop:39,marginBottom:3, borderRadius: 16, padding: 20, alignItems: 'center',
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
    editButton: { backgroundColor: '#3498db' },
    deleteButton: { backgroundColor: '#e74c3c' },
    bookingsHeader: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 15, marginTop: 20, textAlign: 'left', color: '#34495e' },
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
    bookingButton: { 
        paddingVertical: 12, 
        paddingHorizontal: 24, 
        borderRadius: 8, 
        marginLeft: 10,
        minHeight: 50,
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
        padding: 5,
        marginTop: 0,
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
    centeredTabContent: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -1,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    badgeWaiting: {
        backgroundColor: '#f39c12', // Orange for waiting
    },
    badgeReceived: {
        backgroundColor: '#27ae60', // Green for received
    },
    badgeRejected: {
        backgroundColor: '#c0392b', // Red for rejected
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
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
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 6,
        minHeight: 36,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
});
