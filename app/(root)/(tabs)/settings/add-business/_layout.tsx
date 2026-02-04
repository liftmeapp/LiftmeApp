import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function AddBusinessLayout() {
  const router = useRouter();

  const CustomBackButton = () => (
    <TouchableOpacity
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/settings' as any);
        }
      }}
      style={{ marginLeft: 0, paddingRight: 15 }}
    >
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
  );

  return (
    <Stack>
      <Stack.Screen
        name="businesssetup/businesspage"
        options={{
          title: "Business Hub",
          headerLeft: () => <CustomBackButton />,
          headerShown: true
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
