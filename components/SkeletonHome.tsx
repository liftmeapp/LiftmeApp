import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import SkeletonGeneric from './SkeletonGeneric';

const SkeletonHome = () => {
    return (
        <View style={styles.container}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <SkeletonGeneric width={40} height={40} borderRadius={20} />
            </View>

            {/* Greeting Skeleton */}
            <View style={styles.greeting}>
                <SkeletonGeneric width={200} height={30} borderRadius={4} />
            </View>

            {/* Section Title Skeleton */}
            <View style={styles.sectionHeader}>
                <SkeletonGeneric width={100} height={20} borderRadius={4} />
            </View>

            {/* Services Grid Skeleton */}
            <View style={styles.grid}>
                {[...Array(4)].map((_, index) => (
                    <View key={index} style={styles.card}>
                        <SkeletonGeneric width={60} height={60} borderRadius={30} style={{ marginBottom: 10 }} />
                        <SkeletonGeneric width={80} height={16} borderRadius={4} />
                    </View>
                ))}
            </View>

            {/* Other Services Section Skeleton */}
            <View style={styles.sectionHeader}>
                <SkeletonGeneric width={120} height={20} borderRadius={4} />
            </View>
            <View style={styles.grid}>
                {[...Array(2)].map((_, index) => (
                    <View key={index} style={styles.card}>
                        <SkeletonGeneric width={60} height={60} borderRadius={30} style={{ marginBottom: 10 }} />
                        <SkeletonGeneric width={80} height={16} borderRadius={4} />
                    </View>
                ))}
            </View>

            {/* Coupons Section Skeleton */}
            <View style={styles.sectionHeader}>
                <SkeletonGeneric width={80} height={20} borderRadius={4} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.couponScroll}>
                {[...Array(2)].map((_, index) => (
                    <View key={index} style={styles.couponCard}>
                        <SkeletonGeneric width="100%" height={100} borderRadius={8} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        marginBottom: 20,
    },
    greeting: {
        marginBottom: 30,
    },
    sectionHeader: {
        marginBottom: 15,
        marginTop: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    couponScroll: {
        flexDirection: 'row',
    },
    couponCard: {
        width: 250,
        marginRight: 15,
    },
});

export default SkeletonHome;
