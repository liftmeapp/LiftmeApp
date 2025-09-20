// /app/(root)/(tabs)/settings/add-business/businesssetup/edit-tow-truck/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function EditTowTruckLayout() {
  return (
    <Stack>
      <Stack.Screen name="edit-tow-truck-details" options={{ title: 'Edit Tow Truck' }} />
    </Stack>
  );
}
