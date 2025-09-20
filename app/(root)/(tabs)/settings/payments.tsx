import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, FlatList, Linking } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { CardField, useConfirmSetupIntent } from '@stripe/stripe-react-native';
import RotatingLoader from '@/components/RotatingLoader';
import * as WebBrowser from 'expo-web-browser';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// --- Reusable Components ---
const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);

const StripeConnectCard = ({ business, businessType }: { business: any, businessType: 'garage' | 'tow-truck' }) => {
    const { getToken } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [detailedBusiness, setDetailedBusiness] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const apiPath = businessType === 'garage' ? 'garages' : 'tow-trucks';

    const fetchDetailedBusiness = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/${apiPath}/${business.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Could not load business details.");
            setDetailedBusiness(await response.json());
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [getToken, business.id, apiPath]);
    
    useFocusEffect(useCallback(() => { fetchDetailedBusiness(); }, [fetchDetailedBusiness]));
    
    const handleConnectStripe = async () => {
        console.log(`--- [StripeConnect] Attempting to connect for ${businessType} with ID: ${business.id} ---`);
        setIsConnecting(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/stripe/create-connect-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                // FIX: Pass the businessId along with the businessType
                body: JSON.stringify({ 
                    businessType: businessType,
                    businessId: business.id // This is the crucial missing piece
                }),
            });

            // Add detailed error logging
            if (!response.ok) {
                const errorText = await response.text();
                console.error("🔴 [StripeConnect] API Error Response:", errorText);
                let errorJson;
                try {
                    errorJson = JSON.parse(errorText);
                } catch (e) {
                    throw new Error("Failed to connect to Stripe. Server returned an invalid response.");
                }
                throw new Error(errorJson.error || "Failed to create Stripe connection link.");
            }
            
            const data = await response.json();
            console.log("✅ [StripeConnect] Successfully received onboarding URL. Opening WebBrowser...");
            await WebBrowser.openBrowserAsync(data.url);

        } catch (error: any) {
            console.error("🔴 [StripeConnect] CATCH BLOCK ERROR:", error.message);
            Alert.alert("Error", error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        Alert.alert(
            "Disconnect Stripe",
            "Are you sure you want to disconnect your Stripe account? You will stop receiving payouts until you reconnect.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Disconnect", style: "destructive", onPress: performDisconnect }
            ]
        );
    };

    const performDisconnect = async () => {
        setIsConnecting(true); // Reuse the loading state
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/stripe/disconnect-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ businessType }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to disconnect account.");
            }
            Alert.alert("Success", "Your Stripe account has been disconnected.");
            fetchDetailedBusiness(); // Refresh this component's data
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <Card title={`${business.name} - Payouts`}>
            {isLoading ? <RotatingLoader size={50} color="#b95528" />
            : detailedBusiness?.stripeAccountId ? (
                <>
                    <View style={styles.statusContainer}>
                        <Ionicons name="shield-checkmark" size={24} color="#27ae60" />
                        <Text style={styles.statusText}>Payout Account Connected</Text>
                    </View>
                    <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect} disabled={isConnecting}>
                        {isConnecting ? <RotatingLoader size={10} color="#fff" /> : <Text style={styles.disconnectButtonText}>Disconnect</Text>}
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.infoText}>Connect with Stripe to receive payments to your bank account.</Text>
                    <TouchableOpacity style={styles.connectButton} onPress={handleConnectStripe} disabled={isConnecting}>
                        {isConnecting ? <RotatingLoader size={10} color="#fff" /> : (
                            <>
                                <Ionicons name="card" size={20} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={styles.connectButtonText}>Set Up Payouts</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </Card>
    );
};

