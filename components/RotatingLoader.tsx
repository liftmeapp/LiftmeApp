// /components/RotatingLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RotatingLoaderProps {
    message?: string;
    size?: number;
    color?: string;
    iconName?: keyof typeof Ionicons.glyphMap;
}

export default function RotatingLoader({ 
    message = '', 
    size = 40, 
    color = '#b95528', 
    iconName = 'sync-outline' 
}: RotatingLoaderProps) {
    
    // 1. Create a new Animated.Value for the rotation. Start at 0.
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 2. Define the animation
        const spinAnimation = Animated.loop(
            Animated.timing(rotation, {
                toValue: 1, // The value will go from 0 to 1
                duration: 1200, // Duration of one full rotation in milliseconds
                easing: Easing.linear, // A smooth, constant rotation speed
                useNativeDriver: true, // This is crucial for performance!
            })
        );
        
        // 3. Start the animation
        spinAnimation.start();

        // 4. Clean up the animation when the component unmounts
        return () => spinAnimation.stop();
    }, [rotation]); // Dependency array ensures this effect runs only once

    // 5. Map the 0-1 value to a 0-360 degree rotation string
    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons 
                    name={iconName} 
                    size={size} 
                    color={color} 
                />
            </Animated.View>
            {message && <Text style={[styles.loadingText, { color }]}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // Make it transparent to use as an overlay
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '500',
    },
});


