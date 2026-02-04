// app/(root)/(tabs)/profile.tsx
import CustomButton from '@/components/CustomButton';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Order } from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type FilterStatus = 'ALL' | 'COMPLETED' | 'CANCELLED';

export default function ProfileScreen() {
  const { isLoaded: isClerkLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [dbUser, setDbUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [filteredOrderHistory, setFilteredOrderHistory] = useState<Order[]>([]);

  const isFetchingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (isFetchingRef.current) return;
        if (!isSignedIn || !user?.id) {
          setIsLoading(false);
          return;
        }

        isFetchingRef.current = true;
        setIsLoading(true);

        try {
          const token = await getToken();
          if (!token) throw new Error("Authentication token not found.");

          const [historyResponse, profileResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/bookings/history`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/api/users/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setDbUser(profileData);
          }

          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setOrderHistory(historyData);
          }

        } catch (error: any) {
          console.error('[ProfileScreen] Error fetching data:', error.message);
        } finally {
          isFetchingRef.current = false;
          setIsLoading(false);
        }
      };
      fetchData();
      return () => {
        isFetchingRef.current = false;
      };
    }, [isSignedIn, user?.id])
  );

  useEffect(() => {
    if (filterStatus === 'ALL') {
      setFilteredOrderHistory(orderHistory);
    } else {
      const filtered = orderHistory.filter(order => order.status === filterStatus);
      setFilteredOrderHistory(filtered);
    }
  }, [orderHistory, filterStatus]);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (dbUser?.firstName ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() : 'User');

  const displayEmail = user?.primaryEmailAddress?.emailAddress || '';
  const displayPhone = user?.primaryPhoneNumber?.phoneNumber || '';

  if (!isClerkLoaded || isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#005C70" />
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

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {(['ALL', 'COMPLETED', 'CANCELLED'] as FilterStatus[]).map((status) => (
        <TouchableOpacity
          key={status}
          style={[styles.filterButton, filterStatus === status && styles.activeFilter]}
          onPress={() => setFilterStatus(status)}
        >
          <Text style={[styles.filterButtonText, filterStatus === status && styles.activeFilterText]}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={user.imageUrl ? { uri: user.imageUrl } : require('@/assets/images/profile.jpg')}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.contactInfo}>{displayEmail}</Text>
        <Text style={styles.contactInfo}>{displayPhone}</Text>

        <TouchableOpacity
          style={styles.manageAccountButton}
          onPress={() => router.push('/(root)/(tabs)/settings/usersettings')}
        >
          <Text style={styles.manageAccountButtonText}>Manage Account</Text>
        </TouchableOpacity>
      </View>

      {/* Service Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Service Summary</Text>
          {renderFilterButtons()}
        </View>

        {filteredOrderHistory.length > 0 ? (
          <FlatList
            data={filteredOrderHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OrderHistoryCard order={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.placeholderText}>
              {orderHistory.length === 0
                ? 'You have no past orders.'
                : `You have no ${filterStatus.toLowerCase()} orders.`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const OrderHistoryCard = ({ order }: { order: any }) => {
  const status = order.status?.replace('_', ' ') || 'N/A';

  // Logic to determine display values (Price, Provider, etc.)
  // Simplified for brevity, ensuring key fields are shown
  let title = order.service?.name || 'Service Booking';
  let providerName = order.garage?.name || order.towTruck?.name || 'Beautiful Garage 101'; // Fallback for demo
  const bookingDate = new Date(order.bookedAt).toLocaleDateString("en-GB"); // DD/MM/YYYY

  // Format Price
  const finalPrice = order.finalAmount || order.basePrice || order.jobEstimate || 0;

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case 'COMPLETED': return '#74B768'; // Green
      case 'CANCELLED': return '#FF7F50'; // Orange
      default: return '#005C70'; // Teal
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      <View style={styles.divider} />

      <View style={styles.cardRow}>
        <Text style={styles.label}>Provider : </Text>
        <Text style={styles.value}>{providerName}</Text>
        <Text style={styles.price}>INR {finalPrice.toFixed(2)}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Booked : </Text>
        <Text style={styles.value}>{bookingDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  avatarContainer: {
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 50,
    elevation: 5,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 14,
    color: '#666',
  },
  manageAccountButton: {
    backgroundColor: '#005C70',
    width: '90%',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  manageAccountButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  summaryContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005C70',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 3,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  activeFilter: {
    backgroundColor: '#005C70',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  placeholderText: {
    color: '#999',
  },
  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#005C70',
    opacity: 0.2,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  label: {
    color: '#888',
    fontSize: 14,
  },
  value: {
    color: '#888',
    fontSize: 14,
    flex: 1,
  },
  price: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
});
