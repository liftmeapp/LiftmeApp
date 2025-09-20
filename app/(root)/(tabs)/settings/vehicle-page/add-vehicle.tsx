import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, Stack } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RotatingLoader from '@/components/RotatingLoader';

// CONFIGURATION
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
 
// Reusable Input Component for a consistent look
const IconInput = ({ icon, ...props }: { icon: keyof typeof Ionicons.glyphMap } & React.ComponentProps<typeof TextInput>) => (
    <View style={styles.inputContainer}>
        <Ionicons name={icon} size={22} color="#888" style={styles.inputIcon} />
        <TextInput
            style={styles.input}
            placeholderTextColor="#999"
            {...props}
        />
    </View>
);

export default function AddVehicleScreen() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [colorVal, setColorVal] = useState('');
    const [type, setType] = useState('SEDAN');

    const [isLoading, setIsLoading] = useState(false);

    const handleAddVehicle = async () => {
        if (!brand.trim() || !name.trim() || !year.trim() || !plateNumber.trim()) {
            Alert.alert('Missing Information', 'Please fill out all required fields marked with *.');
            return;
        }
        if (isNaN(parseInt(year)) || year.length !== 4) {
            Alert.alert('Invalid Year', 'Please enter a valid 4-digit year.');
            return;
        }

        setIsLoading(true);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed. Please sign in again.");
            
            const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    brand: brand.trim(), name: name.trim(), model: model.trim(),
                    year, plateNumber: plateNumber.trim().toUpperCase(),
                    color: colorVal.trim(), type,
                }),
            });

            // Robust error handling
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Catch JSON parse errors
                throw new Error(errorData.error || `Server responded with status ${response.status}`);
            }

            const responseData = await response.json();
            console.log("Vehicle added:", responseData);

            Alert.alert(
                'Vehicle Added!',
                `${brand} ${name} has been successfully added to your profile.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );

        } catch (error: any) {
            console.error("Add vehicle error:", error);
            Alert.alert('Error', error.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'Add New Vehicle', headerBackTitle: 'Back' }} />
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Add a New Vehicle</Text>
                    <Text style={styles.subHeader}>Enter the details of your vehicle below.</Text>
                </View>

                <IconInput icon="car-sport-outline" placeholder="Brand (e.g., Toyota) *" value={brand} onChangeText={setBrand} />
                <IconInput icon="pricetag-outline" placeholder="Name (e.g., Camry) *" value={name} onChangeText={setName} />
                <IconInput icon="information-circle-outline" placeholder="Model (e.g., XSE) (Optional)" value={model} onChangeText={setModel} />
                <IconInput icon="calendar-outline" placeholder="Year (e.g., 2023) *" value={year} onChangeText={setYear} keyboardType="numeric" maxLength={4} />
                <IconInput icon="id-card-outline" placeholder="Plate Number *" value={plateNumber} onChangeText={(text) => setPlateNumber(text.toUpperCase())} autoCapitalize="characters" />
                <IconInput icon="color-palette-outline" placeholder="Color (Optional)" value={colorVal} onChangeText={setColorVal} />
                
                <Text style={styles.pickerLabel}>Vehicle Type *</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
                        <Picker.Item label="Sedan" value="SEDAN" />
                        <Picker.Item label="Hatchback" value="HATCHBACK" />
                        <Picker.Item label="SUV" value="SUV" />
                        <Picker.Item label="Luxury Car" value="LUXURY" />
                        <Picker.Item label="Motorcycle / Bike" value="BIKE" />
                        <Picker.Item label="Truck / Van" value="TRUCK" />
                    </Picker>
                </View>

                <TouchableOpacity onPress={handleAddVehicle} disabled={isLoading}>
                    <LinearGradient
                        colors={['#c3683c', '#b95528']}
                        style={styles.button}
                    >
                        {isLoading ? (
                            <RotatingLoader color="#fff" size={15}/>
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Save Vehicle</Text>
                                <Ionicons name="add-circle" size={22} color="#fff" />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#f8f9fa',marginTop: 50 },
    scrollContainer: { flexGrow: 1, padding: 20, marginTop: 50, paddingTop: 40 },
    headerContainer: { alignItems: 'center', marginBottom: 30 },
    header: { fontSize: 28, fontWeight: 'bold', color: '#333',marginBottom: 10 },
    subHeader: { fontSize: 16, color: '#666', marginTop: 8, textAlign: 'center' },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0',
        paddingHorizontal: 15, marginBottom: 15,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 55, fontSize: 16, color: '#333' },
    pickerLabel: { fontSize: 16, color: '#555', fontWeight: '500', marginBottom: 10, paddingLeft: 5 },
    pickerContainer: {
        borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
        backgroundColor: '#fff', justifyContent: 'center',
        marginBottom: 25,
    },
    picker: { height: Platform.OS === 'ios' ? 120 : 55 },
    button: {
        flexDirection: 'row', padding: 15, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#b95528', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 5, elevation: 6,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
});

