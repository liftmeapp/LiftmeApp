import { Stack } from "expo-router";

export default function AddBusinessLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="businesssetup/businesspage"
        options={{
          title: "Business Hub",
        }}
      />
      <Stack.Screen
        name="garage-dashboard"
        options={{
          title: "Garage Dashboard",
        }}
      />
      <Stack.Screen
        name="tow-truck-dashboard"
        options={{
          title: "Tow-Truck Dashboard",
        }}
      />
       <Stack.Screen
        name="businesssetup/spare-part"
        options={{
          title: "My Spare Parts Store",
        }}
      />
      <Stack.Screen
        name="businesssetup/add-spare-part"
        options={{
          title: "List a New Part",
        }}
      />
    </Stack>
  );
}
