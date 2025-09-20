import { Server } from 'socket.io';
import http from 'http';

// This object will store a mapping from a provider's ID to their socket ID
export const providerSockets: { [providerId: string]: string } = {};
export const customerSockets: { [userId: string]: string } = {};

// Create the Socket.IO server instance
export const io = new Server({
  cors: {
    origin: "*", // In production, you should restrict this to your app's domain
    methods: ["GET", "POST"]
  }
});

// Define what happens when a client connects
io.on('connection', (socket) => {
  console.log('🔌 [Socket.IO] A client connected:', socket.id);

  // Listen for a provider to register themselves
  socket.on('register_provider', (providerId: string) => {
    if (providerId) {
      providerSockets[providerId] = socket.id;
      console.log(`✅ [Socket.IO] Provider registered: ${providerId} with socket ID ${socket.id}`);
    }
  });

  socket.on('register_customer', (userId: string) => {
    if (userId) {
      customerSockets[userId] = socket.id;
      console.log(`✅ [Socket.IO] Customer registered: ${userId} with socket ID ${socket.id}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 [Socket.IO] A client disconnected:', socket.id);
    // Find the provider associated with this socket and remove them from the map
    for (const providerId in providerSockets) {
      if (providerSockets[providerId] === socket.id) {
        delete providerSockets[providerId];
        console.log(`🗑️ [Socket.IO] Provider deregistered: ${providerId}`);
        break;
      }
    }
    for (const userId in customerSockets) {
      if (customerSockets[userId] === socket.id) {
        delete customerSockets[userId];
        console.log(`🗑️ [Socket.IO] Customer deregistered: ${userId}`);
        break;
      }
    }
  });
});

/**
 * Attaches the Socket.IO server to the main HTTP server.
 * @param {http.Server} httpServer The main HTTP server of the application.
 */
export const attachSocketServer = (httpServer: http.Server) => {
  io.attach(httpServer);
};
