import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface ChatListItem {
    id: string;
    bookingId: string;
    participantClerkIds: string[];
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    participants: Array<{ // This will be populated by fetching user details
        clerkId: string;
        firstName: string;
        lastName: string | null;
    }>;
}

export default function ChatsScreen() {
    const { getToken, userId } = useAuth();
    const [chats, setChats] = useState<ChatListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChats = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/chats`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Error fetching chats. Status: ${response.status}. Body: ${errorBody}`);
                throw new Error(`Failed to fetch chats. Server returned status ${response.status}.`);
            }
            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error("Error in fetchChats catch block:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchChats();
        }, [fetchChats])
    );

    const renderChatItem = ({ item }: { item: ChatListItem }) => {
        const otherParticipant = item.participants.find(p => p.clerkId !== userId);
        const displayName = otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName || ''}`.trim() : 'Unknown User';

        return (
            <TouchableOpacity style={styles.chatItem} onPress={() => router.push(`/chat/${item.id}`)}>
                <Ionicons name="person-circle-outline" size={40} color="#b95528" style={styles.avatar} />
                <View style={styles.chatContent}>
                    <Text style={styles.chatName}>{displayName}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage?.content || 'No messages yet.'}
                    </Text>
                </View>
                <Text style={styles.timestamp}>
                    {item.lastMessage ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#b95528" />
                <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Chats</Text>
            </View>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>You have no active chats.</Text>
                        <Text style={styles.emptySubText}>Start a chat from your orders.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f8',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    listContent: {
        paddingVertical: 10,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        marginRight: 15,
    },
    chatContent: {
        flex: 1,
    },
    chatName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        marginLeft: 10,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: '600',
        color: '#888',
    },
    emptySubText: {
        marginTop: 5,
        fontSize: 14,
        color: '#aaa',
    },
});
