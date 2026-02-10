import RotatingLoader from '@/components/RotatingLoader';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, NativeModules, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// --- Reusable Components ---
const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);

type SavedCard = {
    id: string;
    status?: string;
    card?: {
        last4?: string;
        network?: string;
        expiryMonth?: string | number;
        expiryYear?: string | number;
    };
};

const CustomerCardsCard = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const getTokenRef = useRef(getToken);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [cards, setCards] = useState<SavedCard[]>([]);

    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    const fetchCards = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await getTokenRef.current();
            const response = await fetch(`${API_BASE_URL}/api/razorpay/customer-cards`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not load saved cards.');
            setCards(Array.isArray(data.cards) ? data.cards : []);
        } catch (error) {
            console.error(error);
            setCards([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchCards(); }, [fetchCards]));

    const handleAddCard = async () => {
        setIsAddingCard(true);
        try {
            if (Platform.OS === 'web') {
                throw new Error('Card setup is available only in Android/iOS app builds.');
            }
            const hasNativeRazorpay = !!(NativeModules as any)?.RNRazorpayCheckout;
            if (!hasNativeRazorpay || !RazorpayCheckout || typeof (RazorpayCheckout as any).open !== 'function') {
                throw new Error('Razorpay module is not available in this build. Please use a native dev/production build.');
            }

            const token = await getTokenRef.current();
            const setupOrderRes = await fetch(`${API_BASE_URL}/api/razorpay/create-card-setup-order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const setupOrderData = await setupOrderRes.json();
            if (!setupOrderRes.ok) throw new Error(setupOrderData.error || 'Failed to start card setup.');

            const paymentResult = await RazorpayCheckout.open({
                description: 'Card setup verification',
                image: 'https://avvvkshlpvbogjushmsc.supabase.co/storage/v1/object/public/profile-pictures/icon.png',
                currency: setupOrderData.currency,
                key: setupOrderData.key,
                amount: setupOrderData.amount,
                name: 'Afthu Lift Me',
                order_id: setupOrderData.orderId,
                customer_id: setupOrderData.customerId || undefined,
                save: 1,
                prefill: {
                    email: user?.emailAddresses?.[0]?.emailAddress,
                    contact: user?.phoneNumbers?.[0]?.phoneNumber,
                    name: user?.fullName || ''
                },
                notes: { purpose: 'card_setup' },
                theme: { color: '#005C70' }
            });

            const confirmRes = await fetch(`${API_BASE_URL}/api/razorpay/confirm-card-setup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId: setupOrderData.orderId,
                    paymentId: paymentResult.razorpay_payment_id,
                    signature: paymentResult.razorpay_signature,
                })
            });
            const confirmData = await confirmRes.json().catch(() => ({}));
            if (!confirmRes.ok) throw new Error(confirmData.error || 'Card setup verification failed.');

            Alert.alert('Card Added', 'Your card has been saved.');
            fetchCards();
        } catch (error: any) {
            if (error?.code === 'PAYMENT_CANCELLED') return;
            const rawMessage = error?.description || error?.message || '';
            if (typeof rawMessage === 'string' && rawMessage.toLowerCase().includes("cannot read property 'open' of null")) {
                Alert.alert(
                    'Card Setup Error',
                    'Razorpay native module is missing in this build. Use an Android/iOS native dev build (not Expo Go) and rebuild the app.'
                );
                return;
            }
            Alert.alert('Card Setup Error', rawMessage || 'Could not add card.');
        } finally {
            setIsAddingCard(false);
        }
    };

    return (
        <Card title="Customer Cards">
            <Text style={styles.infoText}>Add your card here and use it during booking payment.</Text>
            {isLoading ? (
                <View style={{ paddingVertical: 8 }}>
                    <RotatingLoader size={24} color="#005C70" />
                </View>
            ) : cards.length > 0 ? (
                <View style={{ marginTop: 6 }}>
                    {cards.map((savedCard) => (
                        <View key={savedCard.id} style={styles.savedCardRow}>
                            <Ionicons name="card-outline" size={20} color="#005C70" />
                            <View style={{ marginLeft: 10, flex: 1 }}>
                                <Text style={styles.savedCardTitle}>
                                    {(savedCard.card?.network || 'CARD').toUpperCase()} ending in {savedCard.card?.last4 || 'XXXX'}
                                </Text>
                                <Text style={styles.savedCardMeta}>
                                    Expires {savedCard.card?.expiryMonth || '--'}/{savedCard.card?.expiryYear || '--'} {savedCard.status ? ` • ${savedCard.status}` : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.infoText}>No saved cards yet.</Text>
            )}
            <TouchableOpacity style={styles.connectButton} onPress={handleAddCard} disabled={isAddingCard}>
                {isAddingCard ? <ActivityIndicator color="#fff" /> : <Text style={styles.connectButtonText}>Add New Card</Text>}
            </TouchableOpacity>
        </Card>
    );
};

const RazorpayConnectCard = ({ business, businessType }: { business: any, businessType: 'garage' | 'tow-truck' }) => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const getTokenRef = useRef(getToken);
    const [isConnecting, setIsConnecting] = useState(false);
    const [detailedBusiness, setDetailedBusiness] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [method, setMethod] = useState<'bank' | 'upi'>('bank');
    const [name, setName] = useState(user?.fullName || '');
    const [email] = useState(user?.emailAddresses[0]?.emailAddress || '');
    const [contact] = useState(user?.phoneNumbers[0]?.phoneNumber || '');
    const [ifsc, setIfsc] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [vpa, setVpa] = useState('');

    const apiPath = businessType === 'garage' ? 'garages' : 'tow-trucks';

    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    const fetchDetailedBusiness = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await getTokenRef.current();
            const response = await fetch(`${API_BASE_URL}/api/${apiPath}/${business.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Could not load business details.");
            setDetailedBusiness(await response.json());
        } catch (error: any) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [business.id, apiPath]);

    useFocusEffect(useCallback(() => { fetchDetailedBusiness(); }, [fetchDetailedBusiness]));

    const handleConnect = async () => {
        if (method === 'bank' && (!ifsc || !accountNumber)) {
            Alert.alert("Error", "Please enter IFSC and Account Number.");
            return;
        }
        if (method === 'upi' && !vpa) {
            Alert.alert("Error", "Please enter UPI ID.");
            return;
        }

        setIsConnecting(true);
        try {
            const token = await getTokenRef.current();
            const accountDetails = method === 'bank'
                ? { name, email, contact, ifsc, accountNumber }
                : { name, email, contact, vpa };

            const response = await fetch(`${API_BASE_URL}/api/razorpay/create-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    businessType,
                    businessId: business.id,
                    accountDetails
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to link account.");
            }

            Alert.alert("Success", "Payout account linked successfully!");
            fetchDetailedBusiness();

        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        Alert.alert(
            "Disconnect Account",
            "Are you sure you want to disconnect your payout account?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Disconnect", style: "destructive", onPress: performDisconnect }
            ]
        );
    };

    const performDisconnect = async () => {
        setIsConnecting(true);
        try {
            const token = await getTokenRef.current();
            const response = await fetch(`${API_BASE_URL}/api/razorpay/disconnect-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ businessType }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to disconnect account.");
            }
            Alert.alert("Success", "Account disconnected.");
            fetchDetailedBusiness();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    if (isLoading) return <RotatingLoader size={50} color="#b95528" />;

    // Check if connected (razorpayAccountId exists)
    // Note: The backend response for garage/towTruck should include razorpayAccountId
    const isConnected = !!detailedBusiness?.razorpayAccountId;

    return (
        <Card title={`${business.name} - Payout Settings`}>
            {isConnected ? (
                <>
                    <View style={styles.statusContainer}>
                        <Ionicons name="shield-checkmark" size={24} color="#27ae60" />
                        <Text style={styles.statusText}>Payout Account Linked</Text>
                    </View>
                    <Text style={styles.infoText}>Account ID: {detailedBusiness.razorpayAccountId}</Text>
                    <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect} disabled={isConnecting}>
                        {isConnecting ? <RotatingLoader size={10} color="#fff" /> : <Text style={styles.disconnectButtonText}>Disconnect</Text>}
                    </TouchableOpacity>
                </>
            ) : (
                <View>
                    <Text style={styles.infoText}>Link your bank account or UPI to receive payouts.</Text>

                    <View style={styles.tabs}>
                        <TouchableOpacity style={[styles.tab, method === 'bank' && styles.activeTab]} onPress={() => setMethod('bank')}>
                            <Text style={[styles.tabText, method === 'bank' && styles.activeTabText]}>Bank Account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, method === 'upi' && styles.activeTab]} onPress={() => setMethod('upi')}>
                            <Text style={[styles.tabText, method === 'upi' && styles.activeTabText]}>UPI ID</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput style={styles.input} placeholder="Account Holder Name" value={name || ''} onChangeText={setName} />
                    {method === 'bank' ? (
                        <>
                            <TextInput style={styles.input} placeholder="IFSC Code" value={ifsc} onChangeText={setIfsc} autoCapitalize="characters" />
                            <TextInput style={styles.input} placeholder="Account Number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="numeric" />
                        </>
                    ) : (
                        <TextInput style={styles.input} placeholder="UPI ID (e.g. name@upi)" value={vpa} onChangeText={setVpa} autoCapitalize="none" />
                    )}

                    <TouchableOpacity style={styles.connectButton} onPress={handleConnect} disabled={isConnecting}>
                        {isConnecting ? <RotatingLoader size={20} color="#fff" /> : <Text style={styles.connectButtonText}>Link Account</Text>}
                    </TouchableOpacity>
                </View>
            )}
        </Card>
    );
};

// --- Main Payment Screen ---
export default function PaymentSettingsScreen() {
    const { getToken } = useAuth();
    const getTokenRef = useRef(getToken);

    const [loading, setLoading] = useState(true);
    const [userBusiness, setUserBusiness] = useState<any>(null);

    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getTokenRef.current();
            if (!token) throw new Error("Authentication failed.");

            const businessRes = await fetch(`${API_BASE_URL}/api/users/my-business`, { headers: { 'Authorization': `Bearer ${token}` } });

            if (businessRes.status === 404) {
                setUserBusiness(null);
            } else if (businessRes.ok) {
                setUserBusiness(await businessRes.json());
            } else {
                throw new Error("Could not load your business information.");
            }

        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    if (loading) {
        return <View style={styles.centered}><RotatingLoader size={50} color="#b95528" /></View>;
    }

    const verifiedGarage = userBusiness?.garage?.status === 'APPROVED' ? userBusiness.garage : null;
    const verifiedTowTruck = userBusiness?.towTruck?.status === 'APPROVED' ? userBusiness.towTruck : null;
    const hasVerifiedBusiness = !!(verifiedGarage || verifiedTowTruck);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Payments</Text>
            </View>

            <CustomerCardsCard />

            {/* --- SELLER SECTION --- */}
            {verifiedGarage && <RazorpayConnectCard business={verifiedGarage} businessType="garage" />}
            {verifiedTowTruck && <RazorpayConnectCard business={verifiedTowTruck} businessType="tow-truck" />}

            {!hasVerifiedBusiness && (
                <Card title="Business Payments">
                    <Text style={styles.infoText}>
                        Payout settings are available after your garage or tow truck is created and approved.
                    </Text>
                </Card>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 40 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    card: {
        backgroundColor: '#fff', margin: 15, borderRadius: 12, padding: 20,
        elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#34495e', marginBottom: 15, borderBottomWidth: 1, paddingBottom: 10, borderBottomColor: '#f0f0f0' },
    infoText: { fontSize: 15, color: '#7f8c8d', lineHeight: 22, marginVertical: 10 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 15, borderRadius: 8, marginBottom: 10 },
    statusText: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', marginLeft: 10 },
    connectButton: {
        backgroundColor: '#635BFF', paddingVertical: 15,
        borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 15
    },
    connectButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disconnectButton: {
        backgroundColor: '#f1f1f1', borderColor: '#e0e0e0', borderWidth: 1, paddingVertical: 12,
        borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 15,
    },
    disconnectButtonText: { color: '#c0392b', fontSize: 16, fontWeight: 'bold' },

    // Tabs and Inputs
    tabs: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#635BFF' },
    tabText: { fontSize: 16, color: '#999' },
    activeTabText: { color: '#635BFF', fontWeight: 'bold' },
    input: {
        backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16
    },
    comingSoonContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    comingSoonTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#005C70',
        marginTop: 15,
        marginBottom: 10,
        textAlign: 'center',
    },
    comingSoonText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    savedCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef5f7',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    savedCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2d3d',
    },
    savedCardMeta: {
        marginTop: 2,
        fontSize: 12,
        color: '#657786',
    },
});
