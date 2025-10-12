import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { io, Socket } from 'socket.io-client';

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
    const [socket, setSocket] = useState<Socket | null>(null);
    const [chatRoomDetails, setChatRoomDetails] = useState<any>(null);

    // Combined effect for fetching history and setting up socket
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
                const token = await getToken();
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

                // Find the other participant from the new participants list for the header
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
                return; // Stop if history fails
            } finally {
                if (isMounted) setLoading(false);
            }

            // Now, set up the socket connection
            console.log('[ConversationScreen] Setting up socket...');
            const newSocket = io(API_BASE_URL!, {
                reconnection: true,
                transports: ['websocket'],
                query: { clerkId: userId, chatId },
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log(`[ConversationScreen] Socket connected with ID: ${newSocket.id}`);
                newSocket.emit('join_chat', { chatId });
            });

            newSocket.on('disconnect', (reason) => {
                console.log(`[ConversationScreen] Socket disconnected: ${reason}`);
            });

            newSocket.on('new_message', (message: any) => {
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

            newSocket.on('error', (error: any) => {
                console.error('[ConversationScreen] Socket error:', error);
                Alert.alert('Connection Error', 'Could not connect to the chat service.');
            });

            return newSocket; // Return socket for cleanup
        };

        let socketConnection: Socket | undefined;
        fetchHistoryAndConnect().then(socket => {
            if (socket) socketConnection = socket;
        });

        return () => {
            isMounted = false;
            if (socketConnection) {
                console.log('[ConversationScreen] Socket disconnecting');
                socketConnection.disconnect();
            }
        };
    }, [chatId, userId, getToken, router]);

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        const messageToSend = newMessages[0];
        if (!messageToSend || !chatId) return;

        const messagesWithClerkId = newMessages.map(message => ({
        ...message,
        clerkId: userId  // Add the clerkId to each message
    }));

        // Optimistically update the UI
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
                // Optionally, handle the error e.g., show an error icon on the message
            }
        };

        sendMessageToServer();
    }, [chatId, getToken]);

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
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: userId, // clerkId is the user ID in our system
                }}
                messagesContainerStyle={styles.messagesContainer}
                renderUsernameOnMessage
            />
            {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f8',
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
        width: 34, // Match back button width to center title
    },
    messagesContainer: {
        paddingBottom: 10,
    },
});
