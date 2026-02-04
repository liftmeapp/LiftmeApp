import { Stack } from 'expo-router';
import React from 'react';

export default function BusinessSetupLayout() {
    return (
        <Stack>
            <Stack.Screen name="towtruck-signup" options={{ headerShown: false, title: "Step 1: Vehicle Details" }} />
            <Stack.Screen name='edit-tow-truck' options={{ headerShown: false }} />
            <Stack.Screen name='tow-truck-live-tracking' options={{ headerShown: false }} />
        </Stack>
    );
}