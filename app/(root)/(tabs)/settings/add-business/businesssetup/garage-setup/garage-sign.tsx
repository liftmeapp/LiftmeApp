// /app/(root)/(tabs)/settings/add-business/businesssetup/garage-setup/garage-sign.tsx
import { useGarageStore } from '@/store/garageStore'; // Adjust path if needed
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // For a nice button gradient
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

// A reusable Card component for grouping inputs
const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);

// A reusable Input component with an icon
const IconInput = ({ icon, ...props }: { icon: keyof typeof Ionicons.glyphMap } & React.ComponentProps<typeof TextInput>) => (
    <View style={styles.inputContainer}>
        <Ionicons name={icon} size={22} color="#005C70" style={styles.inputIcon} />
        <TextInput style={styles.input} {...props} />
    </View>
);

export default function GarageSignUpScreen() {
    const router = useRouter();
    const { garageId } = useLocalSearchParams<{ garageId: string }>();
    const { details, setDetails } = useGarageStore();

    const handleNext = () => {
        if (!details.name || !details.licenseNumber || !details.ownerName || !details.address) {
            return Alert.alert('Missing Information', 'Please fill in all required fields marked with *.');
        }
        // Navigate to the next step
        router.push({
            pathname: '/settings/add-business/businesssetup/garage-setup/addservices',
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
                        <Text style={styles.title}>Set Up Your Garage</Text>
                        <Text style={styles.subtitle}>Step 1: Business & Payout Details</Text>
                    </View>

                    <Card title="Business Information">
                        <IconInput icon="business-outline" placeholder="Garage Name*" value={details.name} onChangeText={(text) => setDetails({ name: text })} />
                        <IconInput icon="document-text-outline" placeholder="Business License Number*" value={details.licenseNumber} onChangeText={(text) => setDetails({ licenseNumber: text })} />
                        <IconInput icon="person-outline" placeholder="Garage Owner Full Name*" value={details.ownerName} onChangeText={(text) => setDetails({ ownerName: text })} />
                        <IconInput icon="location-outline" placeholder="Full Address*" value={details.address} onChangeText={(text) => setDetails({ address: text })} multiline />
                        <IconInput icon="mail-outline" placeholder="Public Contact Email" value={details.contactEmail} onChangeText={(text) => setDetails({ contactEmail: text })} keyboardType="email-address" />
                        <IconInput icon="call-outline" placeholder="Public Contact Phone" value={details.contactPhone} onChangeText={(text) => setDetails({ contactPhone: text })} keyboardType="phone-pad" />
                        <IconInput icon="people-outline" placeholder="Number of Employees" value={details.numberOfEmployees} onChangeText={(text) => setDetails({ numberOfEmployees: text })} keyboardType="numeric" />
                    </Card>

                    <Card title="Payouts Setup">
                        <Text style={styles.payoutsInfo}>
                            To receive payments, you can set up your bank account or UPI details in <Text style={{ fontWeight: 'bold' }}>Settings {'>'} Payments</Text> after your garage is registered.
                        </Text>
                        <View style={styles.infoSection}>
                            <Ionicons name="time-outline" size={32} color="#005C70" style={{ marginBottom: 10 }} />
                            <Text style={styles.infoTitle}>Payouts Coming Soon</Text>
                            <Text style={styles.infoText}>
                                We are finalizing our automated payout system. You can complete your registration now, and we will notify you when you can link your bank account for receiving payments.
                            </Text>
                        </View>
                    </Card>

                    <TouchableOpacity onPress={handleNext}>
                        <LinearGradient
                            colors={['#005C70', '#004252']}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Next: Add Services</Text>
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
        backgroundColor: '#eef0f3', // Slightly darker than white for contrast
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 150, // Increased to ensure content clears floating tab bar
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    title: {
        fontSize: 26, // Slightly smaller, cleaner
        fontWeight: '700', // Bold but not heavy
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
        borderRadius: 20, // Increased radius
        padding: 24, // More breathing room
        marginBottom: 20,
        // Softer shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#005C70', // Use brand color for headings
        marginBottom: 20,
        paddingBottom: 0, // Removed border
        borderBottomWidth: 0, // Removed border
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0, // Remove border
        borderRadius: 12, // Rounded inputs
        marginBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#f0f0f0', // Gray background
        height: 56, // Taller inputs
    },
    inputIcon: {
        marginRight: 12,
        opacity: 0.6, // Softer icons
    },
    infoSection: {
        backgroundColor: '#E0F2F1',
        borderColor: '#005C70',
        borderWidth: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005C70',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#004D40',
        textAlign: 'center',
        lineHeight: 20,
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
        backgroundColor: '#E0F7FA',
        borderWidth: 1,
        borderColor: '#B2EBF2'
    },
    stripeConnectedText: {
        color: '#006064',
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
        fontWeight: 'bold',
        marginRight: 8,
    },
});