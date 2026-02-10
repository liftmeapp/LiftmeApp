import { useAuth, useUser } from "@clerk/clerk-expo";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RazorpayCheckout from 'react-native-razorpay';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function PremiumScreen() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState(false); // Ideally fetch this from user profile
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const token = await getToken();
      // 1. Create a Razorpay Order on the server
      const response = await fetch(`${API_BASE_URL}/api/razorpay/create-premium-order`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create subscription order.");
      }

      // 2. Open Razorpay Checkout
      const options = {
        description: 'Premium Subscription',
        image: 'https://your-logo-url.com/logo.png', // Replace with your logo
        currency: orderData.currency,
        key: orderData.key,
        amount: orderData.amount,
        name: 'Afthu Lift Me',
        order_id: orderData.orderId,
        prefill: {
          email: user?.emailAddresses[0]?.emailAddress,
          contact: user?.phoneNumbers[0]?.phoneNumber,
          name: user?.fullName || ''
        },
        theme: { color: '#635BFF' }
      };

      const data = await RazorpayCheckout.open(options);

      // 3. Verify Payment (Optional but recommended: Verify signature on backend)
      // For now, we assume success if checkout returns without error and we get payment_id
      // In production, send data.razorpay_signature to backend for verification.

      console.log("Payment Success:", data);
      Alert.alert("Payment Successful", "You are now a premium member!");
      setIsPremium(true);

    } catch (error: any) {
      if (error.code === 'PAYMENT_CANCELLED') {
        console.log("User cancelled payment");
      } else {
        Alert.alert("Subscription Failed", error.description || error.message || "An unknown error occurred.");
      }
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
    minHeight: 48,
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
