import { Stack } from 'expo-router';
import React from 'react';

export default function UserSettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'User Profile', headerShown: false }} />
    </Stack>
  );
}
