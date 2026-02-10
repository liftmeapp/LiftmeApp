import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface MapSkeletonLoaderProps {
    stage?: 'permissions' | 'location' | 'map' | 'providers';
    message?: string;
}

const STAGES = {
    permissions: { icon: 'shield-checkmark-outline', label: 'Requesting permissions...' },
    location: { icon: 'locate-outline', label: 'Getting your location...' },
    map: { icon: 'map-outline', label: 'Loading map...' },
    providers: { icon: 'business-outline', label: 'Finding nearby providers...' },
};

export default function MapSkeletonLoader({
    stage = 'location',
    message
}: MapSkeletonLoaderProps) {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;
    const dotAnim = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Pulse animation for skeleton bars
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        // Dot animation for loading indicator
        const dotAnimation = Animated.loop(
            Animated.timing(dotAnim, {
                toValue: 3,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: false,
            })
        );

        // Icon bounce animation
        const iconAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(iconScale, {
                    toValue: 1.1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(iconScale, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        pulseAnimation.start();
        dotAnimation.start();
        iconAnimation.start();

        return () => {
            pulseAnimation.stop();
            dotAnimation.stop();
            iconAnimation.stop();
        };
    }, []);

    const stageInfo = STAGES[stage];
    const displayMessage = message || stageInfo.label;

    return (
        <View style={styles.container}>
            {/* Skeleton map background */}
            <View style={styles.mapSkeleton}>
                <Animated.View style={[styles.skeletonOverlay, { opacity: pulseAnim }]} />

                {/* Fake road lines */}
                <Animated.View style={[styles.roadLine, styles.roadHorizontal, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.roadLine, styles.roadVertical, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.roadLine, styles.roadDiagonal, { opacity: pulseAnim }]} />

                {/* Fake markers */}
                <Animated.View style={[styles.fakeMarker, styles.marker1, { opacity: pulseAnim }]}>
                    <View style={styles.markerDot} />
                </Animated.View>
                <Animated.View style={[styles.fakeMarker, styles.marker2, { opacity: pulseAnim }]}>
                    <View style={styles.markerDot} />
                </Animated.View>
                <Animated.View style={[styles.fakeMarker, styles.marker3, { opacity: pulseAnim }]}>
                    <View style={styles.markerDot} />
                </Animated.View>
            </View>

            {/* Center loading indicator */}
            <View style={styles.centerContent}>
                <View style={styles.iconContainer}>
                    <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                        <Ionicons
                            name={stageInfo.icon as any}
                            size={48}
                            color="#005C70"
                        />
                    </Animated.View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.loadingText}>{displayMessage}</Text>
                </View>

                {/* Progress dots */}
                <View style={styles.dotsContainer}>
                    {[0, 1, 2].map((i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    opacity: dotAnim.interpolate({
                                        inputRange: [i, i + 0.5, i + 1, 3],
                                        outputRange: [0.3, 1, 1, i === 2 ? 1 : 0.3],
                                        extrapolate: 'clamp',
                                    }),
                                    transform: [{
                                        scale: dotAnim.interpolate({
                                            inputRange: [i, i + 0.5, i + 1, 3],
                                            outputRange: [1, 1.3, 1, 1],
                                            extrapolate: 'clamp',
                                        }),
                                    }],
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Stage indicators */}
                <View style={styles.stagesContainer}>
                    {Object.keys(STAGES).map((key, index) => (
                        <View key={key} style={styles.stageItem}>
                            <View
                                style={[
                                    styles.stageDot,
                                    key === stage && styles.stageDotActive,
                                    Object.keys(STAGES).indexOf(stage) > index && styles.stageDotComplete,
                                ]}
                            />
                            {index < Object.keys(STAGES).length - 1 && (
                                <View
                                    style={[
                                        styles.stageLine,
                                        Object.keys(STAGES).indexOf(stage) > index && styles.stageLineComplete,
                                    ]}
                                />
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Fake search bar skeleton */}
            <Animated.View style={[styles.searchSkeleton, { opacity: pulseAnim }]} />

            {/* Fake bottom sheet skeleton */}
            <View style={styles.bottomSheetSkeleton}>
                <View style={styles.handleBar} />
                <Animated.View style={[styles.listItemSkeleton, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.listItemSkeleton, styles.listItemShort, { opacity: pulseAnim }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    mapSkeleton: {
        flex: 1,
        backgroundColor: '#e8e8e8',
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#d0d0d0',
    },
    roadLine: {
        position: 'absolute',
        backgroundColor: '#c0c0c0',
    },
    roadHorizontal: {
        height: 8,
        width: '100%',
        top: '40%',
    },
    roadVertical: {
        width: 8,
        height: '100%',
        left: '30%',
    },
    roadDiagonal: {
        width: 8,
        height: '60%',
        left: '60%',
        top: '20%',
        transform: [{ rotate: '30deg' }],
    },
    fakeMarker: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#b0b0b0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#909090',
    },
    marker1: { top: '25%', left: '20%' },
    marker2: { top: '45%', right: '25%' },
    marker3: { top: '65%', left: '40%' },
    centerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 20,
    },
    textContainer: {
        marginBottom: 15,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#005C70',
        marginHorizontal: 4,
    },
    stagesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stageItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stageDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#d0d0d0',
        borderWidth: 2,
        borderColor: '#d0d0d0',
    },
    stageDotActive: {
        backgroundColor: '#005C70',
        borderColor: '#005C70',
    },
    stageDotComplete: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    stageLine: {
        width: 30,
        height: 3,
        backgroundColor: '#d0d0d0',
        marginHorizontal: 4,
    },
    stageLineComplete: {
        backgroundColor: '#4CAF50',
    },
    searchSkeleton: {
        position: 'absolute',
        top: 50,
        left: 15,
        right: 15,
        height: 44,
        backgroundColor: '#d0d0d0',
        borderRadius: 8,
    },
    bottomSheetSkeleton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#d0d0d0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },
    listItemSkeleton: {
        height: 50,
        backgroundColor: '#e8e8e8',
        borderRadius: 8,
        marginBottom: 10,
    },
    listItemShort: {
        width: '70%',
    },
});
