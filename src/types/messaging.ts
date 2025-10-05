export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithProfile extends Conversation {
  otherUserProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    department?: string;
  };
}
