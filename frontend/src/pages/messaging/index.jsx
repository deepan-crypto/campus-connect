import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import ConversationList from './components/ConversationList';
import ChatArea from './components/ChatArea';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import { useAuth } from '../../contexts/AuthContext';
import { getUserConversations, subscribeToConversations } from '../../services/messagingService';

const Messaging = () => {
  const { user, userProfile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await getUserConversations(user?.id);
        
        if (fetchError) {
          setError('Failed to load conversations. Please try again.');
          return;
        }
        
        setConversations(data || []);
      } catch (err) {
        setError('An unexpected error occurred while loading conversations.');
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const subscription = subscribeToConversations(user?.id, (payload) => {
      console.log('Real-time update:', payload);
      
      // Refresh conversations when there are changes
      getUserConversations(user?.id)?.then(({ data, error: fetchError }) => {
        if (!fetchError && data) {
          setConversations(data);
        }
      });
    });

    return () => {
      if (subscription) {
        subscription?.unsubscribe();
      }
    };
  }, [user?.id]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const filteredConversations = conversations?.filter(conv =>
    conv?.conversation_name?.toLowerCase()?.includes(searchQuery?.toLowerCase() || '')
  ) || [];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Messages - CampusConnect</title>
          <meta name="description" content="Connect and communicate with your campus network through direct messaging" />
        </Helmet>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-16 h-screen flex items-center justify-center">
            <div className="text-center">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-lg text-muted-foreground">Loading your conversations...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Messages - CampusConnect</title>
          <meta name="description" content="Connect and communicate with your campus network through direct messaging" />
        </Helmet>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-16 h-screen flex items-center justify-center">
            <div className="text-center">
              <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-error" />
              <p className="text-lg text-foreground mb-4">{error}</p>
              <button 
                onClick={() => window.location?.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Messages - CampusConnect</title>
        <meta name="description" content="Connect and communicate with your campus network through direct messaging" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16 h-screen flex">
          {/* Mobile: Show conversation list or chat area */}
          {isMobileView ? (
            <>
              {!selectedConversation ? (
                <ConversationList
                  conversations={filteredConversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleSelectConversation}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Mobile back button */}
                  <div className="p-4 border-b border-border bg-card flex items-center">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="mr-3 p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Icon name="ArrowLeft" size={20} />
                    </button>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src={selectedConversation?.avatar_url || '/assets/images/no_image.png'}
                          alt={selectedConversation?.conversation_name || 'Conversation'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card bg-success`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{selectedConversation?.conversation_name || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation?.participant_count > 2 ? `${selectedConversation?.participant_count} participants` : 'Active now'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <ChatArea
                    conversation={selectedConversation}
                    currentUser={userProfile || user}
                  />
                </div>
              )}
            </>
          ) : (
            /* Desktop: Show both panels */
            (<>
              <ConversationList
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <ChatArea
                conversation={selectedConversation}
                currentUser={userProfile || user}
              />
            </>)
          )}
        </main>
      </div>
    </>
  );
};

export default Messaging;