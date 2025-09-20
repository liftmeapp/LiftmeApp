// app/(root)/(tabs)/profile.tsx (or your chosen path for the profile screen)
import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import CustomButton from '@/components/CustomButton'; // Assuming you have this

// Fallback profile image if user.imageUrl is not available
// const defaultProfileImage = require('@/assets/images/profile.png'); // Ensure this path is correct

export default function ProfileScreen() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const onSignOutPress = async () => {
    try {
      await signOut();
      // `SignedOut` in your root layout will handle redirection to the sign-in screen.
      // Optionally, you can navigate explicitly if needed:
      // router.replace('/(auth)/signin');
    } catch (err: any) {
      Alert.alert("Sign Out Error", err.errors?.[0]?.message || "Failed to sign out.");
      console.error("Sign Out Error:", err);
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#b95528" />
      </SafeAreaView>
    );
  }

  if (!isSignedIn || !user) {
    // This case should ideally be handled by your <SignedIn> <SignedOut> logic in _layout
    // But as a fallback:
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text>Not signed in.</Text>
        <CustomButton title="Go to Sign In" onPress={() => router.replace('/(auth)/signin')} />
      </SafeAreaView>
    );
  }

  // User's physical address (Mukkom, Calicut, 673602) is not stored in Clerk by default.
  // You would fetch this from your own backend database (Prisma/MongoDB)
  // For now, we'll just display what Clerk provides.

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={user.imageUrl ? { uri: user.imageUrl } :  require('@/assets/images/profile.jpg')}
          style={styles.profileImage}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.name}>
            {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'}
          </Text>
          {user.primaryEmailAddress?.emailAddress && (
            <Text style={styles.contactInfo}>{user.primaryEmailAddress.emailAddress}</Text>
          )}
          {user.primaryPhoneNumber?.phoneNumber && (
            <Text style={styles.contactInfo}>{user.primaryPhoneNumber.phoneNumber}</Text>
          )}
          {/* To display custom address, you'd fetch it:
          <Text style={styles.address}>Mukkom, Calicut</Text>
          <Text style={styles.address}>673602</Text>
          */}
        </View>
      </View>

      {/* Link to Clerk's User Profile Management (Optional but good) */}
      <TouchableOpacity
        style={styles.manageAccountButton}
        onPress={() => {
          if (router.canGoBack())router.back(); // A bit of a hack, Clerk's <UserProfile/> component is designed for web routes
          Alert.alert("Manage Account", "Typically, you'd link to Clerk's hosted user profile page or build custom forms to edit data stored in your backend.");
        }}
      >
        <Text style={styles.manageAccountButtonText}>Manage Account</Text>
      </TouchableOpacity>


      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Service Summary</Text>
      {/* Add your service summary content here */}
      <Text style={styles.placeholderText}>Your service history and summaries will appear here.</Text>


      <View style={styles.signOutButtonContainer}>
        <CustomButton
            title="Sign Out"
            onPress={onSignOutPress}
            className="bg-red-500" // Example: different style for sign out
         />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  profileDetails: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 20, // Increased size
    marginBottom: 6,
    color: '#333',
  },
  contactInfo: {
    color: '#555',
    fontSize: 14,
    marginBottom: 3,
  },
  address: { // Style for custom address if you add it
    color: '#555',
    fontSize: 14,
  },
  manageAccountButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start', // Or 'stretch' for full width
    marginBottom: 20,
  },
  manageAccountButtonText: {
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18, // Adjusted size
    marginBottom: 12, // Added margin
    color: '#333',
  },
  placeholderText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  signOutButtonContainer: {
    marginTop: 'auto', // Pushes the button to the bottom
    paddingBottom: 10, // Some padding from the very bottom edge
  },
  // You might want a specific style for the sign out button if CustomButton doesn't handle it via className
  // signOutButton: {
  //   backgroundColor: '#d9534f', // Red color for sign out
  //   paddingVertical: 12,
  //   borderRadius: 8,
  //   alignItems: 'center',
  // },
  // signOutButtonText: {
  //   color: '#fff',
  //   fontWeight: 'bold',
  //   fontSize: 16,
  // }
});