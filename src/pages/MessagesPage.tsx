import { useState, useEffect, useRef } from 'react';
import { Search, Send, Phone, Video, MoreVertical, ArrowLeft, Smile } from 'lucide-react';
import { useMessaging } from '../contexts/MessagingContext';
import { useAuth } from '../contexts/AuthContext';
import { mockProfiles } from '../data/mockData';

export function MessagesPage() {
  const { profile } = useAuth();
  const { conversations, messages, sendMessage, markAsRead } = useMessaging();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedConversationId) {
      markAsRead(selectedConversationId);
      scrollToBottom();
    }
  }, [selectedConversationId, messages]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const selectedMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  const getOtherParticipant = (conversation: typeof conversations[0]) => {
    const otherUserId = conversation.participants.find((id) => id !== profile?.id);
    return mockProfiles.find((p) => p.id === otherUserId) || {
      id: otherUserId || '',
      firstName: 'Unknown',
      lastName: 'User',
    };
  };

  const getLastMessage = (conversation: typeof conversations[0]) => {
    const msgs = messages[conversation.id] || [];
    return msgs[msgs.length - 1];
  };

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;
    sendMessage(selectedConversationId, messageInput);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sortedConversations = [...conversations]
    .filter((conv) => conv.participants.includes(profile?.id || ''))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const filteredConversations = sortedConversations.filter((conv) => {
    const otherUser = getOtherParticipant(conv);
    const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className={`${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        } w-full md:w-96 flex-col border-r border-gray-200`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const lastMessage = getLastMessage(conversation);
              const isSelected = selectedConversationId === conversation.id;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    {'avatarUrl' in otherUser && otherUser.avatarUrl ? (
                      <img
                        src={otherUser.avatarUrl}
                        alt={`${otherUser.firstName} ${otherUser.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {otherUser.firstName[0]}
                        {otherUser.lastName[0]}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {otherUser.firstName} {otherUser.lastName}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500 ml-2">
                          {getTimeDisplay(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p
                        className={`text-sm truncate ${
                          conversation.unreadCount > 0
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {lastMessage.senderId === profile?.id ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft size={20} />
                </button>
                {(() => {
                  const otherUser = getOtherParticipant(selectedConversation);
                  return (
                    <>
                      {'avatarUrl' in otherUser && otherUser.avatarUrl ? (
                        <img
                          src={otherUser.avatarUrl}
                          alt={`${otherUser.firstName} ${otherUser.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {otherUser.firstName[0]}
                          {otherUser.lastName[0]}
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {otherUser.firstName} {otherUser.lastName}
                        </h2>
                        <p className="text-xs text-green-600">Online</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {selectedMessages.map((message, index) => {
                const isOwnMessage = message.senderId === profile?.id;
                const showAvatar =
                  index === 0 || selectedMessages[index - 1].senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    {!isOwnMessage && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold mr-2">
                        {getOtherParticipant(selectedConversation).firstName[0]}
                      </div>
                    )}
                    {!isOwnMessage && !showAvatar && <div className="w-8 mr-2" />}

                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        isOwnMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
                      } rounded-2xl px-4 py-2 shadow-sm`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {getTimeDisplay(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Smile size={24} className="text-gray-600" />
                </button>

                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Messages</h3>
              <p className="text-gray-600">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
