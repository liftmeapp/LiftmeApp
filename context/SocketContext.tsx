import { useAuth } from '@clerk/clerk-expo';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, isSignedIn, getToken } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initSocket = async () => {
            if (isSignedIn && userId && !socketRef.current) {
                try {
                    const token = await getToken();
                    if (!isMounted) return;

                    console.log('[SocketProvider] Creating and connecting socket...');
                    const newSocket = io(API_BASE_URL!, {
                        reconnection: true,
                        transports: ['websocket'],
                        auth: { token },
                        query: { clerkId: userId },
                    });

                    socketRef.current = newSocket;

                    newSocket.on('connect', () => {
                        console.log(`[SocketProvider] Socket connected with ID: ${newSocket.id}`);
                    });

                    newSocket.on('disconnect', (reason) => {
                        console.log(`[SocketProvider] Socket disconnected: ${reason}`);
                    });

                    newSocket.on('error', (err) => {
                        console.error('[SocketProvider] Socket error:', err);
                    });

                } catch (error) {
                    console.error('[SocketProvider] Failed to initialize socket:', error);
                }
            } else if (!isSignedIn && socketRef.current) {
                console.log('[SocketProvider] Disconnecting socket due to sign out.');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };

        initSocket();

        return () => {
            isMounted = false;
            if (socketRef.current) {
                console.log('[SocketProvider] Disconnecting socket on provider unmount.');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isSignedIn, userId, getToken]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    );
};