// --- Main Payment Screen ---
export default function PaymentSettingsScreen() {
    const { getToken } = useAuth();
    const { confirmSetupIntent } = useConfirmSetupIntent();

    const [loading, setLoading] = useState(true);
    const [userBusiness, setUserBusiness] = useState<any>(null);
    const [savedCards, setSavedCards] = useState<any[]>([]);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- HIGHLIGHT START: Add state to track card input validity ---
    const [cardDetailsComplete, setCardDetailsComplete] = useState(false);
    // --- HIGHLIGHT END ---

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed.");

            const [businessRes, cardsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/users/my-business`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/stripe/payment-methods`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            if (!businessRes.ok || !cardsRes.ok) throw new Error("Could not load data.");

            setUserBusiness(await businessRes.json());
            setSavedCards(await cardsRes.json());

        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const handleSaveCard = async () => {
        // --- HIGHLIGHT: Add a check to prevent saving an incomplete card ---
        if (!cardDetailsComplete) {
            Alert.alert("Incomplete Card", "Please fill in all card details.");
            return;
        }
        // --- HIGHLIGHT END ---

        setIsSaving(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/stripe/create-setup-intent`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            const { clientSecret } = await response.json();
            if (!response.ok || !clientSecret) throw new Error("Could not prepare card for saving.");

            const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
                paymentMethodType: 'Card',
            });

            if (error) {
                throw new Error(error.message);
            }

            Alert.alert("Success", "Your card has been saved successfully!");
            setIsAddingCard(false);
            setCardDetailsComplete(false); // Reset for next time
            fetchData();
        } catch (error: any) {
            Alert.alert("Error Saving Card", error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCard = (paymentMethodId: string) => {
        // Step 1: Show a confirmation dialog to the user.
        // This is a critical safety measure for any destructive action.
        Alert.alert(
            "Delete Card", // Title of the alert
            "Are you sure you want to remove this payment method?", // Message
            [
                // The "Cancel" button does nothing and simply closes the alert.
                { 
                    text: "Cancel", 
                    style: "cancel" 
                },
                // The "Delete" button is styled destructively (red on iOS) and triggers the API call.
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        // Step 2: If the user confirms, perform the deletion.
                        try {
                            // Get the latest authentication token.
                            const token = await getToken();

                            // Call your backend endpoint to detach the payment method.
                            const response = await fetch(`${API_BASE_URL}/api/stripe/detach-payment-method`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({ paymentMethodId }),
                            });

                             // Step 3: Handle the API response.
                             if (!response.ok) {
                                 // If the server returns an error (e.g., 400 or 500), throw an error.
                                 throw new Error("Failed to delete card. Please try again.");
                             }

                             // Show a success message to the user.
                             Alert.alert("Success", "Your payment method has been removed.");
                             
                             // Step 4: Refresh the data to update the UI.
                             // This will re-fetch the list of cards, and the deleted one will disappear.
                             fetchData();

                        } catch (error: any) {
                             // Handle any network errors or errors thrown from the API check.
                             Alert.alert("Error", error.message);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <View style={styles.centered}><RotatingLoader size={50} color="#b95528" /></View>;
    }

    const isSeller = userBusiness?.garage || userBusiness?.towTruck;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Payments</Text>
            </View>
            
            <Card title="My Payment Methods">
                <FlatList
                    data={savedCards}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.cardItem}>
                            <Ionicons name="card" size={24} color="#555" />
                            <Text style={styles.cardText}>{item.brand.toUpperCase()} ending in {item.last4}</Text>
                            <TouchableOpacity onPress={() => handleDeleteCard(item.id)}>
                                <Ionicons name="trash-outline" size={24} color="#c0392b" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
                {isAddingCard && (
                    <View style={styles.addCardContainer}>
                        {/* --- HIGHLIGHT START: Add onCardChange handler --- */}
                        <CardField
                            postalCodeEnabled={false}
                            onCardChange={(cardDetails) => {
                                // This callback updates our state with the card's validity
                                setCardDetailsComplete(cardDetails.complete);
                            }}
                            style={styles.cardField}
                        />
                        {/* --- HIGHLIGHT END --- */}
                        <View style={styles.addCardActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => {
                                setIsAddingCard(false);
                                setCardDetailsComplete(false); // Reset on cancel
                            }}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            {/* --- HIGHLIGHT START: Button is now conditionally disabled --- */}
                            <TouchableOpacity 
                                style={[styles.saveButton, (!cardDetailsComplete || isSaving) && styles.disabledButton]} 
                                onPress={handleSaveCard} 
                                disabled={!cardDetailsComplete || isSaving}
                            >
                                {isSaving ? <RotatingLoader size={20} color="#fff" /> : <Text style={styles.saveButtonText}>Save Card</Text>}
                            </TouchableOpacity>
                             {/* --- HIGHLIGHT END --- */}
                        </View>
                    </View>
                )}

                {!isAddingCard && (
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsAddingCard(true)}>
                        <Ionicons name="add-circle" size={22} color="#fff" />
                        <Text style={styles.addButtonText}>Add New Card</Text>
                    </TouchableOpacity>
                )}
            </Card>

            {/* --- SELLER SECTION --- */}
            {userBusiness?.garage && <StripeConnectCard business={userBusiness.garage} businessType="garage" />}
            {userBusiness?.towTruck && <StripeConnectCard business={userBusiness.towTruck} businessType="tow-truck" />}
            {!isSeller && <Card title="Become a Seller"><Text style={styles.infoText}>Set up a business to start receiving payments.</Text></Card>}
        </ScrollView>
    );
}

// --- Stylesheet ---
// Add the new styles to your existing styles object
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
    infoText: { fontSize: 15, color: '#7f8c8d', lineHeight: 22 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 15, borderRadius: 8 },
    statusText: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', marginLeft: 10 },
    connectButton: {
        flexDirection: 'row', backgroundColor: '#635BFF', paddingVertical: 15,
        borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 15
    },
    connectButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    
    // New styles for card management
    cardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    cardText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333' },
    addCardContainer: { marginTop: 15 },
    cardField: { width: '100%', height: 50, marginBottom: 20 },
    addCardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    cancelButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#e0e0e0' },
    cancelButtonText: { color: '#333', fontWeight: 'bold' },
    saveButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#27ae60' },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
    addButton: {
        flexDirection: 'row', backgroundColor: '#3498db', paddingVertical: 12,
        borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 15
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    disconnectButton: {
        backgroundColor: '#f1f1f1',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },
    disconnectButtonText: {
        color: '#c0392b', // Danger color for text
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#a5d6a7', // A lighter shade of green to indicate disabled
    },
});