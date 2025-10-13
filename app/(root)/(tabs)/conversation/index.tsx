import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Chat {
    id: string;
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    participants: {
        clerkId: string;
        firstName: string | null;
        lastName: string | null;
        username: string | null;
        phone: string | null;
    }[];
}

const ChatListItem = ({ chat, onPress }: { chat: Chat; onPress: () => void }) => {
    const otherParticipant = chat.participants[0];

    let participantName = 'Unknown User';
    if (otherParticipant) {
        const { firstName, lastName, username, phone, clerkId } = otherParticipant;
        const fullName = `${firstName || ''} ${lastName || ''}`.trim();
        participantName = fullName || username || phone || clerkId;
    }

    const lastMessage = chat.lastMessage?.content || 'No messages yet.';
    const lastMessageTime = chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <TouchableOpacity style={styles.chatItem} onPress={onPress}>
            <View style={styles.avatar}>
                <Ionicons name="person-circle-outline" size={40} color="#b95528" />
            </View>
            <View style={styles.chatDetails}>
                <View style={styles.chatHeader}>
                    <Text style={styles.participantName}>{participantName}</Text>
                    <Text style={styles.lastMessageTime}>{lastMessageTime}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function ConversationsScreen() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchChats = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) throw new Error('User not authenticated');

            const response = await fetch(`${API_BASE_URL}/api/chats`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chats');
            }

            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchChats();
        }, [fetchChats])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChats();
    }, [fetchChats]);

    const handleChatPress = (chatId: string) => {
        router.push(`/conversation/${chatId}`);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#b95528" />
                <Text>Loading Chats...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Conversations</Text>
            </View>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatListItem chat={item} onPress={() => handleChatPress(item.id)} />}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No conversations yet.</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 18,
        color: '#888',
    },
    chatItem: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        marginRight: 15,
    },
    chatDetails: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    participantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    lastMessageTime: {
        fontSize: 12,
        color: '#999',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
});
