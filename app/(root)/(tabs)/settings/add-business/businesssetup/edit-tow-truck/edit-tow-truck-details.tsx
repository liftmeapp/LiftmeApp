// /app/(root)/(tabs)/settings/add-business/businesssetup/edit-tow-truck/edit-tow-truck-details.tsx

import RotatingLoader from '@/components/RotatingLoader';
import { TowableVehicleType } from '@/store/towtruckStore';
import { useAuth } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface ServiceSelectionState {
  type: TowableVehicleType;
  label: string;
  selected: boolean;
  price: string;
}

const ALL_SERVICE_TYPES: ServiceSelectionState[] = [
    { type: 'BIKE', label: 'Bikes / Motorcycles', selected: false, price: '' },
    { type: 'HATCHBACK', label: 'Hatchback', selected: false, price: '' },
    { type: 'SEDAN', label: 'Sedan', selected: false, price: '' },
    { type: 'SUV', label: 'SUV', selected: false, price: '' },
    { type: 'LUXURY', label: 'Luxury Vehicles', selected: false, price: '' },
    { type: 'TRUCK', label: 'Light Trucks / Vans', selected: false, price: '' },
];

export default function EditTowTruckDetailsScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { towTruckId } = useLocalSearchParams<{ towTruckId: string }>();

  // --- FORM STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [serviceSelections, setServiceSelections] = useState<ServiceSelectionState[]>(ALL_SERVICE_TYPES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTowTruckData, setCurrentTowTruckData] = useState<any>(null);

  // Pre-populate the form with existing data on load
  useEffect(() => {
    if (!towTruckId) {
        setIsLoading(false);
        Alert.alert("Error", "No Tow Truck ID provided.");
        return;
    }

    const fetchTowTruckData = async () => {
        console.log("EditTowTruckDetailsScreen: Fetching existing data...");
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch tow truck details.");
            
            const data = await response.json();
            setCurrentTowTruckData(data); // Save original data for status check

            // Pre-fill form state
            setName(data.name || '');
            setDriverName(data.driverName || '');
            setContactEmail(data.contactEmail || '');
            setModel(data.model || '');
            setYear(String(data.year || ''));
            setMake(data.make || '');
            setLicenseNumber(data.licenseNumber || '');
            setPlateNumber(data.plateNumber || '');

            // Pre-fill services
            if (data.services && Array.isArray(data.services)) {
                const existingServicesMap = new Map(data.services.map((s: any) => [s.vehicleType, s.price]));
                setServiceSelections(ALL_SERVICE_TYPES.map(s => {
                    const price = existingServicesMap.get(s.type);
                    return { ...s, selected: price !== undefined, price: price !== undefined ? String(price) : '' };
                }));
            }

        } catch (error: any) {
            console.error("Error fetching tow truck details:", error);
            Alert.alert("Error", "Could not load existing tow truck details.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchTowTruckData();
  }, [towTruckId]);

  const handleServiceToggle = (index: number) => {
    const newSelections = [...serviceSelections];
    newSelections[index].selected = !newSelections[index].selected;
    if (!newSelections[index].selected) {
      newSelections[index].price = '';
    }
    setServiceSelections(newSelections);
  };

  const handlePriceChange = (text: string, index: number) => {
    const newSelections = [...serviceSelections];
    newSelections[index].price = text.replace(/[^0-9.]/g, '');
    setServiceSelections(newSelections);
  };

  const handleUpdate = async () => {
    if (!name.trim() || !driverName.trim() || !plateNumber.trim() || !licenseNumber.trim() || !make || !model || !year) {
        return Alert.alert('Missing Details', 'Please fill out all required fields.');
    }
    const selectedServices = serviceSelections.filter(s => s.selected).map(s => ({
        vehicleType: s.type,
        price: parseFloat(s.price),
    }));
    if (selectedServices.length === 0) {
        return Alert.alert('No Services', 'Please select and price at least one service.');
    }
    if (selectedServices.some(s => isNaN(s.price) || s.price <= 0)) {
        return Alert.alert('Invalid Price', 'Please enter a valid price for all selected services.');
    }

    setIsSubmitting(true);

    const payload: any = {
      details: {
        name: name.trim(),
        driverName: driverName.trim(),
        contactEmail: contactEmail.trim(),
        model, make,
        year: parseInt(year, 10),
        plateNumber: plateNumber.trim().toUpperCase(),
        licenseNumber: licenseNumber.trim(),
      },
      services: selectedServices,
    };

    // If re-applying for a rejected business, set status to PENDING
    if (currentTowTruckData && currentTowTruckData.status === 'REJECTED') {
        payload.details.status = 'PENDING';
    }

    try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/api/tow-trucks/${towTruckId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server error: ${response.status}`);
        }

        Alert.alert('Success!', 'Your tow truck details have been updated and submitted for review.', [
            { text: 'OK', onPress: () => router.replace('/settings/add-business/businesssetup/businesspage') },
        ]);

    } catch (e: any) {
        Alert.alert('Update Error', e.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <RotatingLoader message="Loading Tow Truck Details..." />
        </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Edit Tow Truck' }} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Edit Your Tow Truck</Text>
          <Text style={styles.subtitle}>Update vehicle details and service pricing.</Text>

          <TextInput style={styles.input} placeholder="Business or Truck Name *" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Primary Driver's Name *" value={driverName} onChangeText={setDriverName} />
          <TextInput style={styles.input} placeholder="Contact Email (optional)" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Vehicle Plate Number *" value={plateNumber} onChangeText={text => setPlateNumber(text.toUpperCase())} autoCapitalize="characters" />
          <TextInput style={styles.input} placeholder="Official License No *" value={licenseNumber} onChangeText={setLicenseNumber} />

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput style={styles.input} placeholder="Year *" value={year} onChangeText={setYear} keyboardType="numeric" maxLength={4} />
            </View>
            <View style={[styles.inputContainer, styles.halfInput, styles.pickerContainer]}>
                <Picker selectedValue={make} onValueChange={(itemValue) => setMake(itemValue)} style={styles.picker} itemStyle={styles.pickerItem}>
                    <Picker.Item label="Make *" value="" /><Picker.Item label="Ford" value="Ford" /><Picker.Item label="Chevrolet" value="Chevrolet" /><Picker.Item label="GMC" value="GMC" /><Picker.Item label="Freightliner" value="Freightliner" /><Picker.Item label="Peterbilt" value="Peterbilt" /><Picker.Item label="Other" value="Other" />
                </Picker>
            </View>
          </View>
          
          <View style={[styles.inputContainer, styles.pickerContainer, { marginBottom: 30 }]}>
              <Picker selectedValue={model} onValueChange={(itemValue) => setModel(itemValue)} style={styles.picker} itemStyle={styles.pickerItem}>
                  <Picker.Item label="Model *" value="" /><Picker.Item label="Flatbed" value="Flatbed" /><Picker.Item label="Hook and Chain" value="Hook and Chain" /><Picker.Item label="Wheel-Lift" value="Wheel-Lift" /><Picker.Item label="Integrated" value="Integrated" />
              </Picker>
          </View>

          <Text style={styles.subheading}>Your Towing Prices/Km for :</Text>
          <View style={styles.serviceListContainer}>
              {serviceSelections.map((service, index) => (
                  <View key={service.type} style={styles.serviceItemContainer}>
                      <View style={styles.serviceRow}>
                          <Text style={styles.serviceName}>{service.label}</Text>
                          <Switch trackColor={{ false: "#ccc", true: "#ed8b65" }} thumbColor={"#fff"} onValueChange={() => handleServiceToggle(index)} value={service.selected} />
                      </View>
                      {service.selected && (
                          <View style={styles.priceInputRow}>
                              <Text style={styles.priceLabel}>Price/km(INR):</Text>
                              <TextInput style={styles.priceInput} placeholder="e.g., 150" keyboardType="numeric" value={service.price} onChangeText={(text) => handlePriceChange(text, index)} />
                          </View>
                      )}
                  </View>
              ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes & Re-apply</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
  subheading: { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 15, color: '#333' },
  input: { height: 50, fontSize: 16, color: '#333', paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  halfInput: { flex: 1, marginRight: 10 },
  inputContainer: { flex: 1 },
  pickerContainer: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center' },
  picker: { height: 50, color: '#333' },
  pickerItem: { height: 50 },
  serviceListContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 5, marginBottom: 20 },
  serviceItemContainer: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 16, color: '#333', flex: 1 },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingLeft: 5 },
  priceLabel: { fontSize: 15, color: '#555', marginRight: 8 },
  priceInput: { flex: 1, height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fafafa', fontSize: 15 },
  button: { height: 50, backgroundColor: '#27ae60', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 5, },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});