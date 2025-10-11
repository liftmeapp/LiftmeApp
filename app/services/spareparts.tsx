import { useAuth } from '@clerk/clerk-expo';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const { width } = Dimensions.get('window');
const numColumns = 2;

const ProductCard = ({ item }: { item: any }) => {
    const router = useRouter();
    return (
        <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/services/${item.id}` as Href)}>
            <Image source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.partName}</Text>
                <Text style={styles.productPrice}>INR{item.price.toFixed(2)}</Text>
                <Text style={styles.productLocation}>{item.store?.name || 'Unknown Seller'}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function SparePartsMarketplace() {
    const { getToken } = useAuth();
    const [parts, setParts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            // Sending dummy location data since the backend is not using it, but the endpoint expects it.
            const url = `${API_BASE_URL}/api/spare-parts/nearby?lat=0&lon=0`;
            
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Failed to fetch nearby spare parts.');
            
            const data = await response.json();
            setParts(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        fetchData();
    }, [fetchData]));

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (error) {
        return <View style={styles.centered}><Text style={styles.errorText}>There are no spare parts being sold in your area</Text></View>;
    }

    return (
        <FlatList
            data={parts}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={item => item.id}
            numColumns={numColumns}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            ListHeaderComponent={<Text style={styles.header}>Spare Parts Near You</Text>}
            ListEmptyComponent={<View style={styles.centered}><Text>There are no spare parts being sold in your area</Text></View>}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    contentContainer: { padding: 8 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', padding: 16, textAlign: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        margin: 8,
        flex: 1 / numColumns,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: (width / numColumns) - 40, // Adjust height to be responsive
    },
    productInfo: { padding: 12 },
    productName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
    productPrice: { fontSize: 16, fontWeight: 'bold', color: '#b95528', marginBottom: 4 },
    productLocation: { fontSize: 12, color: '#6c757d' },
});
