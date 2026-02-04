// /app/(tabs)/settings/index.tsx
import RotatingLoader from '@/components/RotatingLoader';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const AccountScreen = () => {
  const { user } = useUser();
  const { signOut, getToken, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!isSignedIn) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/users/my-roles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (!response.ok) throw new Error('Failed to fetch roles');

        const data = await response.json();
        setUserRoles(data.roles || []);
      } catch (error) {
        console.error('Fetch roles error:', error);
        setUserRoles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, [isSignedIn]);

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
    { icon: 'cog-outline', label: 'Profile-Settings', link: '/settings/usersettings' },
    { icon: 'domain', label: 'Your Business Profile', subtitle: 'Set up your Lift-Me business profile', link: "/settings/add-business/businesssetup/businesspage" },
    { icon: 'car-outline', label: 'Manage Vehicles', link: '/settings/vehicle-page/vehicle-board' },
    { icon: 'wallet-outline', label: 'Manage Payment Methods', link: '/settings/payments' },
    { icon: 'star-outline', label: 'Premium Account', subtitle: 'Get more features', link: "/settings/premium" },
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(root)/(tabs)/settings/help')}>
            <Icon name="lifebuoy" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(root)/(tabs)/settings/payments')}>
            <Icon name="wallet-outline" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(root)/(tabs)/profile')}>
            <Icon name="history" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Activity</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <RotatingLoader size={40} color="#005C70" />
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
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={20} color="#005C70" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.subtitle && <Text style={styles.rowSubtitle}>{item.subtitle}</Text>}
                </View>
                <Icon name="chevron-right" size={20} color="#ccc" />
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
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0', // Light gray background matching other pages
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 34,
    color: '#005C70',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12, // Increased gap slightly
  },
  actionBtn: {
    backgroundColor: '#005C70', // Teal Background
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#005C70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  actionLabel: {
    color: '#fff',
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
    minHeight: 200, // Ensure min height for loader
    justifyContent: 'center', // Center content vertically if needed (mostly for loader)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // List Row Style
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E0F2F1', // Light teal background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rowLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500'
  },
  rowSubtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginBottom: 20,
  },
});