
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Router } from 'express';
import prisma from './lib/prisma';

const router = Router();

// Get or create a chat for a booking
router.post('/bookings/:bookingId/chat', async (req, res) => {
    const { bookingId } = req.params;
    const { userId } = req.auth;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                garage: { include: { owner: true } },
                towTruck: { include: { owner: true } },
                sparePartStore: { include: { owner: true } },
            },
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const provider = booking.garage?.owner ?? booking.towTruck?.owner ?? booking.sparePartStore?.owner;

        if (userId !== booking.user.clerkId && userId !== provider?.clerkId) {
            return res.status(403).json({ error: 'You are not a participant in this booking' });
        }

        const otherParticipantId = userId === booking.user.clerkId ? provider?.clerkId : booking.user.clerkId;

        if (!otherParticipantId) {
            return res.status(400).json({ error: 'Could not identify chat participants' });
        }

        // 1. Check for an EXISTING chat between these two users
        // We look for a chat where participantClerkIds contains BOTH userId AND otherParticipantId
        const existingChat = await prisma.chat.findFirst({
            where: {
                participantClerkIds: {
                    hasEvery: [userId, otherParticipantId]
                }
            }
        });

        if (existingChat) {
            console.log(`[Chat API] Reusing existing chat ${existingChat.id} for Booking ${bookingId}`);

            // Link this booking to the existing chat
            await prisma.booking.update({
                where: { id: bookingId },
                data: { chatId: existingChat.id }
            });

            return res.status(200).json(existingChat);
        }

        // 2. If no existing chat, create a new one
        console.log(`[Chat API] Creating NEW chat for Booking ${bookingId}`);
        const chat = await prisma.chat.create({
            data: {
                participantClerkIds: [userId, otherParticipantId],
                bookings: {
                    connect: { id: bookingId }
                }
            },
        });

        return res.status(200).json(chat);
    } catch (error) {
        console.error('Failed to get or create chat:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get messages for a chat
router.get('/chat/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.auth;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            select: { participantClerkIds: true },
        });

        if (!chat || !chat.participantClerkIds.includes(userId)) {
            return res.status(403).json({ error: 'You are not a member of this chat' });
        }

        const [messages, participants] = await Promise.all([
            prisma.message.findMany({
                where: { chatId },
                orderBy: { createdAt: 'asc' },
                include: { sender: true },
            }),
            prisma.user.findMany({
                where: {
                    clerkId: { in: chat.participantClerkIds }
                },
                select: {
                    clerkId: true,
                    firstName: true,
                    lastName: true,
                }
            })
        ]);

        // Return both messages and participant details
        return res.status(200).json({ messages, participants });
    } catch (error) {
        console.error('Failed to get messages:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Send a message
router.post('/chat/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;
    const { content } = req.body;
    const { userId } = req.auth;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            select: { participantClerkIds: true }, // Only fetch participantClerkIds
        });

        if (!chat || !chat.participantClerkIds.includes(userId)) {
            return res.status(403).json({ error: 'You are not a member of this chat' });
        }

        const message = await prisma.message.create({
            data: {
                chatId,
                senderId: user.id,
                content,
            },
            include: { sender: true },
        });

        // Emit message via socket to all clients in the chat room
        const io = req.app.get('socketio');
        io.to(chatId).emit('new_message', message);

        return res.status(201).json(message);
    } catch (error) {
        console.error('Failed to send message:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/chats', async (req, res) => {
    const { userId } = req.auth;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const chats = await prisma.chat.findMany({
            where: {
                participantClerkIds: {
                    has: userId,
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: {
                        sender: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        const chatsWithParticipantDetails = await Promise.all(
            chats.map(async (chat) => {
                const otherParticipantClerkId = chat.participantClerkIds.find((id) => id !== userId);
                let otherParticipantDetails = null;

                if (otherParticipantClerkId) {
                    try {
                        const clerkUser = await clerkClient.users.getUser(otherParticipantClerkId);
                        otherParticipantDetails = {
                            clerkId: clerkUser.id,
                            firstName: clerkUser.firstName,
                            lastName: clerkUser.lastName,
                            username: clerkUser.username,
                            phone: clerkUser.primaryPhoneNumber?.phoneNumber
                        };
                    } catch (clerkError) {
                        console.warn(`Could not fetch Clerk user details for ${otherParticipantClerkId}:`, clerkError);
                    }
                }

                return {
                    ...chat,
                    lastMessage: chat.messages.length > 0 ? chat.messages[0] : undefined,
                    participants: otherParticipantDetails ? [otherParticipantDetails] : [], // Only include the other participant for simplicity in the list view
                };
            })
        );

        return res.status(200).json(chatsWithParticipantDetails);
    } catch (error) {
        console.error('Failed to get chats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/chat/:chatId', async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.auth;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            select: { participantClerkIds: true },
        });

        if (!chat || !chat.participantClerkIds.includes(userId)) {
            return res.status(403).json({ error: 'You are not a member of this chat' });
        }

        await prisma.message.deleteMany({ where: { chatId } });
        await prisma.chat.delete({ where: { id: chatId } });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Failed to delete chat:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;
