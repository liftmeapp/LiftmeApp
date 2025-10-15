import Coupons from "@/components/Coupons";
import NavOptions from "@/components/NavOptions";
import NavOptionSec from "@/components/NavOptionSec";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


export default function Index() {
  const dummyData = [{ id: "dummy" }]; // required to make FlatList render
  const { signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  
  const handleSignOut = async () => {
    try {
        console.log("Sign out: Initiating...");
        await signOut();
        console.log("Sign out: Clerk signOut complete.");
        // Navigate to sign in page after successful sign out
        router.replace('/(auth)/signin'); // Ensure this path is correct and recognized by InitialLayout as public
    } catch (error) {
        console.error('Error signing out:', error);
    }
};

  const router = useRouter();
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  const navigateToProfile = () => {
    router.push('/(tabs)/profile' as never);
    setMenuVisible(false);
  };

  const navigateToBusinessSetup = () => {
    router.push('/(tabs)/settings/add-business/businesssetup/businesspage' as never);
    setMenuVisible(false);
};

  return (
    <SafeAreaView>
      <View>
      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={null}
        ListHeaderComponent={() => (
          <View>
            <View className="flex flex-row justify-between items-center py-2 px-3">
              <Image
                source={require('@/assets/images/lml.png')}
                className="w-[11rem] h-[6rem] top-2 mb-1"
              />
              <View>
                <TouchableOpacity onPress={toggleMenu}>
                  <Icon 
                    name="dots-vertical" 
                    size={24} 
                    color="#000" 
                    style={{
                      paddingRight: 15,
                    }}
                  />
                </TouchableOpacity>
                
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
            </View>
            <View>
            </View>
            <View>
            <Text
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
              className="text-xl font-semibold text-slate-700 ml-3 mb-4 mt-12"
            >
              Services
            </Text>
            <NavOptions />
            <NavOptionSec />
            </View>
            <View>
            <Text
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
              className="text-xl flex justify-end font-bold text-pretty text-slate-700 opacity-80 ml-3 mb-2"
            >
              Coupons
            </Text>
            <Coupons />
            </View>
          </View>
        )}
      />
    </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 50,
    alignItems: 'flex-end',
    paddingRight: 15,
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
