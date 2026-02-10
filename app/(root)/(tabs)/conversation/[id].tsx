import { useSocket } from '@/context/SocketContext'; // Corrected import path
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, Composer, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';

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

    const renderInputToolbar = (props: any) => (
        <InputToolbar
            {...props}
            containerStyle={styles.inputToolbar}
            primaryStyle={styles.inputPrimary}
        />
    );

    const renderComposer = (props: any) => (
        <Composer
            {...props}
            textInputStyle={styles.composer}
            placeholderTextColor="#888"
        />
    );

    const renderSend = (props: any) => (
        <Send {...props}>
            <View style={styles.sendButton}>
                <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 2 }} />
            </View>
        </Send>
    );

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
                    <Ionicons name="arrow-back" size={24} color="#fff" />
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
                    renderUsernameOnMessage
                    renderInputToolbar={renderInputToolbar}
                    renderComposer={renderComposer}
                    renderSend={renderSend}
                    renderBubble={props => (
                        <Bubble
                            {...props}
                            wrapperStyle={{
                                right: { backgroundColor: '#005C70' },
                                left: { backgroundColor: '#e0e0e0' }
                            }}
                            textStyle={{
                                right: { color: '#fff' },
                                left: { color: '#000' }
                            }}
                        />
                    )}
                    bottomOffset={Platform.OS === 'ios' ? 90 : 0} // Adjusted for tab bar if visible, or safe area
                    minInputToolbarHeight={60}
                    messagesContainerStyle={styles.messagesContainer}
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
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: '#005C70', // Teal background
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0, // Remove border for cleaner look
        elevation: 4, // Add shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff', // White text
    },
    backButton: {
        padding: 5,
    },
    backButtonPlaceholder: {
        width: 34,
    },
    messagesContainer: {
        paddingBottom: 20,
    },
    inputToolbar: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    inputPrimary: {
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 5,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    composer: {
        color: '#333',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginVertical: 5,
        marginRight: 10,
        lineHeight: 20,
        fontSize: 16,
    },
    sendButton: {
        marginRight: 5,
        backgroundColor: '#005C70',
        borderRadius: 20,
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
});