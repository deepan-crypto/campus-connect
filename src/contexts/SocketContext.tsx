import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Ensure we have a user and there's no existing socket connection
    if (user && !socket) {
      // Connect to the backend server
      const newSocket = io('http://localhost:4000', {
        // You can add authentication here if needed, e.g.,
        // query: { token: localStorage.getItem('token') }
      });

      newSocket.on('connect', () => {
        console.log('Socket.IO connected successfully:', newSocket.id);
        // Join a room specific to the user to receive targeted events
        if (user.id) {
          newSocket.emit('join_room', user.id);
          console.log(`User ${user.id} joined their socket room.`);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.IO disconnected.');
      });

      // Optional: Listen for connection errors
      newSocket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
      });

      setSocket(newSocket);
    } else if (!user && socket) {
      // If the user logs out, disconnect the socket
      socket.disconnect();
      setSocket(null);
      console.log('Socket.IO disconnected due to user logout.');
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
    // The dependency array ensures this effect runs only when `user` or `socket` changes.
  }, [user, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
