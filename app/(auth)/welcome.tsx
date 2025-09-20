import { onboarding } from "@/constants"; // assuming onboarding[0] is the one you want
import { router } from "expo-router";
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");


const Home = () => {
  const item = onboarding[0]; // only show the first item
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 relative">
      <ImageBackground
        source={require("@/assets/images/screen.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      </View>
      {/* Button */}
      <View className="items-center justify-center ">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/signup");
          console.log("Get Started");
        }}
        className="w-[12rem] mt-10 bg-[#7b381a]  absolute bottom-16 mb-20 rounded-none py-3 px-4 opacity-80 shadow-lg "
        >
          <Text className=" w-full text-white font-extrabold text-xl text-center">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;

