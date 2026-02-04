// /app/(root)/(tabs)/settings/add-business/businesssetup/edit-garage/edit-details.tsx
import RotatingLoader from '@/components/RotatingLoader';
import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);

const IconInput = ({ icon, ...props }: { icon: keyof typeof Ionicons.glyphMap } & React.ComponentProps<typeof TextInput>) => (
    <View style={styles.inputContainer}>
        <Ionicons name={icon} size={22} color="#005C70" style={styles.inputIcon} />
        <TextInput style={styles.input} {...props} />
    </View>
);

export default function EditGarageDetailsScreen() {
    const router = useRouter();
    const { garageId } = useLocalSearchParams<{ garageId: string }>();
    const { details, setDetails, setStripeAccountId, setServices, setSupportedVehicleTypes } = useGarageStore();
    const { getToken } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [isConnectingStripe, setIsConnectingStripe] = useState(false);

    // Effect to pre-populate the form with existing garage data
    useEffect(() => {
        if (!garageId) {
            setIsLoading(false);
            return;
        };

        const fetchGarageData = async () => {
            console.log("EditGarageDetailsScreen: Fetching existing garage data...");
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication failed.");

                const response = await fetch(`${API_BASE_URL}/api/garages/${garageId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch garage details: ${errorText}`);
                }

                const data = await response.json();
                console.log("EditGarageDetailsScreen: Full garage data fetched from API:", data);
                console.log("EditGarageDetailsScreen: Data fetched, populating store.");

                // Populate the store with all the fetched details
                setDetails({
                    name: data.name || '',
                    licenseNumber: data.licenseNumber || '',
                    ownerName: data.ownerName || '',
                    address: data.address || '',
                    contactEmail: data.contactEmail || '',
                    contactPhone: data.contactPhone || '',
                    numberOfEmployees: data.numberOfEmployees ? String(data.numberOfEmployees) : '0',
                    stripeAccountId: data.stripeAccountId || null,
                });

                // Also populate the services in the store so the next screen is pre-filled
                if (data.services && Array.isArray(data.services)) {
                    console.log("EditGarageDetailsScreen: Populating services with:", data.services);
                    setServices(data.services.map((s: any) => ({ serviceId: s.serviceId, price: s.price })));
                } else {
                    console.log("EditGarageDetailsScreen: data.services is empty or not an array:", data.services);
                    setServices([]); // Ensure it's always an array
                }
                console.log("EditGarageDetailsScreen: Services in store after population:", useGarageStore.getState().services);

                // Populate supportedVehicleTypes in the store
                if (data.supportedVehicleTypes && Array.isArray(data.supportedVehicleTypes)) {
                    console.log("EditGarageDetailsScreen: Populating supportedVehicleTypes with:", data.supportedVehicleTypes);
                    setSupportedVehicleTypes(data.supportedVehicleTypes);
                } else {
                    console.log("EditGarageDetailsScreen: data.supportedVehicleTypes is empty or not an array:", data.supportedVehicleTypes);
                    setSupportedVehicleTypes([]); // Ensure it's always an array
                }
                console.log("EditGarageDetailsScreen: supportedVehicleTypes in store after population:", useGarageStore.getState().supportedVehicleTypes);

            } catch (error: any) {
                Alert.alert("Error Loading Data", error.message || "Could not load your existing garage data.");
                router.back(); // Go back if we can't load the data
            } finally {
                setIsLoading(false);
            }
        };

        fetchGarageData();
    }, [garageId]);

    const handleConnectStripe = async () => {
        setIsConnectingStripe(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        const fakeStripeId = 'acct_' + Math.random().toString(36).substring(2, 15);
        setStripeAccountId(fakeStripeId);
        setIsConnectingStripe(false);
        Alert.alert("Stripe Connected! (Simulation)", `Your account is now linked with ID: ${fakeStripeId}`);
    };

    const handleNext = () => {
        if (!details.name || !details.licenseNumber || !details.ownerName || !details.address) {
            return Alert.alert('Missing Information', 'Please fill in all required fields marked with *.');
        }
        if (!details.stripeAccountId) {
            return Alert.alert('Payouts Not Set Up', 'Please connect a Stripe account to receive payments before continuing.');
        }
        router.push({
            pathname: '/settings/add-business/businesssetup/edit-garage/edit-services',
            params: { garageId }
        });
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <RotatingLoader message="Loading Your Details..." iconName="id-card-outline" color="#ed8b65" size={50} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'Edit Garage Details', headerBackTitle: 'Back' }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Edit Your Garage</Text>
                        <Text style={styles.subtitle}>Step 1: Update Business Details</Text>
                    </View>

                    <Card title="Business Information">
                        <IconInput icon="business-outline" placeholder="Garage Name*" value={details.name} onChangeText={(text) => setDetails({ name: text })} />
                        <IconInput icon="document-text-outline" placeholder="Business License Number*" value={details.licenseNumber} onChangeText={(text) => setDetails({ licenseNumber: text })} />
                        <IconInput icon="person-outline" placeholder="Garage Owner Full Name*" value={details.ownerName} onChangeText={(text) => setDetails({ ownerName: text })} />
                        <IconInput icon="location-outline" placeholder="Full Address*" value={details.address} onChangeText={(text) => setDetails({ address: text })} multiline />
                        <IconInput icon="mail-outline" placeholder="Public Contact Email" value={details.contactEmail} onChangeText={(text) => setDetails({ contactEmail: text })} keyboardType="email-address" />
                        <IconInput icon="call-outline" placeholder="Public Contact Phone" value={details.contactPhone} onChangeText={(text) => setDetails({ contactPhone: text })} keyboardType="phone-pad" />
                        <IconInput icon="people-outline" placeholder="Number of Employees" value={String(details.numberOfEmployees)} onChangeText={(text) => setDetails({ numberOfEmployees: text })} keyboardType="numeric" />
                    </Card>

                    <Card title="Payouts Setup">
                        <Text style={styles.payoutsInfo}>We use Stripe to handle secure payments directly to your bank account. Connect your account to get paid.</Text>

                        {details.stripeAccountId ? (
                            <View style={styles.stripeConnectedContainer}>
                                <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                                <Text style={styles.stripeConnectedText}>Stripe Account Connected!</Text>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.stripeButton} onPress={handleConnectStripe} disabled={isConnectingStripe}>
                                {isConnectingStripe ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Ionicons name="card" size={20} color="#fff" style={{ marginRight: 10 }} />
                                        <Text style={styles.stripeButtonText}>Connect with Stripe</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </Card>

                    <TouchableOpacity onPress={handleNext}>
                        <LinearGradient
                            colors={['#005C70', '#004252']}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Next: Update Services</Text>
                            <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#eef0f3',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginTop: 6,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#005C70',
        marginBottom: 20,
        paddingBottom: 0,
        borderBottomWidth: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#f0f0f0',
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
        opacity: 0.7,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    payoutsInfo: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
        lineHeight: 21,
    },
    stripeButton: {
        flexDirection: 'row',
        backgroundColor: '#635BFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2
    },
    stripeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    stripeConnectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#C8E6C9'
    },
    stripeConnectedText: {
        color: '#2E7D32',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 12,
    },
    button: {
        flexDirection: 'row',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#005C70',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 8,
    },
});