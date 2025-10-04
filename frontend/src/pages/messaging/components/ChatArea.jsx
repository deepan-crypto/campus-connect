import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import MessageBubble from './MessageBubble';
import { 
  getConversationMessages, 
  sendMessage, 
  sendFileMessage, 
  markConversationAsRead,
  subscribeToMessages 
} from '../../../services/messagingService';

const ChatArea = ({ conversation, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation?.conversation_id || !currentUser?.id) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getConversationMessages(conversation?.conversation_id);
        
        if (fetchError) {
          setError('Failed to load messages');
          return;
        }

        setMessages(data || []);
        
        // Mark conversation as read
        await markConversationAsRead(conversation?.conversation_id, currentUser?.id);
      } catch (err) {
        setError('An error occurred while loading messages');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation?.conversation_id, currentUser?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!conversation?.conversation_id) return;

    const subscription = subscribeToMessages(conversation?.conversation_id, (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT' && newRecord) {
        // Add new message
        setMessages(prev => [...prev, newRecord]);
        
        // Mark as read if not sent by current user
        if (newRecord?.sender_id !== currentUser?.id) {
          markConversationAsRead(conversation?.conversation_id, currentUser?.id);
        }
      } else if (eventType === 'UPDATE' && newRecord) {
        // Update existing message
        setMessages(prev => prev?.map(msg => 
          msg?.id === newRecord?.id ? { ...msg, ...newRecord } : msg
        ));
      } else if (eventType === 'DELETE' && oldRecord) {
        // Remove deleted message
        setMessages(prev => prev?.filter(msg => msg?.id !== oldRecord?.id));
      }
    });

    return () => {
      if (subscription) {
        subscription?.unsubscribe();
      }
    };
  }, [conversation?.conversation_id, currentUser?.id]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!newMessage?.trim() || !conversation?.conversation_id || !currentUser?.id || sending) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const { data, error: sendError } = await sendMessage(
        conversation?.conversation_id,
        currentUser?.id,
        newMessage?.trim(),
        replyTo?.id || null
      );

      if (sendError) {
        setError('Failed to send message');
        return;
      }

      // Message will be added via real-time subscription
      setNewMessage('');
      setReplyTo(null);
    } catch (err) {
      setError('An error occurred while sending the message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file || !conversation?.conversation_id || !currentUser?.id) return;

    setSending(true);
    setError(null);

    try {
      const { data, error: sendError } = await sendFileMessage(
        conversation?.conversation_id,
        currentUser?.id,
        file,
        replyTo?.id || null
      );

      if (sendError) {
        setError('Failed to send file');
        return;
      }

      // Message will be added via real-time subscription
      setReplyTo(null);
    } catch (err) {
      setError('An error occurred while sending the file');
      console.error('Error sending file:', err);
    } finally {
      setSending(false);
      if (fileInputRef?.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={conversation?.avatar_url || '/assets/images/no_image.png'}
              alt={conversation?.conversation_name || 'Conversation'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">
              {conversation?.conversation_name || 'Unknown User'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {conversation?.conversation_type === 'group' 
                ? `${conversation?.participant_count || 0} participants`
                : 'Active now'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="Phone" size={20} className="text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="Video" size={20} className="text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="MoreVertical" size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="MessageCircle" size={32} className="mx-auto mb-2 text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="AlertCircle" size={32} className="mx-auto mb-2 text-error" />
              <p className="text-sm text-error mb-2">{error}</p>
              <button 
                onClick={() => window.location?.reload()}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          messages?.map((message, index) => {
            const showDate = index === 0 || 
              format(new Date(message.created_at), 'yyyy-MM-dd') !== 
              format(new Date(messages[index - 1]?.created_at || 0), 'yyyy-MM-dd');

            return (
              <div key={message?.id}>
                {showDate && (
                  <div className="text-center mb-4">
                    <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={message?.sender?.id === currentUser?.id}
                  onReply={handleReply}
                />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-muted border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Replying to {replyTo?.sender?.display_name || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {replyTo?.content || 'File attachment'}
              </p>
            </div>
            <button
              onClick={cancelReply}
              className="p-1 hover:bg-background rounded"
            >
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex items-end space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef?.current?.click()}
              disabled={sending}
              className="p-3 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            >
              <Icon name="Paperclip" size={20} className="text-muted-foreground" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e?.target?.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded">
                <Icon name="Smile" size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!newMessage?.trim() || sending}
            className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Icon name="Loader2" size={20} className="animate-spin" />
            ) : (
              <Icon name="Send" size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;