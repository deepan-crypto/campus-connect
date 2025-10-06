import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setConnectionRequests([]);
      setConnectionUpdates([]);
      return;
    }

    loadConnections();

    const connectionsChannel = supabase
      .channel('connections-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          handleConnectionChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `sender_id=eq.${user.id}`
        },
        (payload) => {
          handleConnectionChange(payload);
        }
      )
      .subscribe();

    setChannel(connectionsChannel);
    setOnline(true);

    return () => {
      connectionsChannel.unsubscribe();
    };
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;

    try {
      const { data: pending, error: pendingError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      setConnectionRequests(pending || []);

      const { data: accepted, error: acceptedError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:sender_id (
            id,
            full_name,
            avatar_url
          ),
          receiver:receiver_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (acceptedError) throw acceptedError;

      setConnectionUpdates(accepted || []);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handleConnectionChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      const connection = newRecord as Connection;
      if (connection.receiver_id === user?.id && connection.status === 'pending') {
        loadConnections();
      }
    } else if (eventType === 'UPDATE') {
      const connection = newRecord as Connection;
      if (connection.status === 'accepted' || connection.status === 'declined') {
        loadConnections();
      }
    } else if (eventType === 'DELETE') {
      setConnectionRequests(prev => prev.filter(c => c.id !== oldRecord.id));
      setConnectionUpdates(prev => prev.filter(c => c.id !== oldRecord.id));
    }
  };

  const sendConnectionRequest = async (userId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          status: 'pending'
        })
        .select(`
          *,
          requester:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      console.log('Connection request sent:', data);
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  };

  const respondToConnectionRequest = async (connectionId: string, accept: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .update({
          status: accept ? 'accepted' : 'declined'
        })
        .eq('id', connectionId)
        .eq('receiver_id', user.id);

      if (error) throw error;

      await loadConnections();
    } catch (error) {
      console.error('Error responding to connection request:', error);
      throw error;
    }
  };

  const removeConnection = async (connectionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) throw error;

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
