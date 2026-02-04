
import { Stack, useRouter } from "expo-router";
import { HeaderBackButton } from "@react-navigation/elements";
import "../../global.css";

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <HeaderBackButton onPress={() => router.canGoBack() && router.back()} />
        ),
      }}
    >
      <Stack.Screen name="roadsidecar-service" options={{ title: "Roadside Car Service" }}/>
      <Stack.Screen name="roadsidebike-service" options={{ title: "Roadside Bike Service" }}/>
      <Stack.Screen name="homeservice" options={{ title: "Home Service" }}/>
      <Stack.Screen name="service-map" options={{ title: "Service Map" }}/>
      <Stack.Screen name="garages" options={{ title: "Garages" }}/>
      <Stack.Screen name="towing_service" options={{ title: "Towing Service" }}/>
      <Stack.Screen name="luxury-service" options={{ title: "SUV Service" }}/>
      <Stack.Screen name="electric-vehicleservice" options={{ title: "Electric Vehicle Service" }}/>
    </Stack>
  );
};
