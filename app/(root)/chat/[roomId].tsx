import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Message {
    id: string;
    content: string;
    sender: { 
        id: string;
        firstName: string;
        lastName: string | null;
        clerkId: string;
    };
    createdAt: string;
}

export default function ChatScreen() {
    const { roomId } = useLocalSearchParams();
    const { getToken, userId } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const socketRef = useRef<any>(null);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/chat/${roomId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    }, [roomId, getToken]);

    useEffect(() => {
        fetchMessages();

        socketRef.current = io(API_BASE_URL!, { reconnection: true, transports: ['websocket'] });

        socketRef.current.on('connect', () => {
            console.log('[ChatScreen] Socket connected');
            if (userId) {
                // Register the user with their Clerk ID
                socketRef.current.emit('register_customer', userId);
            }
        });

        socketRef.current.on('new_message', (message: Message) => {
            console.log('[ChatScreen] New message received:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
            // Scroll to bottom when new message arrives
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        });

        socketRef.current.on('disconnect', () => {
            console.log('[ChatScreen] Socket disconnected');
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [fetchMessages, userId, roomId]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        setSending(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/chat/${roomId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const sentMessage = await response.json();
            setMessages((prevMessages) => [...prevMessages, sentMessage]);
            setNewMessage('');
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.sender.clerkId === userId;
        return (
            <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
                <Text style={styles.senderName}>{isMyMessage ? 'You' : item.sender.firstName}</Text>
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#b95528" />
                <Text style={styles.loadingText}>Loading chat...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust as needed
        >
            <Stack.Screen options={{ title: 'Chat' }} />
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    multiline
                />
                <TouchableOpacity 
                    style={[styles.sendButton, sending && { opacity: 0.6 }]} 
                    onPress={handleSendMessage}
                    disabled={sending}
                >
                    {sending ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={24} color="#fff" />}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    messageList: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 15,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        elevation: 2,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6', // Light green for sender
        borderBottomRightRadius: 2,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF', // White for receiver
        borderBottomLeftRadius: 2,
    },
    senderName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
        fontWeight: 'bold',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    timestamp: {
        fontSize: 10,
        color: '#999',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        marginRight: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    sendButton: {
        backgroundColor: '#b95528',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
