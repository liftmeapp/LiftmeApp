import { useAuth } from "@clerk/clerk-expo";
import { FontAwesome5 } from "@expo/vector-icons";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function PremiumScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { getToken } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const token = await getToken();
      // 1. Create a payment intent on the server
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-premium-intent`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const { clientSecret, error: intentError } = await response.json();
      if (intentError) throw new Error(intentError);

      // 2. Initialize the payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Afthuliftme Inc.',
      });
      if (initError) throw new Error(initError.message);

      // 3. Present the payment sheet
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          throw new Error(presentError.message);
        }
        setIsSubscribing(false);
        return; // User cancelled
      }
      Alert.alert("Payment Successful", "You are now a premium member!");
      setIsPremium(true);

    } catch (error: any) {
      Alert.alert("Subscription Failed", error.message || "An unknown error occurred.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const features = [
    {
      title: "Priority & Fast-Track Assistance",
      description: "Get faster response times and skip the queue with priority support on all service requests.",
    },
    {
      title: "24/7 Dedicated Support",
      description: "Access round-the-clock customer service from our dedicated premium support team.",
    },
    {
      title: "Exclusive Discounts & Offers",
      description: "Enjoy special pricing and member-only deals on select roadside services and partner garages.",
    },
    {
      title: "Free Towing Up to X km/mi per Month",
      description: "Get complimentary towing services within a fixed distance each month as part of your premium benefits.",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Features</Text>
      <ScrollView style={styles.scrollContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureContainer}>
            <FontAwesome5 name="bolt" size={20} color="black" style={styles.icon} />
            <View style={styles.textWrapper}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        {isPremium ? (
          <View style={styles.premiumMemberContainer}>
            <FontAwesome5 name="crown" size={24} color="#FFD700" />
            <Text style={styles.premiumMemberText}>You are now a premium member!</Text>
          </View>
        ) : (
          <>
            <Text style={styles.price}>Rs 179/month</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe} disabled={isSubscribing}>
              {isSubscribing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.subscribeText}>Subscribe</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default function PremiumScreenWrapper() {
  const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!STRIPE_KEY) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Stripe configuration error.</Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <PremiumScreen />
    </StripeProvider>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  scrollContainer: { flex: 1 },
  featureContainer: { flexDirection: "row", marginBottom: 20, alignItems: "flex-start" },
  icon: { marginRight: 10, marginTop: 4 },
  textWrapper: { flex: 1 },
  featureTitle: { fontWeight: "bold", fontSize: 16 },
  featureDescription: { fontSize: 14, color: "#333", marginTop: 4 },
  footer: { alignItems: "center", paddingVertical: 20 },
  price: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subscribeButton: {
    backgroundColor: "#635BFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    minHeight: 48, // Ensure button height is consistent
    justifyContent: 'center',
  },
  subscribeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  premiumMemberContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eaf8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bde0fe',
  },
  premiumMemberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005f99',
    marginTop: 10,
    textAlign: 'center',
  },
});
