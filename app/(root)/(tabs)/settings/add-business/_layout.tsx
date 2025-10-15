import { Stack } from "expo-router";

export default function AddBusinessLayout() { // Renamed component for clarity
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="businesssetup/businesspage"
        options={{
          headerShown: true,
          title: "Business Hub",
        }}
      />
    </Stack>
  );
}