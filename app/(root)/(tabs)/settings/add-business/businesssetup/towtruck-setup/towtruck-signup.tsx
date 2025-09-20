// /app/settings/add-business/businesssetup/towtruck-signup.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Switch, // Added Switch for service selection
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useTowTruckStore, TowableVehicleType } from '@/store/towtruckStore'; // Adjust path if needed

// This interface helps manage the local state of the form for services
interface ServiceSelectionState {
  type: TowableVehicleType;
  label: string;
  selected: boolean;
  price: string;
}

export default function TowTruckSignupScreen() {
  const router = useRouter();
  // Get the setter functions from our Zustand store
  const { setDetails, setServices } = useTowTruckStore();

  // --- FORM STATE ---
  // State for all the text inputs and pickers
  const [name, setName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  // Local state to manage the UI for service selection and pricing
  const [serviceSelections, setServiceSelections] = useState<ServiceSelectionState[]>([
      { type: 'BIKE', label: 'Bikes / Motorcycles', selected: false, price: '' },
      { type: 'HATCHBACK', label: 'Hatchback', selected: false, price: '' },
      { type: 'SEDAN', label: 'Sedan', selected: false, price: '' },
      { type: 'SUV', label: 'SUV', selected: false, price: '' },
      { type: 'LUXURY', label: 'Luxury Vehicles', selected: false, price: '' },
      { type: 'TRUCK', label: 'Light Trucks / Vans', selected: false, price: '' },
  ]);

  const handleServiceToggle = (index: number) => {
    const newSelections = [...serviceSelections];
    newSelections[index].selected = !newSelections[index].selected;
    // Optional: Clear price when deselected
    if (!newSelections[index].selected) {
      newSelections[index].price = '';
    }
    setServiceSelections(newSelections);
  };

  const handlePriceChange = (text: string, index: number) => {
    const newSelections = [...serviceSelections];
    // Allow only numbers and one decimal point
    newSelections[index].price = text.replace(/[^0-9.]/g, '');
    setServiceSelections(newSelections);
  };

  const handleContinue = () => {
    // --- FORM VALIDATION ---
    if (!name.trim() || !driverName.trim() || !plateNumber.trim() || !licenseNumber.trim() || !make || !model || !year) {
        Alert.alert('Missing Details', 'Please fill out all required truck, driver, and license fields.');
        return;
    }
    if (isNaN(parseInt(year)) || year.length !== 4) {
        Alert.alert('Invalid Year', 'Please enter a valid 4-digit year.');
        return;
    }

    const selectedServicesWithPrices = serviceSelections
        .filter(s => s.selected)
        .map(s => ({
            vehicleType: s.type,
            price: parseFloat(s.price),
        }));

    if (selectedServicesWithPrices.length === 0) {
        return Alert.alert('No Services Selected', 'Please select and set a price for at least one towing service you offer.');
    }

    // Check if any selected service has a missing or invalid price
    for (const service of selectedServicesWithPrices) {
        if (isNaN(service.price) || service.price <= 0) {
            return Alert.alert('Invalid Price', `Please set a valid price for towing a ${service.vehicleType.toLowerCase()}.`);
        }
    }

    // --- SAVE TO ZUSTAND STORE ---
    setDetails({
        name: name.trim(),
        driverName: driverName.trim(),
        model,
        make,
        year: parseInt(year, 10),
        plateNumber: plateNumber.trim().toUpperCase(),
        licenseNumber: licenseNumber.trim(),
    });

    setServices(selectedServicesWithPrices);

    // --- NAVIGATE TO NEXT STEP ---
    // This path must match the file you will create for the map screen
    router.push('/settings/add-business/businesssetup/towtruck-setup/set-tow-truck-location');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Register Your Tow Truck</Text>
          <Text style={styles.subtitle}>Step 1: Vehicle & Driver Details</Text>

          <TextInput style={styles.input} placeholder="Business or Truck Name *" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Primary Driver's Name *" value={driverName} onChangeText={setDriverName} />
          <TextInput style={styles.input} placeholder="Vehicle Plate Number *" value={plateNumber} onChangeText={text => setPlateNumber(text.toUpperCase())} autoCapitalize="characters" />
          <TextInput style={styles.input} placeholder="Official License No *" value={licenseNumber} onChangeText={setLicenseNumber} />

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput style={styles.input} placeholder="Year *" value={year} onChangeText={setYear} keyboardType="numeric" maxLength={4} />
            </View>
            <View style={[styles.inputContainer, styles.halfInput, styles.pickerContainer]}>
                <Picker selectedValue={make} onValueChange={(itemValue) => setMake(itemValue)} style={styles.picker} itemStyle={styles.pickerItem}>
                    <Picker.Item label="Make *" value="" />
                    <Picker.Item label="Ford" value="Ford" /><Picker.Item label="Chevrolet" value="Chevrolet" /><Picker.Item label="GMC" value="GMC" /><Picker.Item label="Freightliner" value="Freightliner" /><Picker.Item label="Peterbilt" value="Peterbilt" /><Picker.Item label="Other" value="Other" />
                </Picker>
            </View>
          </View>
          
          <View style={[styles.inputContainer, styles.pickerContainer, { marginBottom: 30 }]}>
              <Picker selectedValue={model} onValueChange={(itemValue) => setModel(itemValue)} style={styles.picker} itemStyle={styles.pickerItem}>
                  <Picker.Item label="Model *" value="" />
                  <Picker.Item label="Flatbed" value="Flatbed" /><Picker.Item label="Hook and Chain" value="Hook and Chain" /><Picker.Item label="Wheel-Lift" value="Wheel-Lift" /><Picker.Item label="Integrated" value="Integrated" />
              </Picker>
          </View>

          <Text style={styles.subheading}>Set Your Towing Prices</Text>
          <View style={styles.serviceListContainer}>
              {serviceSelections.map((service, index) => (
                  <View key={service.type} style={styles.serviceItemContainer}>
                      <View style={styles.serviceRow}>
                          <Text style={styles.serviceName}>{service.label}</Text>
                          <Switch
                              trackColor={{ false: "#ccc", true: "#ed8b65" }}
                              thumbColor={"#fff"}
                              onValueChange={() => handleServiceToggle(index)}
                              value={service.selected}
                          />
                      </View>
                      {service.selected && (
                          <View style={styles.priceInputRow}>
                              <Text style={styles.priceLabel}>Price (AED):</Text>
                              <TextInput
                                  style={styles.priceInput}
                                  placeholder="e.g., 150"
                                  keyboardType="numeric"
                                  value={service.price}
                                  onChangeText={(text) => handlePriceChange(text, index)}
                              />
                          </View>
                      )}
                  </View>
              ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue to Set Location</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLES ---
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
  pickerItem: { height: 50 }, // For iOS styling
  serviceListContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 5, marginBottom: 20 },
  serviceItemContainer: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 16, color: '#333', flex: 1 },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingLeft: 5 },
  priceLabel: { fontSize: 15, color: '#555', marginRight: 8 },
  priceInput: { flex: 1, height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fafafa', fontSize: 15 },
  button: { height: 50, backgroundColor: '#ed8b65', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 5, },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});