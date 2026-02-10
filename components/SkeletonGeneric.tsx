import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
    width: number | string;
    height: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

const SkeletonGeneric: React.FC<SkeletonProps> = ({ width, height, borderRadius = 4, style }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: '#E0E0E0',
                    opacity,
                },
                style,
            ]}
        />
    );
};

export default SkeletonGeneric;
