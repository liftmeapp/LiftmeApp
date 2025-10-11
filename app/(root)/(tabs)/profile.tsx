// app/(root)/(tabs)/profile.tsx
import CustomButton from '@/components/CustomButton';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Order } from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function ProfileScreen() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const isFetchingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        // Guard 1: Prevent stacking fetches if one is already running
        if (isFetchingRef.current) {
          console.log('[ProfileScreen] Fetch already in progress, skipping.');
          return;
        }

        // Guard 2: Don't fetch if not signed in
        if (!isSignedIn || !user?.id) {
          console.log('[ProfileScreen] Not signed in, skipping fetch.');
          // If user is not signed in, we are not loading anything.
          setLoadingHistory(false); 
          return;
        }

        try {
          console.log('[ProfileScreen] Starting history fetch...');
          isFetchingRef.current = true;
          setLoadingHistory(true);

          const token = await getToken();
          if (!token) throw new Error("Authentication token not found.");
          
          const response = await fetch(`${API_BASE_URL}/api/bookings/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch history: ${errorBody}`);
          }

          const data = await response.json();
          console.log('[ProfileScreen] History fetched successfully.');
          setOrderHistory(data);

        } catch (error: any) {
          console.error('[ProfileScreen] Error fetching history:', error.message);
          Alert.alert('Error', 'Could not load your order history.');
        } finally {
          // IMPORTANT: Always release the lock and loading state
          isFetchingRef.current = false;
          setLoadingHistory(false);
        }
      };
      fetchData();
      return () => {
        console.log('[ProfileScreen] Screen blurred.');
        };
    }, [isSignedIn, user?.id]) 
  );

  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#b95528" />
      </View>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Not signed in.</Text>
        <CustomButton title="Go to Sign In" onPress={() => router.replace('/(auth)/signin')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={user.imageUrl ? { uri: user.imageUrl } : require('@/assets/images/profile.jpg')}
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
        </View>
      </View>

      <TouchableOpacity
        style={styles.manageAccountButton}
      onPress={() => router.push('/(root)/(tabs)/settings/usersettings')}
      >
        <Text style={styles.manageAccountButtonText}>Manage Account</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Service Summary</Text>
      {loadingHistory ? (
        <ActivityIndicator size="large" color="#b95528" style={{ marginTop: 20 }} />
      ) : orderHistory.length > 0 ? (
        <FlatList
          data={orderHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderHistoryCard order={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={profileStyles.orderList}
        />
      ) : (
        <Text style={styles.placeholderText}>You have no past orders.</Text>
      )}
    </View>
  );
}

const OrderHistoryCard = ({ order }: { order: any }) => {
  const providerName = order.garage?.name || order.towTruck?.name || 'N/A';
  const serviceName = order.service?.name || 'Towing Service';
  const amount = order.finalAmount?.toFixed(2) || '0.00';
  const status = order.status?.replace('_', ' ') || 'N/A';

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case 'COMPLETED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      case 'EXPIRED': return '#ffc107';
      case 'AWAITING_PAYMENT': return '#007bff';
      default: return '#6c757d';
    }
  };

  return (
    <View style={profileStyles.orderCard}>
      <View style={profileStyles.orderCardHeader}>
        <Text style={profileStyles.orderService}>{serviceName}</Text>
        <Text style={[profileStyles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>{status}</Text>
      </View>
      <View style={profileStyles.orderCardBody}>
        <Text style={profileStyles.orderProvider}>Provider: {providerName}</Text>
        <Text style={profileStyles.orderAmount}>Amount: INR {amount}</Text>
        <Text style={profileStyles.orderDate}>Booked: {new Date(order.bookedAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

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
    fontSize: 20,
    marginBottom: 6,
    color: '#333',
  },
  contactInfo: {
    color: '#555',
    fontSize: 14,
    marginBottom: 3,
  },
  address: {
    color: '#555',
    fontSize: 14,
  },
  manageAccountButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
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
    fontSize: 18,
    marginBottom: 12,
    color: '#333',
  },
  placeholderText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  signOutButtonContainer: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});

const profileStyles = StyleSheet.create({
  orderList: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderService: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  orderCardBody: {},
  orderProvider: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#777',
  },
});