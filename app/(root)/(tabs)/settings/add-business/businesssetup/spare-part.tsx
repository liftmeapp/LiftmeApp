import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView
} from 'react-native';

export default function AddSparePartScreen() {
  const [partName, setPartName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [amount, setAmount] = useState('');
  const [sparesAvailable, setSparesAvailable] = useState('');

  const handleAddPart = () => {
    console.log({ partName, make, model, year, amount, sparesAvailable });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Add Spare part details</Text>

      <TextInput
        style={styles.input}
        placeholder="Part Name"
        value={partName}
        onChangeText={setPartName}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Make"
          value={make}
          onChangeText={setMake}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Model"
          value={model}
          onChangeText={setModel}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Year"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="$ Spare Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Spares Available"
        value={sparesAvailable}
        onChangeText={setSparesAvailable}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddPart}>
        <Text style={styles.buttonText}>Add Part</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#eb8a65',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
