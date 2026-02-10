import { TowableVehicleType, useTowTruckStore } from '@/store/towtruckStore'; // Adjust path if needed
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [contactEmail, setContactEmail] = useState('');
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
      contactEmail: contactEmail.trim(),
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
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Register Your Tow Truck</Text>
            <Text style={styles.subtitle}>Step 1: Vehicle & Driver Details</Text>
          </View>

          <View style={styles.card}>
            <TextInput style={styles.input} placeholder="Business or Truck Name *" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Primary Driver's Name *" value={driverName} onChangeText={setDriverName} />
            <TextInput style={styles.input} placeholder="Contact Email (optional)" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Vehicle Plate Number *" value={plateNumber} onChangeText={text => setPlateNumber(text.toUpperCase())} autoCapitalize="characters" />
            <TextInput style={styles.input} placeholder="Official License No *" value={licenseNumber} onChangeText={setLicenseNumber} />

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput style={styles.input} placeholder="Year *" value={year} onChangeText={setYear} keyboardType="numeric" maxLength={4} />
              </View>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput style={styles.input} placeholder="Truck Brand *" value={make} onChangeText={setMake} />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.pickerContainer]}>
              <Picker selectedValue={model} onValueChange={(itemValue) => setModel(itemValue)} style={styles.picker} itemStyle={styles.pickerItem}>
                <Picker.Item label="Model *" value="" />
                <Picker.Item label="Flatbed" value="Flatbed" /><Picker.Item label="Hook and Chain" value="Hook and Chain" /><Picker.Item label="Wheel-Lift" value="Wheel-Lift" /><Picker.Item label="Integrated" value="Integrated" />
              </Picker>
            </View>
          </View>

          <Text style={styles.subheading}>Your Towing Prices/Km for :</Text>
          <View style={styles.serviceListContainer}>
            {serviceSelections.map((service, index) => (
              <View key={service.type} style={styles.serviceItemContainer}>
                <View style={styles.serviceRow}>
                  <Text style={styles.serviceName}>{service.label}</Text>
                  <Switch
                    trackColor={{ false: "#ccc", true: "#005C70" }}
                    thumbColor={"#fff"}
                    onValueChange={() => handleServiceToggle(index)}
                    value={service.selected}
                    style={{ transform: [{ scale: 0.7 }] }}
                  />
                </View>
                {service.selected && (
                  <View style={styles.priceInputRow}>
                    <Text style={styles.priceLabel}>Price/km (INR):</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="e.g., 50"
                      keyboardType="numeric"
                      value={service.price}
                      onChangeText={(text) => handlePriceChange(text, index)}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Payouts Coming Soon</Text>
            <Text style={styles.infoText}>
              We are finalizing our automated payout system. You can complete your registration now, and we will notify you when you can link your bank account.
            </Text>
          </View>

          <TouchableOpacity onPress={handleContinue}>
            <LinearGradient colors={['#005C70', '#004252']} style={styles.button}>
              <Text style={styles.buttonText}>Continue to Set Location</Text>
            </LinearGradient>
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
  scrollContent: { paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 100 },
  headerContainer: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

  subheading: { fontSize: 16, fontWeight: '700', marginTop: 0, marginBottom: 12, color: '#005C70' },
  input: { height: 48, fontSize: 15, color: '#333', paddingHorizontal: 16, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 12, borderWidth: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  halfInput: { flex: 1, marginRight: 10 },
  inputContainer: { flex: 1 },
  pickerContainer: { borderWidth: 0, borderRadius: 10, backgroundColor: '#f9f9f9', justifyContent: 'center', marginBottom: 0 },
  picker: { height: 50, color: '#333' },
  pickerItem: { height: 50 }, // For iOS styling
  serviceListContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  serviceItemContainer: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 15, color: '#333', flex: 1, fontWeight: '500' },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingLeft: 0 },
  priceLabel: { fontSize: 14, color: '#555', marginRight: 8 },
  priceInput: { flex: 1, height: 40, borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff', fontSize: 15 },
  button: { height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 5, },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoSection: {
    backgroundColor: '#E0F2F1',
    borderColor: '#005C70',
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
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
});