
import { Stack } from "expo-router";
import "../../global.css"

export default function RootLayout() {

  return (
    <Stack>
      <Stack.Screen name="roadsidecar-service" options={{ headerShown: false }}/>
      <Stack.Screen name="roadsidebike-service" options={{ headerShown: false }}/>
      <Stack.Screen name="homeservice" options={{ headerShown: false }}/>
      <Stack.Screen name="service-map" options={{ headerShown: false }}/>
      <Stack.Screen name="garages" options={{ headerShown: false }}/>
    </Stack>
  );
};
