import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
    Alert
} from 'react-native';
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const MessageItem = ({ message, currentUserId }: { message: any, currentUserId: string | null }) => {
    const isMyMessage = message.sender.clerkId === currentUserId;
    return (
        <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.theirMessageRow]}>
            <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble]}>
                <Text style={isMyMessage ? styles.myMessageText : styles.theirMessageText}>{message.content}</Text>
                <Text style={[styles.messageTime, isMyMessage ? {color: '#ffffff99'} : {color: '#55555599'} ]}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        </View>
    );
};

export default function ChatScreen() {
    const router = useRouter();
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const { getToken, userId } = useAuth();

    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const fetchMessages = useCallback(async () => {
        if (!chatId) return;
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch messages.');
            const data = await response.json();
            setMessages(data);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }, [chatId, getToken]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (!API_BASE_URL) return;
        const socket = io(API_BASE_URL, { reconnection: true, transports: ['websocket'] });

        socket.on('connect', () => {
            console.log('[ChatScreen] Socket connected');
        });

        socket.on('new_message', (message: any) => {
            if (message.chatId === chatId) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        });
        
        socket.on('connect_error', (err) => {
            console.error('[ChatScreen] Socket connection error:', err.message);
        });

        return () => {
            console.log('[ChatScreen] Socket disconnecting');
            socket.disconnect();
        };
    }, [chatId]);

    const handleSend = async () => {
        if (newMessage.trim() === '' || sending) return;

        setSending(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newMessage }),
            });
            if (!response.ok) throw new Error('Failed to send message.');
            
            setNewMessage('');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat</Text>
                    <View style={{ width: 24 }} />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#b95528" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <MessageItem message={item} currentUserId={userId} />}
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListEmptyComponent={
                            <View style={styles.centered}>
                                <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
                            </View>
                        }
                    />
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        multiline
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={sending || newMessage.trim() === ''}>
                        {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#999', fontSize: 16 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    messageList: { paddingHorizontal: 10, paddingVertical: 15 },
    messageRow: { flexDirection: 'row', marginVertical: 5 },
    myMessageRow: { justifyContent: 'flex-end' },
    theirMessageRow: { justifyContent: 'flex-start' },
    messageBubble: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        maxWidth: '80%',
    },
    myMessageBubble: {
        backgroundColor: '#b95528',
        borderBottomRightRadius: 5,
    },
    theirMessageBubble: {
        backgroundColor: '#e5e5ea',
        borderBottomLeftRadius: 5,
    },
    myMessageText: { color: '#fff', fontSize: 16 },
    theirMessageText: { color: '#000', fontSize: 16 },
    messageTime: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#b95528',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
