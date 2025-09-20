import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function PremiumScreen() {
  const handleSubscribe = async () => {
    try {
      // Replace with your backend URL to create a Stripe Checkout session
      const response = await fetch("https://your-backend.com/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium_monthly" }),
      });

      const data = await response.json();
      if (data?.url) {
        Linking.openURL(data.url);
      } else {
        Alert.alert("Error", "Could not initiate payment.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const features = [
    {
      title: "Add Multiple Vehicles",
      description: "Easily register and manage multiple cars up to 20 for your business under one premium account for added convenience.",
    },
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
        <Text style={styles.price}>$79/month</Text>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeText}>Subscribe</Text>
        </TouchableOpacity>
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
  },
  subscribeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
