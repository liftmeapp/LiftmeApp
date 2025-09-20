// app/(tabs)/settings/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';

// This TabIcon component is now defined here to be used for the tab bar button.
// You could also move this to a shared component file and import it in both layouts.
const TabIcon = ({ source, focused }: { source: ImageSourcePropType, focused: boolean }) => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={source}
        resizeMode="contain"
        style={{
          width: 28, height: 28,
          tintColor: focused ? '#000000' : '#7b381a', // Example colors
        }}
      />
    </View>
);

export default function SettingsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
       <Stack.Screen name="vehicle-page/add-vehicle" options={{ headerShown: false }} />
       <Stack.Screen name="vehicle-page/vehicle-board" options={{ headerShown: false }} />
       <Stack.Screen name="add-business/businesssetup/businesspage" options={{ headerShown: false }} />
       <Stack.Screen name="premium" options={{ headerShown: false }} />
       {/* The admin dashboard is in a different layout group `(admin)`, so it should not be listed here. */}
    </Stack>
  );
}