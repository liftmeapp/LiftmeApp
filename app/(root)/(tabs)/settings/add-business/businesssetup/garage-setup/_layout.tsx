
import { Stack } from 'expo-router';

export default function GarageSetupLayout() {
  return (
    <Stack>
      <Stack.Screen name="garage-sign" options={{ headerShown: false }} />
      <Stack.Screen name="addservices" options={{ headerShown: false }} />
    </Stack>
  );
}