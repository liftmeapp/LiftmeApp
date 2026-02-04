import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

const WelcomeScreen = () => {
  const router = useRouter();

  const handlePress = () => {
    router.replace("/(auth)/signup");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/icons/Liftme App icon black.png")} // Updated logo
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Loading Bar at the bottom */}
        <View style={styles.loaderContainer}>
          <View style={styles.loaderBar}>
            <View style={styles.loaderProgress} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#005C70", // Deep Teal color
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  loaderContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 50, // Space from bottom
  },
  loaderBar: {
    width: width * 0.6,
    height: 6,
    backgroundColor: "#004252", // Darker shade for track
    borderRadius: 3,
    overflow: "hidden",
  },
  loaderProgress: {
    width: "50%", // Fixed partial progress as shown in static design
    height: "100%",
    backgroundColor: "#2AB5D1", // Bright Cyan/Blue for progress
    borderRadius: 3,
  },
});

export default WelcomeScreen;

