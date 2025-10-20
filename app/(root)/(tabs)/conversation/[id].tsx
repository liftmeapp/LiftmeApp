import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Custom type for our messages to include clerkId
interface AppMessage extends IMessage {
    clerkId: string;
}

export default function ConversationScreen() {
    const { id: chatId } = useLocalSearchParams<{ id: string }>();
    const { getToken, userId } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<AppMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [chatRoomDetails, setChatRoomDetails] = useState<any>(null);
    const socketRef = useRef<Socket | null>(null);

    // This pattern prevents a re-render loop if getToken is not a stable function reference
    const getTokenRef = useRef(getToken);
    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    useEffect(() => {
        if (!chatId || !userId) {
            console.log('[ConversationScreen] Missing chatId or userId. Aborting.');
            return;
        }

        let isMounted = true;
        console.log(`[ConversationScreen] Mount acknowledged for chatId: ${chatId}`);

        const fetchHistoryAndConnect = async () => {
            try {
                console.log('[ConversationScreen] Getting token...');
                const token = await getTokenRef.current();
                if (!token) throw new Error("Authentication failed: Token is null.");
                console.log('[ConversationScreen] Token retrieved.');

                const apiUrl = `${API_BASE_URL}/api/chat/${chatId}/messages`;
                console.log(`[ConversationScreen] Fetching history from: ${apiUrl}`);

                const historyResponse = await fetch(apiUrl, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                console.log(`[ConversationScreen] History response status: ${historyResponse.status}`);

                if (!historyResponse.ok) {
                    const errorBody = await historyResponse.text();
                    console.error('[ConversationScreen] History fetch failed. Body:', errorBody);
                    throw new Error(`Failed to fetch chat history. Status: ${historyResponse.status}`);
                }

                const { messages: history, participants } = await historyResponse.json();
                if (!isMounted) return;
                console.log(`[ConversationScreen] History received with ${history.length} messages.`);

                const otherParticipant = participants.find((p: any) => p.clerkId !== userId);
                if (otherParticipant) {
                    setChatRoomDetails({ otherParticipantName: `${otherParticipant.firstName || 'Unknown'} ${otherParticipant.lastName || ''}`.trim() });
                }

                const formattedMessages = history.map((msg: any) => ({
                    _id: msg.id,
                    text: msg.content,
                    createdAt: new Date(msg.createdAt),
                    user: {
                        _id: msg.sender?.clerkId || 'unknown-sender',
                        name: `${msg.sender?.firstName || 'Unknown'} ${msg.sender?.lastName || ''}`.trim(),
                    },
                    clerkId: msg.sender?.clerkId || 'unknown-sender',
                }));

                setMessages(formattedMessages.reverse());

            } catch (error: any) {
                console.error('[ConversationScreen] CATCH block: Error fetching history:', error);
                Alert.alert('Error Loading Chat', error.message);
                return;
            } finally {
                if (isMounted) setLoading(false);
            }

            if (!isMounted) return;

            // Disconnect any existing socket before creating a new one
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            console.log('[ConversationScreen] Setting up socket...');
            socketRef.current = io(API_BASE_URL!, {
                reconnection: true,
                transports: ['websocket'],
                query: { clerkId: userId, chatId },
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                console.log(`[ConversationScreen] Socket connected with ID: ${socket.id}`);
                socket.emit('join_chat', { chatId });
            });

            socket.on('disconnect', (reason: any) => {
                console.log(`[ConversationScreen] Socket disconnected: ${reason}`);
            });

            socket.on('new_message', (message: any) => {
                console.log('[ConversationScreen] Received new message:', message);
                const newMessage: AppMessage = {
                    _id: message.id,
                    text: message.content,
                    createdAt: new Date(message.createdAt),
                    user: {
                        _id: message.sender?.clerkId || 'unknown-sender',
                        name: `${message.sender?.firstName || 'Unknown'} ${message.sender?.lastName || ''}`.trim(),
                    },
                    clerkId: message.sender?.clerkId || 'unknown-sender',
                };
                if (isMounted) {
                    setMessages(previousMessages => GiftedChat.append(previousMessages, [newMessage]));
                }
            });

            socket.on('error', (error: any) => {
                console.error('[ConversationScreen] Socket error:', error);
                Alert.alert('Connection Error', 'Could not connect to the chat service.');
            });
        };

        fetchHistoryAndConnect();

        return () => {
            isMounted = false;
            if (socketRef.current) {
                console.log('[ConversationScreen] Socket disconnecting');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [chatId, userId]);

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        const messageToSend = newMessages[0];
        if (!messageToSend || !chatId) return;

        const messagesWithClerkId = newMessages.map(message => ({
            ...message,
            clerkId: userId,
        }));

        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messagesWithClerkId) as AppMessage[]
        );

        const sendMessageToServer = async () => {
            try {
                const token = await getToken();
                await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: messageToSend.text }),
                });
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        };

        sendMessageToServer();
    }, [chatId, getToken, userId]);

    const getOtherParticipantName = () => {
        return chatRoomDetails?.otherParticipantName || 'Conversation';
    };

    if (loading || !userId) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#b95528" />
                <Text>Loading Conversation...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{getOtherParticipantName()}</Text>
                <View style={styles.backButtonPlaceholder} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                contentContainerStyle={styles.flex}
            >
                <GiftedChat
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{ _id: userId }}
                    messagesContainerStyle={styles.messagesContainer}
                    renderUsernameOnMessage
                    bottomOffset={Platform.OS === 'android' ? -70 : 0}
                    minInputToolbarHeight={44}
                />
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f8',
    },
    flex: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 40,
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    backButton: {
        padding: 5,
    },
    backButtonPlaceholder: {
        width: 34,
    },
    messagesContainer: {
        paddingBottom: 0,
    },
});
