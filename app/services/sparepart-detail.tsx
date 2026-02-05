
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function SparePartDetailScreen() {
    console.log('--- Component Render ---');
    const { partId } = useLocalSearchParams<{ partId: string }>();
    const { getToken } = useAuth();
    const router = useRouter();

    const [part, setPart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isOrdering, setIsOrdering] = useState(false);

    console.log(`Part ID from params: ${partId}`);

    const fetchPartDetails = useCallback(async () => {
        console.log('[fetchPartDetails] Running...');
        if (!partId) {
            console.log('[fetchPartDetails] No partId, returning.');
            return;
        }
        setLoading(true);
        try {
            console.log('[fetchPartDetails] Getting token...');
            const token = await getToken();
            console.log(`[fetchPartDetails] Fetching from: ${API_BASE_URL}/api/spare-parts/${partId}`);
            const response = await fetch(`${API_BASE_URL}/api/spare-parts/${partId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log(`[fetchPartDetails] Response status: ${response.status}`);
            if (!response.ok) throw new Error('Failed to fetch part details.');
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response. Check API URL/backend availability.');
            }
            const data = await response.json();
            console.log('[fetchPartDetails] Data received:', data);
            setPart(data);
        } catch (error: any) {
            console.error('[fetchPartDetails] CATCH block error:', error);
            Alert.alert('Error', error.message);
        } finally {
            console.log('[fetchPartDetails] FINALLY block, setting loading to false.');
            setLoading(false);
        }
    }, [partId]);

    useEffect(() => {
        console.log('--- useEffect triggered ---');
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
                    paymentMethod: 'CARD' // Defaulting to CARD for now
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to place order.');
            }

            Alert.alert(
                'Order Placed',
                'Your order is awaiting seller confirmation. You will be notified when it is accepted.',
                [{
                    text: 'OK', onPress: () => router.push({
                        pathname: '/(tabs)/orders'
                    } as any)
                }]
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
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: part.images[0] || 'https://via.placeholder.com/400' }} style={styles.heroImage} />

                <View style={styles.sheetContainer}>
                    <View style={styles.handle} />

                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.partName}>{part.partName}</Text>
                            <View style={styles.stockBadge}>
                                <Ionicons name={part.quantity > 0 ? "checkmark-circle" : "close-circle"} size={14} color={part.quantity > 0 ? "#27ae60" : "#c0392b"} />
                                <Text style={[styles.stockText, { color: part.quantity > 0 ? "#27ae60" : "#c0392b" }]}>
                                    {part.quantity > 0 ? `In Stock (${part.quantity})` : "Out of Stock"}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.price}>₹{part.price.toFixed(0)}</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Specifications</Text>
                    <View style={styles.specGrid}>
                        <View style={styles.specItem}>
                            <Text style={styles.specLabel}>Brand</Text>
                            <Text style={styles.specValue}>{part.brand || 'N/A'}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Text style={styles.specLabel}>Model</Text>
                            <Text style={styles.specValue}>{part.model || 'N/A'}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Text style={styles.specLabel}>Year</Text>
                            <Text style={styles.specValue}>{part.year || 'N/A'}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Text style={styles.specLabel}>Category</Text>
                            <Text style={styles.specValue}>{part.category || 'Spare Part'}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{part.description}</Text>

                    <View style={styles.sellerCard}>
                        <View style={styles.sellerIcon}>
                            <Ionicons name="storefront" size={24} color="#005C70" />
                        </View>
                        <View>
                            <Text style={styles.soldByLabel}>Sold by</Text>
                            <Text style={styles.sellerName}>{part.store.name}</Text>
                        </View>
                    </View>

                    {/* Spacer for bottom bar */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.quantityControl}>
                    <TouchableOpacity onPress={() => changeQuantity(-1)} style={styles.qtyBtn}>
                        <Ionicons name="remove" size={20} color="#005C70" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity onPress={() => changeQuantity(1)} style={styles.qtyBtn}>
                        <Ionicons name="add" size={20} color="#005C70" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.buyButton, isOrdering && styles.disabledButton]}
                    onPress={handleBuyNow}
                    disabled={isOrdering}
                >
                    {isOrdering ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.buyButtonText}>Buy Now</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    heroImage: { width: '100%', height: 350, resizeMode: 'cover' },
    sheetContainer: {
        marginTop: -30,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    handle: {
        width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 20
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    partName: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', flex: 1, paddingRight: 10 },
    price: { fontSize: 24, fontWeight: '800', color: '#005C70' }, // Teal
    stockBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    stockText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 12 },

    specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    specItem: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee'
    },
    specLabel: { fontSize: 12, color: '#888', marginBottom: 2, textTransform: 'uppercase' },
    specValue: { fontSize: 16, fontWeight: '600', color: '#333' },

    description: { fontSize: 15, color: '#555', lineHeight: 24 },

    sellerCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f0faff', // Light Teal Tint
        padding: 16, borderRadius: 16,
        marginTop: 24,
        borderWidth: 1, borderColor: '#e0f2f1'
    },
    sellerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0f2f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    soldByLabel: { fontSize: 12, color: '#005C70', fontWeight: '500' },
    sellerName: { fontSize: 16, fontWeight: 'bold', color: '#004252' },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        padding: 16, paddingBottom: 30, // Safe area
        borderTopWidth: 1, borderTopColor: '#eee',
        flexDirection: 'row', alignItems: 'center',
        gap: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 10
    },
    quantityControl: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f4', borderRadius: 12, padding: 6
    },
    qtyBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
    qtyText: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, color: '#333' },

    buyButton: {
        flex: 1,
        backgroundColor: '#005C70', // Teal
        paddingVertical: 14, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#005C70', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, elevation: 4
    },
    buyButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#95a5a6' },
});
