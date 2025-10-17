
// app/(root)/(tabs)/settings/help.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const HelpScreen = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Help & Support' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>About Lift-Me</Text>
        <Text style={styles.paragraph}>
          Welcome to Lift-Me, your one-stop solution for quick, convenient, and reliable towing and roadside assistance. Whether you're stranded with a flat tire, need a jump start, or require a tow to the nearest garage, we're here to help, 24/7.
        </Text>

        <Text style={styles.subheader}>Our Services</Text>
        <Text style={styles.paragraph}>
          - <Text style={styles.bold}>Towing Services:</Text> Quick and damage-free towing for cars and bikes.
        </Text>
        <Text style={styles.paragraph}>
          - <Text style={styles.bold}>Roadside Assistance:</Text> Flat tire changes, battery jump-starts, fuel delivery, and lockout services.
        </Text>
        <Text style={styles.paragraph}>
          - <Text style={styles.bold}>Garage Network:</Text> Connections to a wide network of trusted local garages for repairs.
        </Text>
        <Text style={styles.paragraph}>
          - <Text style={styles.bold}>Spare Parts:</Text> Find and order spare parts directly through the app.
        </Text>

        <Text style={styles.subheader}>How It Works</Text>
        <Text style={styles.paragraph}>
          1. <Text style={styles.bold}>Request Help:</Text> Open the app and select the service you need. Pinpoint your location on the map.
        </Text>
        <Text style={styles.paragraph}>
          2. <Text style={styles.bold}>Get Matched:</Text> We'll instantly connect you with the nearest available service provider.
        </Text>
        <Text style={styles.paragraph}>
          3. <Text style={styles.bold}>Track Your Ride:</Text> Watch your tow truck or mechanic arrive in real-time.
        </Text>
        <Text style={styles.paragraph}>
          4. <Text style={styles.bold}>Pay Seamlessly:</Text> Handle payments securely and directly within the app.
        </Text>

        <Text style={styles.subheader}>Contact Us</Text>
        <Text style={styles.paragraph}>
          For any issues or feedback, please don't hesitate to reach out to our support team at <Text style={styles.link}>info@liftme.co.in</Text>.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  subheader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  link: {
    color: '#b95528',
    fontWeight: 'bold',
  },
});

export default HelpScreen;
