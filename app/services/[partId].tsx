
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function SparePartDetailScreen() {
    const { partId } = useLocalSearchParams<{ partId: string }>();
    const { getToken } = useAuth();
    const router = useRouter();

    const [part, setPart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isOrdering, setIsOrdering] = useState(false);

    const fetchPartDetails = useCallback(async () => {
        if (!partId) return;
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/spare-parts/${partId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch part details.');
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response. Check API URL/backend availability.');
            }
            const data = await response.json();
            setPart(data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }, [partId]);

    useEffect(() => {
        fetchPartDetails();
    }, [fetchPartDetails]);

    const handleBuyNow = async () => {
        setIsOrdering(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/request-spare-part`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    partId: part.id,
                    quantity: quantity,
                    paymentMethod: 'CASH' // Defaulting to CASH for now
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to place order.');
            }

            Alert.alert(
                'Order Placed',
                'Your order is awaiting seller confirmation. You will be notified when it is accepted.',
                [{ text: 'OK', onPress: () => router.push('/orders') }]
            );

        } catch (error: any) {
            Alert.alert('Order Error', error.message);
        } finally {
            setIsOrdering(false);
        }
    };

    const changeQuantity = (amount: number) => {
        const newQuantity = quantity + amount;
        if (newQuantity > 0 && newQuantity <= part.quantity) {
            setQuantity(newQuantity);
        }
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#b95528" /></View>;
    }

    if (!part) {
        return <View style={styles.centered}><Text>Part not found.</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: part.images[0] || 'https://via.placeholder.com/400' }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <Text style={styles.partName}>{part.partName}</Text>
                <Text style={styles.price}>${part.price.toFixed(2)}</Text>
                <Text style={styles.stock}>In Stock: {part.quantity}</Text>
                <Text style={styles.description}>{part.description}</Text>
                
                <View style={styles.separator} />
                <Text style={styles.sellerInfo}>Sold by: {part.store.name}</Text>

                <TouchableOpacity 
                    style={[styles.buyButton, isOrdering && styles.disabledButton]} 
                    onPress={handleBuyNow}
                    disabled={isOrdering}
                >
                    {isOrdering ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: 300 },
    detailsContainer: { padding: 20 },
    partName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    price: { fontSize: 22, fontWeight: '700', color: '#b95528', marginBottom: 8 },
    stock: { fontSize: 16, color: '#27ae60', marginBottom: 16 },
    description: { fontSize: 16, color: '#333', lineHeight: 24 },
    separator: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
    sellerInfo: { fontSize: 16, fontWeight: '500', color: '#555', marginBottom: 20 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    quantityButton: { padding: 10 },
    quantityText: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20 },
    buyButton: { backgroundColor: '#b95528', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    buyButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#95a5a6' },
});
