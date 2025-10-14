import { Stack } from 'expo-router';
import React from 'react';

export default function BusinessSetupLayout() {
    return (
        <Stack>
            <Stack.Screen options={{ headerShown: false }} />
            <Stack.Screen name='edit-tow-truck' options={{ headerShown: false }} />
            <Stack.Screen name="spare-part" options={{ headerShown: false }} />
            <Stack.Screen name="add-spare-part" options={{ presentation: 'modal' }} />
        </Stack>
    );
}