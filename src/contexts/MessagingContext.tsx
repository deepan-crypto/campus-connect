import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, Conversation } from '../types/messaging';
import { useAuth } from './AuthContext';

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

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setMessages({});
      return;
    }

    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      // Use API calls instead of supabase
      const response = await fetch(`http://localhost:4000/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:4000/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => ({
          ...prev,
          [conversationId]: data.messages || []
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:4000/api/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const createConversation = async (participantId: string): Promise<string> => {
    if (!user) return '';

    try {
      const response = await fetch(`http://localhost:4000/api/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ participantId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      await loadConversations();
      return data.conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:4000/api/messages/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
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
      }
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
