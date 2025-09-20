// /app/(root)/(tabs)/settings/add-business/businesssetup/edit-garage/edit-details.tsx
import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    ScrollView, Alert, ActivityIndicator, SafeAreaView,
    Platform, KeyboardAvoidingView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGarageStore } from '@/store/garageStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);

const IconInput = ({ icon, ...props }: { icon: keyof typeof Ionicons.glyphMap } & React.ComponentProps<typeof TextInput>) => (
    <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color="#888" style={styles.inputIcon} />
        <TextInput style={styles.input} {...props} />
    </View>
);

export default function EditGarageDetailsScreen() {
    const router = useRouter();
    const { garageId } = useLocalSearchParams<{ garageId: string }>();
    const { details, setDetails, setStripeAccountId } = useGarageStore();
    const [isConnectingStripe, setIsConnectingStripe] = useState(false);

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

    return (
        <SafeAreaView style={styles.safeArea}>
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
                                        <Ionicons name="card" size={20} color="#fff" style={{ marginRight: 10 }}/>
                                        <Text style={styles.stripeButtonText}>Connect with Stripe</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </Card>

                    <TouchableOpacity onPress={handleNext}>
                        <LinearGradient
                            colors={['#c3683c', '#b95528']}
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
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fdfdfd'
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    payoutsInfo: {
        fontSize: 14,
        color: '#555',
        marginBottom: 15,
        lineHeight: 21,
    },
    stripeButton: {
        flexDirection: 'row',
        backgroundColor: '#635BFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2
    },
    stripeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stripeConnectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#C8E6C9'
    },
    stripeConnectedText: {
        color: '#2E7D32',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    button: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#b95528',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
});
