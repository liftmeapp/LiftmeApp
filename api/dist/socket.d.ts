import { Server } from 'socket.io';
import http from 'http';
export declare const providerSockets: {
    [providerId: string]: string;
};
export declare const customerSockets: {
    [userId: string]: string;
};
export declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const attachSocketServer: (httpServer: http.Server) => void;
//# sourceMappingURL=socket.d.ts.map