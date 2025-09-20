// /app/(tabs)/settings/index.tsx
import RotatingLoader from '@/components/RotatingLoader';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router'; // <--- CHANGE: Removed useFocusEffect
import React, { useEffect, useState } from 'react'; // <--- CHANGE: Import useEffect
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// The API base URL from your environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const AccountScreen = () => {
  // Get user info and authentication methods from Clerk
  const { user } = useUser();
  // --- CHANGE: Destructure isSignedIn as well ---
  const { signOut, getToken, isSignedIn } = useAuth();

  // State to hold the user's roles fetched from your API
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  console.log('🔍 Debug Info:');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('isSignedIn:', isSignedIn);
  console.log('user exists:', !!user);
  
  const fetchRoles = async () => {
    if (!isSignedIn) {
      console.log('❌ User not signed in');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token?.substring(0, 20) + '...');
      
      if (!token) {
        console.log('❌ No token available');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/my-roles`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`❌ API Error: Status ${response.status}, Body: ${errorBody}`);
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Roles fetched:', data.roles);
      setUserRoles(data.roles || []);
    } catch (error) {
      console.error('💥 Fetch roles error:', error);
      setUserRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchRoles();
}, [isSignedIn]);// <--- The dependency array is crucial to break the loop

  
  // Logout handler with a confirmation dialog
  const handleSignOut = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout",
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/signin');
            } catch (err) {
              console.error("Error signing out:", err);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const settingsOptions = [
    { icon: 'cog-outline', label: 'Settings' },
    { icon: 'domain', label: 'Your Business Profile', subtitle: 'Set up your Lift-Me business profile', link: "/settings/add-business/businesssetup/businesspage" },
    { icon: 'car-outline', label: 'Manage Vehicles', link: '/settings/vehicle-page/vehicle-board' },
    { icon: 'car-outline', label: 'Premium Account', subtitle: 'Get more features ', link: "/settings/premium" },
    { icon: 'umbrella-outline', label: 'Rider insurance', subtitle: '₹10L cover for ₹3/trip' },
    { icon: 'logout', label: 'Logout' },
  ];

  const isAdmin = userRoles.includes('ADMIN');

  if (isAdmin) {
    settingsOptions.splice(1, 0, {
      icon: 'shield-crown-outline',
      label: 'Admin Dashboard',
      subtitle: 'Review and manage applications',
      link: '/settings/(admin)/admin-dashboard',
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{user?.firstName || 'User'}</Text>
          <View style={styles.ratingBox}>
            <Icon name="star" size={14} color="#fff" />
            <Text style={styles.rating}>5.0</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          {['Help', 'Wallet', 'Activity'].map((item, index) => (
            <TouchableOpacity key={index} style={styles.actionBtn}>
              <Icon name={item === 'Help' ? 'lifebuoy' : item === 'Wallet' ? 'wallet-outline' : 'history'} size={24} color="#fff" />
              <Text style={styles.actionLabel}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 }}>
              <RotatingLoader size={30} color="#000000" />
            </View>
          ) : (
            settingsOptions.map((item, index) => (
              <TouchableOpacity
                key={`${item.label}-${index}`}
                style={styles.row}
                onPress={() => {
                  if (item.label === 'Logout') {
                    handleSignOut();
                  } else if (item.link) {
                    router.push(item.link as any);
                  }
                }}
              >
                <Icon name={item.icon} size={22} color="#000" style={styles.rowIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.subtitle && <Text style={styles.rowSubtitle}>{item.subtitle}</Text>}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Text style={styles.version}>v4.572.10005</Text>
      </ScrollView>
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20, marginTop: 50, },
  content: { padding: 16, },
  header: { marginBottom: 20, },
  name: { fontSize: 24, color: '#000', fontWeight: 'bold', },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2d2d2d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, marginTop: 4, alignSelf: 'flex-start', },
  rating: { color: '#fff', marginLeft: 4, },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, },
  actionBtn: { backgroundColor: '#1e1e1e', padding: 16, borderRadius: 12, alignItems: 'center', flex: 1, marginHorizontal: 4, },
  actionLabel: { color: '#fff', marginTop: 8, fontSize: 12, },
  section: { marginBottom: 32,marginTop:22 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomColor: '#e0e0e0', borderBottomWidth: 1, },
  rowIcon: { marginRight: 16, },
  rowLabel: { color: '#000', fontSize: 16, },
  rowSubtitle: { color: '#666', fontSize: 12, marginTop: 2, },
  version: { textAlign: 'center', color: '#555', fontSize: 12, marginBottom: 20, },
});