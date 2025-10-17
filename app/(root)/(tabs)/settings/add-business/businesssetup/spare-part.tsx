import RotatingLoader from '@/components/RotatingLoader';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ===================================================================
//  Reusable Components
// ===================================================================

const PartCard = ({ part, onDelete }: { part: any, onDelete: (id: string) => void }) => (
    <View style={styles.card}>
        <Image source={{ uri: part.images[0] || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
        <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>{part.partName}</Text>
            <Text style={styles.cardSubtitle}>{`INR${part.price.toFixed(2)} • Qty: ${part.quantity}`}</Text>
            <Text style={styles.cardInfo}>{part.brand || 'No Brand'}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(part.id)}>
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
    </View>
);

const OrderCard = ({ order, onAccept, onChat, onConfirmSale, isAccepting, isConfirming, ordersSubTab }: { order: any, onAccept: (id: string) => void, onChat: (bookingId: string) => void, onConfirmSale: (id: string) => void, isAccepting: boolean, isConfirming: boolean, ordersSubTab: string }) => (
    <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
            <Text style={styles.bookingDate}>{new Date(order.bookedAt).toLocaleDateString()}</Text>
            <Text style={styles.bookingPrice}> INR{order.finalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="cube" size={20} color="#3498db" />
            <Text style={styles.bookingText}>{order.sparePart.partName}</Text>
        </View>
        <View style={styles.bookingDetails}>
            <Ionicons name="person-circle" size={20} color="#9b55b6" />
            <Text style={styles.bookingText}>{`${order.user.firstName} ${order.user.lastName}`}</Text>
        </View>
        <View style={styles.bookingActions}>
            {ordersSubTab === 'Pending' && order.status === 'PENDING_ACCEPTANCE' && (
                <TouchableOpacity 
                    style={[styles.bookingButton, styles.acceptButton, isAccepting && styles.disabledButton]} 
                    onPress={() => onAccept(order.id)}
                    disabled={isAccepting}
                >
                    {isAccepting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.bookingButtonText}>Accept Order</Text>
                    )}
                </TouchableOpacity>
            )}
            {ordersSubTab === 'Current' && (
                <>
                    <TouchableOpacity 
                        style={[styles.bookingButton, styles.chatButton]} 
                        onPress={() => onChat(order.id)}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                        <Text style={styles.bookingButtonText}>Chat</Text>
                    </TouchableOpacity>
                    {['CONFIRMED', 'IN_PROGRESS'].includes(order.status) && (
                        <TouchableOpacity 
                            style={[styles.bookingButton, styles.completeButton, isConfirming && styles.disabledButton]} 
                            onPress={() => onConfirmSale(order.id)}
                            disabled={isConfirming}
                        >
                            {isConfirming ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.bookingButtonText}>Confirm Sale</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    </View>
);

// ===================================================================
//  Main Dashboard Component
// ===================================================================

export default function SparePartDashboard() {
    console.log('--- SparePartDashboard Render ---');
    const router = useRouter();
    const { getToken } = useAuth();

    const [mainTab, setMainTab] = useState<'Products' | 'Orders'>('Products');
    const [ordersSubTab, setOrdersSubTab] = useState<'Pending' | 'Current' | 'History'>('Pending');

    const [parts, setParts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    console.log(`[SparePartDashboard] mainTab: ${mainTab}, ordersSubTab: ${ordersSubTab}, loading: ${loading}`);

    const fetchData = useCallback(async () => {
        console.log('[fetchData] Running for tab:', mainTab, 'subTab:', ordersSubTab);
        setLoading(true);
        try {
            console.log('[fetchData] Getting token...');
            const token = await getToken();
            console.log('[fetchData] Token obtained.');

            if (mainTab === 'Products') {
                console.log('[fetchData] Fetching products...');
                const response = await fetch(`${API_BASE_URL}/api/spare-parts/my-parts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(`[fetchData] Products response status: ${response.status}`);
                if (!response.ok) throw new Error("Could not load your spare parts.");
                const data = await response.json();
                console.log('[fetchData] Products data received.', data.length, 'items');
                setParts(data);
            } else { // Fetch Orders
                console.log('[fetchData] Fetching orders...');
                const response = await fetch(`${API_BASE_URL}/api/spare-parts/orders?status=${ordersSubTab}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(`[fetchData] Orders response status: ${response.status}`);
                if (!response.ok) throw new Error(`Could not load ${ordersSubTab.toLowerCase()} orders.`);
                const data = await response.json();
                console.log('[fetchData] Orders data received.', data.length, 'items');
                setOrders(data);
            }
        } catch (error: any) {
            console.error('[fetchData] CATCH block error:', error);
            Alert.alert("Error", error.message);
        } finally {
            console.log('[fetchData] FINALLY block, setting loading/refreshing to false.');
            setLoading(false);
            setRefreshing(false);
        }
    }, [mainTab, ordersSubTab]);

    useFocusEffect(useCallback(() => {
        console.log('--- useFocusEffect triggered ---');
        fetchData();
    }, [fetchData]));

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleDeletePart = async (partId: string) => {
        Alert.alert("Delete Spare Part", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                try {
                    const token = await getToken();
                    const response = await fetch(`${API_BASE_URL}/api/spare-parts/${partId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error("Failed to delete spare part.");
                    Alert.alert("Success", "Spare part deleted successfully.");
                    fetchData(); // Refresh parts
                } catch (error: any) {
                    Alert.alert("Error", error.message);
                }
            } }
        ]);
    };

    const handleAcceptOrder = async (orderId: string) => {
        setAcceptingId(orderId);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${orderId}/accept-spare-part`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to accept order.");
            }
            Alert.alert("Success", "Order accepted. The buyer will be notified to complete payment.");
            fetchData(); // Refresh orders
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setAcceptingId(null);
        }
    };

    const handleConfirmSale = async (orderId: string) => {
        setConfirmingId(orderId);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/bookings/${orderId}/complete-spare-part`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to complete order.");
            }
            Alert.alert("Success", "Order marked as complete.");
            fetchData(); // Refresh orders
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setConfirmingId(null);
        }
    };

    const handleChat = async (bookingId: string) => {
        console.log(`[handleChat] Initiated for bookingId: ${bookingId}`);
        try {
            console.log('[handleChat] Getting auth token...');
            const token = await getToken();
            if (!token) {
                console.error('[handleChat] Auth token is null or undefined.');
                Alert.alert("Chat Error", "Authentication token not found. Please sign in again.");
                return;
            }
            console.log('[handleChat] Token retrieved. Fetching chat room...');
    
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/chat`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
    
            console.log(`[handleChat] API response status: ${response.status}`);
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
                console.error('[handleChat] API response not OK:', errorData);
                throw new Error(errorData.error || "Failed to get or create chat.");
            }
    
            const chat = await response.json();
            console.log('[handleChat] Chat data received:', chat);
    
            if (!chat || !chat.id) {
                console.error('[handleChat] Invalid chat data received from API:', chat);
                throw new Error("Received invalid chat data from server.");
            }
    
            console.log(`[handleChat] Navigating to /chat/${chat.id}`);
            router.push(`/conversation/${chat.id}`);
            console.log('[handleChat] Navigation command issued.');
    
        } catch (error: any) {
            console.error('[handleChat] CATCH block error:', error);
            Alert.alert("Chat Error", error.message);
        }
    };

    const renderListHeader = () => (
        <View>
            <View style={styles.mainTabContainer}>
                <TouchableOpacity onPress={() => setMainTab('Products')} style={[styles.mainTab, mainTab === 'Products' && styles.activeMainTab]}>
                    <Text style={[styles.mainTabText, mainTab === 'Products' && styles.activeMainTabText]}>My Products</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMainTab('Orders')} style={[styles.mainTab, mainTab === 'Orders' && styles.activeMainTab]}>
                    <Text style={[styles.mainTabText, mainTab === 'Orders' && styles.activeMainTabText]}>Orders</Text>
                </TouchableOpacity>
            </View>
            {mainTab === 'Orders' && (
                <View style={styles.tabContainer}>
                    <TouchableOpacity onPress={() => setOrdersSubTab('Pending')} style={[styles.tab, ordersSubTab === 'Pending' && styles.activeTab]}>
                        <Text style={[styles.tabText, ordersSubTab === 'Pending' && styles.activeTabText]}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setOrdersSubTab('Current')} style={[styles.tab, ordersSubTab === 'Current' && styles.activeTab]}>
                        <Text style={[styles.tabText, ordersSubTab === 'Current' && styles.activeTabText]}>Current</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setOrdersSubTab('History')} style={[styles.tab, ordersSubTab === 'History' && styles.activeTab]}>
                        <Text style={[styles.tabText, ordersSubTab === 'History' && styles.activeTabText]}>History</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderEmptyComponent = (type: 'products' | 'orders') => (
        <View style={styles.emptyContainer}>
            <Ionicons name={type === 'products' ? "build-outline" : "receipt-outline"} size={60} color="#ccc" />
            <Text style={styles.emptyText}>No {type === 'products' ? 'spare parts listed.' : `${ordersSubTab.toLowerCase()} orders.`}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            
            {loading ? (
                <View style={styles.centered}><RotatingLoader /></View>
            ) : (
                <FlatList
                    data={mainTab === 'Products' ? parts : orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => 
                        mainTab === 'Products' 
                            ? <PartCard part={item} onDelete={handleDeletePart} /> 
                            : <OrderCard 
                                order={item} 
                                onAccept={handleAcceptOrder} 
                                onChat={handleChat} 
                                onConfirmSale={handleConfirmSale}
                                isAccepting={acceptingId === item.id} 
                                isConfirming={confirmingId === item.id}
                                ordersSubTab={ordersSubTab}
                              />
                    }
                    ListHeaderComponent={renderListHeader()}
                    ListEmptyComponent={renderEmptyComponent(mainTab === 'Products' ? 'products' : 'orders')}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
            )}

            {mainTab === 'Products' && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity onPress={() => router.push('/settings/add-business/businesssetup/add-spare-part')}>
                        <LinearGradient colors={['#c3683c', '#b95528']} style={styles.fab}>
                            <Ionicons name="add" size={28} color="#fff" />
                            <Text style={styles.fabText}>List New Part</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

// ===================================================================
//  Styles
// ===================================================================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa", marginTop:5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // Main Tabs
    mainTabContainer: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 10, padding: 5, marginTop: 10, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    mainTab: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    activeMainTab: { backgroundColor: '#b95528' },
    mainTabText: { fontSize: 16, fontWeight: 'bold', color: '#b95528' },
    activeMainTabText: { color: '#fff' },
    // Sub Tabs (for Orders)
    tabContainer: { flexDirection: 'row', backgroundColor: '#e9ecef', marginHorizontal: 15, borderRadius: 10, padding: 4, marginTop: 5, marginBottom: 15 },
    tab: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
    activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
    tabText: { fontSize: 14, fontWeight: '600', color: '#6c757d' },
    activeTabText: { color: '#b95528' },
    // Cards
    card: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginVertical: 8, padding: 15, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
    cardDetails: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 15, color: '#555', marginTop: 2, fontWeight: '500' },
    cardInfo: { fontSize: 13, color: '#888', marginTop: 3 },
    deleteButton: { padding: 8 },
    // Empty State
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, paddingBottom: 80 },
    emptyText: { marginTop: 15, fontSize: 20, fontWeight: '600', color: '#999' },
    // FAB
    fabContainer: { position: 'absolute', bottom: 20, left: 20, right: 20, alignItems: 'center' },
    fab: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, alignItems: 'center', elevation: 5 },
    fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    // Booking Card (for orders)
    bookingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, marginHorizontal: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10, marginBottom: 10, },
    bookingDate: { fontSize: 14, color: '#7f8c8d' },
    bookingPrice: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    bookingDetails: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    bookingText: { fontSize: 15, color: '#34495e', marginLeft: 10 },
    bookingActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    bookingButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginLeft: 10, minHeight: 50, justifyContent: 'center', alignItems: 'center' },
    acceptButton: { backgroundColor: '#27ae60' },
    chatButton: { backgroundColor: '#3498db' },
    completeButton: { backgroundColor: '#9b59b6' },
    disabledButton: { backgroundColor: '#95a5a6' },
    bookingButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16, width: '100%' },
});