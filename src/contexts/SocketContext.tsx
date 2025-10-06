import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface Connection {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface SocketContextType {
  socket: null;
  online: boolean;
  connectionRequests: Connection[];
  connectionUpdates: Connection[];
  sendConnectionRequest: (userId: string) => Promise<void>;
  respondToConnectionRequest: (connectionId: string, accept: boolean) => Promise<void>;
  removeConnection: (connectionId: string) => Promise<void>;
  loadConnections: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: true,
  connectionRequests: [],
  connectionUpdates: [],
  sendConnectionRequest: async () => {},
  respondToConnectionRequest: async () => {},
  removeConnection: async () => {},
  loadConnections: async () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [online, setOnline] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState<Connection[]>([]);
  const [connectionUpdates, setConnectionUpdates] = useState<Connection[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setConnectionRequests([]);
      setConnectionUpdates([]);
      return;
    }

    loadConnections();
    setOnline(true);
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;

    try {
      // Use API calls instead of supabase
      const response = await fetch(`http://localhost:4000/api/connections/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionRequests(data.pendingRequests || []);
        setConnectionUpdates(data.acceptedConnections || []);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const sendConnectionRequest = async (userId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:4000/api/connections/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send connection request');
      }

      await loadConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  };

  const respondToConnectionRequest = async (connectionId: string, accept: boolean) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:4000/api/connections/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ connectionId, accept }),
      });

      if (!response.ok) {
        throw new Error('Failed to respond to connection request');
      }

      await loadConnections();
    } catch (error) {
      console.error('Error responding to connection request:', error);
      throw error;
    }
  };

  const removeConnection = async (connectionId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:4000/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove connection');
      }

      await loadConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: null,
        online,
        connectionRequests,
        connectionUpdates,
        sendConnectionRequest,
        respondToConnectionRequest,
        removeConnection,
        loadConnections
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
