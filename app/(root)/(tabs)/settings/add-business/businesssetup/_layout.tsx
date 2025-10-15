import { Stack } from 'expo-router';
import React from 'react';

export default function BusinessSetupLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* By default, all screens in this stack have no header */}
            
            {/* This screen is presented as a modal and needs a header */}
            <Stack.Screen 
                name="add-spare-part" 
                options={{ 
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Add New Spare Part' 
                }} 
            />
        </Stack>
    );
}