import RotatingLoader from '@/components/RotatingLoader';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const VEHICLE_TYPES = [
    { label: 'Sedan', value: 'SEDAN' },
    { label: 'Hatchback', value: 'HATCHBACK' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Electric Vehicle (EV)', value: 'EV' },
    { label: 'Motorcycle / Bike', value: 'BIKE' },
    { label: 'Truck / Van', value: 'TRUCK' },
];

// Custom Input Component (Gray Box)
const GrayInput = ({ containerStyle, ...props }: { containerStyle?: any } & React.ComponentProps<typeof TextInput>) => (
    <View style={[styles.inputContainer, containerStyle]}>
        <TextInput
            style={styles.input}
            placeholderTextColor="#7D7D7D"
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
    const [typeModalVisible, setTypeModalVisible] = useState(false);

    // Generate Years (Example: 1990 - 2026)
    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(30), (val, index) => (currentYear + 1 - index).toString());

    // Toggle for Year Picker (if we were using a modal, but standard Picker is easiest)
    // For specific UI matching, standard Picker on Android/iOS might look different.
    // I'll use a TextInput for Year for now to ensure it looks like the design's "Gray Box",
    // unless I wrap the Picker in the gray box. Wrapping Picker is consistent.

    const handleAddVehicle = async () => {
        if (!brand.trim() || !name.trim() || !year.trim() || !plateNumber.trim()) {
            Alert.alert('Missing Information', 'Please fill out all required fields marked with *.');
            return;
        }

        setIsLoading(true);

        try {
            const token = await getToken();
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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with status ${response.status}`);
            }

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
            <Stack.Screen
                options={{
                    title: 'Add New Vehicle',
                    headerShown: true,
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#e0e0e0' }, // Match background
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Add a new vehicle</Text>
                        <View style={styles.divider} />

                        <GrayInput
                            placeholder="Brand (e.g. Toyota )*"
                            value={brand}
                            onChangeText={setBrand}
                        />

                        <GrayInput
                            placeholder="Name (e.g. Camry )*"
                            value={name}
                            onChangeText={setName}
                        />

                        <View style={styles.row}>
                            <GrayInput
                                containerStyle={{ flex: 1, marginRight: 10 }}
                                placeholder="Model (e.g. XSE )"
                                value={model}
                                onChangeText={setModel}
                            />
                            {/* Year - Using Input for visuals, but could be picker */}
                            <GrayInput
                                containerStyle={{ flex: 1 }}
                                placeholder="Year*"
                                value={year}
                                onChangeText={setYear}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                            {/* Note: Screenshot showed dropdown arrow for Year. 
                                To Implement fully: Wrap a Picker in a View that looks like GrayInput 
                            */}
                        </View>

                        <GrayInput
                            placeholder="Plate Number*"
                            value={plateNumber}
                            onChangeText={(text) => setPlateNumber(text.toUpperCase())}
                            autoCapitalize="characters"
                        />

                        <GrayInput
                            placeholder="Color (Optional)"
                            value={colorVal}
                            onChangeText={setColorVal}
                        />

                        <TouchableOpacity
                            style={styles.pickerWrapper}
                            onPress={() => setTypeModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.pickerText, !type && { color: '#7D7D7D' }]}>
                                {type ? VEHICLE_TYPES.find(v => v.value === type)?.label : 'Vehicle Type*'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#7D7D7D" />
                        </TouchableOpacity>

                        {/* Vehicle Type Modal */}
                        <Modal
                            visible={typeModalVisible}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setTypeModalVisible(false)}
                        >
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setTypeModalVisible(false)}
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select Vehicle Type</Text>
                                    <View style={styles.modalDivider} />
                                    <FlatList
                                        data={VEHICLE_TYPES}
                                        keyExtractor={(item) => item.value}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={[
                                                    styles.modalOption,
                                                    type === item.value && styles.modalOptionSelected,
                                                ]}
                                                onPress={() => {
                                                    setType(item.value);
                                                    setTypeModalVisible(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.modalOptionText,
                                                    type === item.value && styles.modalOptionTextSelected,
                                                ]}>
                                                    {item.label}
                                                </Text>
                                                {type === item.value && (
                                                    <Ionicons name="checkmark" size={20} color="#005C70" />
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>

                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleAddVehicle}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <RotatingLoader color="#fff" size={20} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Vehicle</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#e0e0e0' }, // Light Gray Background
    scrollContainer: {
        padding: 20,
        paddingTop: 10,
        alignItems: 'center'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005C70', // Teal
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 20,
    },
    inputContainer: {
        backgroundColor: '#D9D9D9', // Gray input background
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        justifyContent: 'center',
        marginBottom: 15,
    },
    input: {
        fontSize: 15,
        color: '#000',
        height: '100%',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0, // Inputs have margin
    },
    pickerWrapper: {
        backgroundColor: '#D9D9D9',
        borderRadius: 8,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    pickerText: {
        fontSize: 15,
        color: '#000',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '85%',
        maxHeight: '60%',
        paddingVertical: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005C70',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalDivider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 5,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    modalOptionSelected: {
        backgroundColor: '#E8F5F7',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalOptionTextSelected: {
        color: '#005C70',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#005C70', // Teal
        width: '100%',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
