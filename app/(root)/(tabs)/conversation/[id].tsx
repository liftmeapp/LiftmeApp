import { useSocket } from '@/context/SocketContext'; // Corrected import path
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface AppMessage extends IMessage {
    clerkId: string;
}

export default function ConversationScreen() {
    const { id: chatId } = useLocalSearchParams<{ id: string }>();
    const { getToken, userId } = useAuth();
    const router = useRouter();
    const { socket } = useSocket(); // Use the global socket

    const [messages, setMessages] = useState<AppMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [chatRoomDetails, setChatRoomDetails] = useState<any>(null);

    // Effect for fetching message history
    useEffect(() => {
        if (!chatId) return;

        let isMounted = true;
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication failed.");

                const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch chat history.');

                const { messages: history, participants } = await response.json();
                if (!isMounted) return;

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
                console.error("Error fetching history:", error);
                Alert.alert('Error', error.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchHistory();

        return () => { isMounted = false; };
    }, [chatId, userId]);

    // Effect for handling socket events
    useEffect(() => {
        if (!socket || !chatId) return;

        console.log(`[Socket] Joining chat: ${chatId}`);
        socket.emit('join_chat', { chatId });

        const handleNewMessage = (message: any) => {
            if (message.chatId === chatId) {
                console.log('[Socket] Received new message for this chat:', message);
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
                setMessages(previousMessages => GiftedChat.append(previousMessages, [newMessage]));
            }
        };

        console.log('[Socket] Attaching new_message listener');
        socket.on('new_message', handleNewMessage);

        return () => {
            console.log(`[Socket] Leaving chat and removing listener: ${chatId}`);
            socket.emit('leave_chat', { chatId });
            socket.off('new_message', handleNewMessage);
        };
    }, [chatId]);

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        const messageToSend = newMessages[0];
        if (!messageToSend || !chatId) return;

        const messagesWithClerkId = newMessages.map(message => ({
            ...message,
            clerkId: userId,
        }));



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
    }, [chatId, userId]);

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