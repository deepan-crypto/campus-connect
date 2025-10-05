import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, Conversation } from '../types/messaging';
import { useAuth } from './AuthContext';

interface MessagingContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, content: string) => void;
  createConversation: (participantId: string) => string;
  markAsRead: (conversationId: string) => void;
  getUnreadCount: () => number;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    const storedConversations = localStorage.getItem('conversations');
    const storedMessages = localStorage.getItem('messages');

    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    } else {
      const defaultConversations: Conversation[] = [
        {
          id: 'conv-1',
          participants: ['1', '2'],
          unreadCount: 2,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'conv-2',
          participants: ['1', '3'],
          unreadCount: 0,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setConversations(defaultConversations);
      localStorage.setItem('conversations', JSON.stringify(defaultConversations));
    }

    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      const defaultMessages: Record<string, Message[]> = {
        'conv-1': [
          {
            id: 'msg-1',
            conversationId: 'conv-1',
            senderId: '2',
            content: 'Hi! Thanks for connecting. I saw you are interested in software engineering.',
            messageType: 'text',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: 'msg-2',
            conversationId: 'conv-1',
            senderId: '1',
            content: 'Hello! Yes, I would love to learn more about your experience at Google.',
            messageType: 'text',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
            read: true,
          },
          {
            id: 'msg-3',
            conversationId: 'conv-1',
            senderId: '2',
            content: 'I would be happy to help! I have been working on distributed systems and cloud infrastructure. What specific areas are you interested in?',
            messageType: 'text',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: 'msg-4',
            conversationId: 'conv-1',
            senderId: '1',
            content: 'I am really interested in backend development and system design. Also curious about the interview process at big tech companies.',
            messageType: 'text',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 120000).toISOString(),
            read: true,
          },
          {
            id: 'msg-5',
            conversationId: 'conv-1',
            senderId: '2',
            content: 'Great! System design is crucial. I can share some resources and we can schedule a mock interview if you would like.',
            messageType: 'text',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
          },
          {
            id: 'msg-6',
            conversationId: 'conv-1',
            senderId: '2',
            content: 'Let me know what time works for you!',
            messageType: 'text',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
            read: false,
          },
        ],
        'conv-2': [
          {
            id: 'msg-7',
            conversationId: 'conv-2',
            senderId: '3',
            content: 'Hey! Are you going to the React workshop next week?',
            messageType: 'text',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: 'msg-8',
            conversationId: 'conv-2',
            senderId: '1',
            content: 'Yes, I have already RSVPed! Are you going?',
            messageType: 'text',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000).toISOString(),
            read: true,
          },
          {
            id: 'msg-9',
            conversationId: 'conv-2',
            senderId: '3',
            content: 'Definitely! Maybe we can sit together and work on the exercises.',
            messageType: 'text',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 120000).toISOString(),
            read: true,
          },
        ],
      };
      setMessages(defaultMessages);
      localStorage.setItem('messages', JSON.stringify(defaultMessages));
    }
  }, []);

  const sendMessage = (conversationId: string, content: string) => {
    if (!profile) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      conversationId,
      senderId: profile.id,
      content,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      read: false,
    };

    const updatedMessages = {
      ...messages,
      [conversationId]: [...(messages[conversationId] || []), newMessage],
    };

    const updatedConversations = conversations.map((conv) =>
      conv.id === conversationId
        ? { ...conv, lastMessage: newMessage, updatedAt: new Date().toISOString() }
        : conv
    );

    setMessages(updatedMessages);
    setConversations(updatedConversations);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const createConversation = (participantId: string): string => {
    if (!profile) return '';

    const existingConv = conversations.find(
      (conv) =>
        conv.participants.includes(profile.id) && conv.participants.includes(participantId)
    );

    if (existingConv) {
      return existingConv.id;
    }

    const newConversation: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      participants: [profile.id, participantId],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));

    return newConversation.id;
  };

  const markAsRead = (conversationId: string) => {
    if (!profile) return;

    const conversationMessages = messages[conversationId] || [];
    const updatedMessages = {
      ...messages,
      [conversationId]: conversationMessages.map((msg) =>
        msg.senderId !== profile.id ? { ...msg, read: true } : msg
      ),
    };

    const updatedConversations = conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    );

    setMessages(updatedMessages);
    setConversations(updatedConversations);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const getUnreadCount = (): number => {
    if (!profile) return 0;
    return conversations.reduce((total, conv) => {
      if (conv.participants.includes(profile.id)) {
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
