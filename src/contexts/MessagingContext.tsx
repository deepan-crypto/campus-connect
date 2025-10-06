import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, Conversation } from '../types/messaging';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface MessagingContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (participantId: string) => Promise<string>;
  markAsRead: (conversationId: string) => void;
  getUnreadCount: () => number;
  loadMessages: (conversationId: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setMessages({});
      return;
    }

    loadConversations();

    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          handleNewMessage(payload.new as any);
        }
      )
      .subscribe();

    setChannel(messagesChannel);

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data: convParticipants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      if (!convParticipants || convParticipants.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = convParticipants.map(cp => cp.conversation_id);

      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          type,
          name,
          created_at,
          updated_at
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              profiles:user_id (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id);

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .eq('status', 'sent');

          return {
            id: conv.id,
            participants: [user.id, ...(participants?.map(p => p.user_id) || [])],
            unreadCount: unreadCount || 0,
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              conversationId: lastMessage.conversation_id,
              senderId: lastMessage.sender_id,
              content: lastMessage.content,
              messageType: lastMessage.message_type || 'text',
              createdAt: lastMessage.created_at,
              read: lastMessage.status === 'read'
            } : undefined,
            createdAt: conv.created_at,
            updatedAt: conv.updated_at
          } as Conversation;
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        messageType: msg.message_type || 'text',
        createdAt: msg.created_at,
        read: msg.status === 'read'
      }));

      setMessages(prev => ({
        ...prev,
        [conversationId]: mappedMessages
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewMessage = (newMessage: any) => {
    const message: Message = {
      id: newMessage.id,
      conversationId: newMessage.conversation_id,
      senderId: newMessage.sender_id,
      content: newMessage.content,
      messageType: newMessage.message_type || 'text',
      createdAt: newMessage.created_at,
      read: newMessage.status === 'read'
    };

    setMessages(prev => {
      const conversationMessages = prev[newMessage.conversation_id] || [];
      if (conversationMessages.some(m => m.id === message.id)) {
        return prev;
      }
      return {
        ...prev,
        [newMessage.conversation_id]: [...conversationMessages, message]
      };
    });

    setConversations(prev => {
      return prev.map(conv => {
        if (conv.id === newMessage.conversation_id) {
          return {
            ...conv,
            lastMessage: message,
            updatedAt: newMessage.created_at,
            unreadCount: newMessage.sender_id !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
          };
        }
        return conv;
      });
    });
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text',
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const createConversation = async (participantId: string): Promise<string> => {
    if (!user) return '';

    try {
      const existingConv = conversations.find(
        (conv) =>
          conv.participants.includes(user.id) && conv.participants.includes(participantId)
      );

      if (existingConv) {
        return existingConv.id;
      }

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          created_by: user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      const { error: participant1Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id
        });

      if (participant1Error) throw participant1Error;

      const { error: participant2Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: participantId
        });

      if (participant2Error) throw participant2Error;

      const newConversation: Conversation = {
        id: conversation.id,
        participants: [user.id, participantId],
        unreadCount: 0,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at
      };

      setConversations(prev => [newConversation, ...prev]);

      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('status', 'sent');

      setMessages(prev => {
        const conversationMessages = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: conversationMessages.map(msg =>
            msg.senderId !== user.id ? { ...msg, read: true } : msg
          )
        };
      });

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getUnreadCount = (): number => {
    if (!user) return 0;
    return conversations.reduce((total, conv) => {
      if (conv.participants.includes(user.id)) {
        return total + conv.unreadCount;
      }
      return total;
    }, 0);
  };

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        messages,
        sendMessage,
        createConversation,
        markAsRead,
        getUnreadCount,
        loadMessages,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
