import Coupons from "@/components/Coupons";
import NavOptions from "@/components/NavOptions";
import NavOptionSec from "@/components/NavOptionSec";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Index() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const navigateToProfile = () => {
    router.push('/(tabs)/profile' as never);
    setMenuVisible(false);
  };

  const navigateToBusinessSetup = () => {
    router.push('/settings/add-business/businesssetup/businesspage' as never);
    setMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu}>
            <Icon name="menu" size={30} color="#333" />
          </TouchableOpacity>
          {/* Menu Modal */}
          <Modal
            transparent={true}
            animationType="fade"
            visible={menuVisible}
            onRequestClose={() => setMenuVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            >
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={navigateToProfile}
                >
                  <Icon name="account" size={20} color="#333" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={navigateToBusinessSetup}
                >
                  <Icon name="store" size={20} color="#333" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Business Page</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={[styles.menuItem, styles.logoutItem]}
                  onPress={handleSignOut}
                >
                  <Icon name="logout" size={20} color="#e74c3c" style={styles.menuIcon} />
                  <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hai, {user?.firstName || 'User'}</Text>
        </View>

        {/* Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.sectionDivider} />
        </View>
        <NavOptions />

        {/* Other Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Other Services</Text>
          <View style={styles.sectionDivider} />
        </View>
        <NavOptionSec />

        {/* Coupons Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coupons</Text>
          <View style={styles.sectionDivider} />
        </View>
        <Coupons />

        {/* Bottom Padding for Tab Bar */}
        <View style={{ height: 100 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingContainer: {
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#005C70',
    fontWeight: '600',
    marginRight: 10,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 50,
    alignItems: 'flex-start', // Changed to left side for hamburger
    paddingLeft: 20,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 200,
    paddingVertical: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuIcon: {
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 2,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutText: {
    color: '#e74c3c',
  },
});
