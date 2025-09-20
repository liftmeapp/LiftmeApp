//app/services/garages.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Map from '@/components/Map';

// --- Main Component ---
const MainMap = () => {
    return (
        // Use a View with flex: 1 to make it take up the full screen
        <View style={styles.container}>
            <Map 
                isPinningLocation={false}
                onPinLocationChange={(location: { latitude: number; longitude: number }) => console.log('Location confirmed:', location)}
            />
        </View>
    );
};

// --- Styles ---

// You only need the main container style to make the map fill the screen
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MainMap;