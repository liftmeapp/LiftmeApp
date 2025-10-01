"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSocketServer = exports.io = exports.customerSockets = exports.providerSockets = void 0;
const socket_io_1 = require("socket.io");
exports.providerSockets = {};
exports.customerSockets = {};
exports.io = new socket_io_1.Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
exports.io.on('connection', (socket) => {
    console.log('🔌 [Socket.IO] A client connected:', socket.id);
    socket.on('register_provider', (providerId) => {
        if (providerId) {
            exports.providerSockets[providerId] = socket.id;
            console.log(`✅ [Socket.IO] Provider registered: ${providerId} with socket ID ${socket.id}`);
        }
    });
    socket.on('register_customer', (userId) => {
        if (userId) {
            exports.customerSockets[userId] = socket.id;
            console.log(`✅ [Socket.IO] Customer registered: ${userId} with socket ID ${socket.id}`);
        }
    });
    socket.on('disconnect', () => {
        console.log('🔌 [Socket.IO] A client disconnected:', socket.id);
        for (const providerId in exports.providerSockets) {
            if (exports.providerSockets[providerId] === socket.id) {
                delete exports.providerSockets[providerId];
                console.log(`🗑️ [Socket.IO] Provider deregistered: ${providerId}`);
                break;
            }
        }
        for (const userId in exports.customerSockets) {
            if (exports.customerSockets[userId] === socket.id) {
                delete exports.customerSockets[userId];
                console.log(`🗑️ [Socket.IO] Customer deregistered: ${userId}`);
                break;
            }
        }
    });
});
const attachSocketServer = (httpServer) => {
    exports.io.attach(httpServer);
};
exports.attachSocketServer = attachSocketServer;
//# sourceMappingURL=socket.js.map