import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ConversationList = ({ 
  conversations = [], 
  selectedConversation, 
  onSelectConversation, 
  searchQuery = '', 
  onSearchChange 
}) => {
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'No messages yet';
    return message?.length > maxLength ? `${message?.slice(0, maxLength)}...` : message;
  };

  return (
    <div className="w-full lg:w-80 border-r border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Messages</h2>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="Plus" size={20} className="text-muted-foreground" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Icon name="MessageCircle" size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No conversations yet</p>
            <p className="text-sm text-muted-foreground">Start a conversation to connect with your network</p>
          </div>
        ) : (
          <div className="space-y-0">
            {conversations?.map((conversation) => (
              <button
                key={conversation?.conversation_id}
                onClick={() => onSelectConversation?.(conversation)}
                className={`w-full p-4 hover:bg-muted transition-colors text-left border-b border-border/50 ${
                  selectedConversation?.conversation_id === conversation?.conversation_id
                    ? 'bg-primary/10 border-r-2 border-r-primary' :''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={conversation?.avatar_url || '/assets/images/no_image.png'}
                      alt={conversation?.conversation_name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {conversation?.conversation_name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatLastMessageTime(conversation?.last_message_created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {truncateMessage(conversation?.last_message_content)}
                      </p>
                      
                      {/* Unread count */}
                      {conversation?.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2 flex-shrink-0">
                          {conversation?.unread_count > 99 ? '99+' : conversation?.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Conversation type indicator */}
                    {conversation?.conversation_type === 'group' && (
                      <div className="flex items-center mt-1">
                        <Icon name="Users" size={14} className="text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {conversation?.participant_count} participants
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;