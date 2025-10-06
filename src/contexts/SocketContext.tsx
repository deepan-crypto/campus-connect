import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
  connectionRequests: any[];
  connectionUpdates: any[];
  sendConnectionRequest: (userId: string) => void;
  respondToConnectionRequest: (connectionId: string, accept: boolean) => void;
  removeConnection: (connectionId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: false,
  connectionRequests: [],
  connectionUpdates: [],
  sendConnectionRequest: () => {},
  respondToConnectionRequest: () => {},
  removeConnection: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [connectionUpdates, setConnectionUpdates] = useState<any[]>([]);
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  
  // Get auth token
  useEffect(() => {
    const getToken = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        setToken(data.session.access_token);
      }
    };
    
    if (user) {
      getToken();
    }
  }, [user]);

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user) return;
    
    const socketIo = io('http://localhost:4000', {
      transports: ['websocket'],
    });
    
    setSocket(socketIo);
    
    // Handle socket events
    socketIo.on('connect', () => {
      console.log('Socket connected');
      setOnline(true);
      // Authenticate the socket connection
      socketIo.emit('authenticate', token);
    });
    
    socketIo.on('disconnect', () => {
      console.log('Socket disconnected');
      setOnline(false);
    });
    
    socketIo.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });
    
    socketIo.on('connection:request-received', (request) => {
      console.log('New connection request:', request);
      setConnectionRequests(prev => [...prev, request]);
    });
    
    socketIo.on('connection:updated', (connection) => {
      console.log('Connection updated:', connection);
      setConnectionUpdates(prev => [...prev, connection]);
      
      // If connection was accepted or rejected, remove from requests
      if (connection.status === 'accepted' || connection.status === 'rejected') {
        setConnectionRequests(prev => 
          prev.filter(req => req.id !== connection.id)
        );
      }
    });
    
    socketIo.on('connection:removed', ({ connectionId }) => {
      console.log('Connection removed:', connectionId);
      setConnectionUpdates(prev => 
        prev.filter(conn => conn.id !== connectionId)
      );
    });

    socketIo.on('connection:pending-requests', (requests) => {
      console.log('Pending connection requests:', requests);
      setConnectionRequests(requests);
    });
    
    socketIo.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [token, user]);

  // Socket action functions
  const sendConnectionRequest = (userId: string) => {
    if (socket && online) {
      socket.emit('connection:request', { receiverId: userId });
    }
  };

  const respondToConnectionRequest = (connectionId: string, accept: boolean) => {
    if (socket && online) {
      socket.emit('connection:respond', { connectionId, accept });
    }
  };

  const removeConnection = (connectionId: string) => {
    if (socket && online) {
      socket.emit('connection:remove', { connectionId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        online,
        connectionRequests,
        connectionUpdates,
        sendConnectionRequest,
        respondToConnectionRequest,
        removeConnection
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};