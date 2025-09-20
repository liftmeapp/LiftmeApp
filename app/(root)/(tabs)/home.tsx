import Coupons from "@/components/Coupons";
import NavOptions from "@/components/NavOptions";
import NavOptionSec from "@/components/NavOptionSec";
import SearchBar from "@/components/SearchBar";
import { useClerk } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Index() {
  const dummyData = [{ id: "dummy" }]; // required to make FlatList render
  const { signOut } = useClerk();

  // Handle sign out functionality
  const handleSignOut = async () => {
    try {
        console.log("Sign out: Initiating...");
        await signOut();
        console.log("Sign out: Clerk signOut complete.");
        // Navigate to sign in page after successful sign out
        router.replace('/(auth)/signin'); // Ensure this path is correct and recognized by InitialLayout as public
        console.log("Sign out: Navigation to /signin initiated.");
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
  
  return (
    <SafeAreaView className="bg-white">
      <View className="h-[100%]">
      <FlatList
        showsVerticalScrollIndicator={false}
        renderItem={null}
        ListHeaderComponent={() => (
          <View className="h-[100%]">
            <View className="flex flex-row justify-between items-center py-2 px-3">
              <Image
                source={require('@/assets/images/lml.png')}
                className="w-[11rem] h-[6rem] top-2 mb-1"
              />
              <TouchableOpacity onPress={handleSignOut}>
                <Icon 
                  name="logout" 
                  size={24} 
                  color="#000" 
                  style={{
                    paddingRight: 15,
                  }}
                />
              </TouchableOpacity>
            </View>
            <View>
              <SearchBar />
              <View className="flex flex-row justify-start">
              </View>
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

