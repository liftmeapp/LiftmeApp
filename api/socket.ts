import { clerkClient } from '@clerk/clerk-sdk-node';
import http from 'http';
import { Server, Socket } from 'socket.io';
import prisma from './lib/prisma';

// Export the IO instance which will be initialized in index.ts
export let io: Server;

export const initSocketIO = (httpServer: http.Server) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"]
    }
  });

  // Middleware for Authentication
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication failed: Missing token'));
      }

      // Verify token with Clerk
      const verifiedToken = await clerkClient.verifyToken(token);

      // Store user ID in socket data for later use
      socket.data.userId = verifiedToken.sub;

      next();
    } catch (error) {
      console.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id} (User: ${socket.data.userId})`);

    // Auto-register customer/provider based on authenticated user ID is safer, 
    // but explicit registration adds flexibility. For now ensuring matched ID.

    socket.on('register_provider', (providerId: string) => {
      // Optional: Add logic to verify this user owns this provider profile
      if (providerId) {
        providerSockets[providerId] = socket.id;
        console.log(`✅ [Socket.IO] Provider registered: ${providerId}`);
      }
    });

    socket.on('register_customer', (userId: string) => {
      // Validate that they are registering as themselves
      if (userId === socket.data.userId) {
        customerSockets[userId] = socket.id;
        console.log(`✅ [Socket.IO] Customer registered: ${userId}`);
      } else {
        console.warn(`⚠️ [Socket.IO] Mismatch in registration: Auth ${socket.data.userId} vs Req ${userId}`);
      }
    });

    // Secure Room Join
    socket.on('join_chat', async (data) => {
      const { chatId } = data;
      const userId = socket.data.userId;

      if (!chatId) return;

      try {
        // Validate Access
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          select: { participantClerkIds: true }
        });

        if (chat && chat.participantClerkIds.includes(userId)) {
          socket.join(chatId);
          console.log(`[Socket.IO] Authorized join: ${userId} -> ${chatId}`);
        } else {
          console.warn(`⛔ [Socket.IO] Unauthorized join attempt: ${userId} -> ${chatId}`);
          socket.emit('error', { message: 'Unauthorized access to this chat.' });
        }
      } catch (err) {
        console.error('Error in join_chat:', err);
      }
    });

    socket.on('leave_chat', (data) => {
      if (data.chatId) {
        socket.leave(data.chatId);
        console.log(`[Socket.IO] Left chat: ${data.chatId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] Disconnected: ${socket.id}`);
      // Cleanup happens automatically for rooms, but custom maps need manual cleanup
      for (const pid in providerSockets) {
        if (providerSockets[pid] === socket.id) delete providerSockets[pid];
      }
      for (const uid in customerSockets) {
        if (customerSockets[uid] === socket.id) delete customerSockets[uid];
      }
    });
  });

  return io;
};

// These objects will store a mapping from a user's Clerk ID to their socket ID
export const providerSockets: { [providerId: string]: string } = {};
export const customerSockets: { [userId: string]: string } = {};

// Deprecated: Old configure function, keeping implementation inside init for now but this export might be dead code if not used elsewhere
export const configureSocketIO = (serverIo: Server) => {
  // This is now handled inside initSocketIO, but keeping purely for signature compatibility if index.ts needed it before refactor.
  // With new index.ts, we won't call this.
};