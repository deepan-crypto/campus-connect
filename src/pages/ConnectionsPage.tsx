import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, X, Search, Briefcase, GraduationCap } from 'lucide-react';
import { mockProfiles } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../api';

export function ConnectionsPage() {
  const { user, profile } = useAuth();
  const { sendConnectionRequest, respondToConnectionRequest, removeConnection, connectionRequests, connectionUpdates } = useSocket();
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'myNetwork' | 'requests'>('discover');
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);

  // Initial data loading
  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  // Handle real-time connection updates
  useEffect(() => {
    if (connectionRequests.length > 0) {
      setPendingRequests(prev => {
        // Only add unique requests
        const newRequests = connectionRequests.filter(req => 
          !prev.some(p => p.id === req.id)
        );
        return [...prev, ...newRequests];
      });
    }
  }, [connectionRequests]);

  useEffect(() => {
    if (connectionUpdates.length > 0) {
      const latestUpdate = connectionUpdates[connectionUpdates.length - 1];
      
      // Update connections list if status changed
      if (latestUpdate.status === 'accepted') {
        setConnections(prev => {
          // Check if connection already exists
          if (!prev.some(c => c.id === latestUpdate.id)) {
            return [...prev, latestUpdate];
          }
          return prev.map(c => c.id === latestUpdate.id ? latestUpdate : c);
        });
        
        // Remove from pending and sent requests
        setPendingRequests(prev => prev.filter(r => r.id !== latestUpdate.id));
        setSentRequests(prev => prev.filter(r => r.id !== latestUpdate.id));
      } else if (latestUpdate.status === 'rejected') {
        // Remove from all lists
        setPendingRequests(prev => prev.filter(r => r.id !== latestUpdate.id));
        setSentRequests(prev => prev.filter(r => r.id !== latestUpdate.id));
        setConnections(prev => prev.filter(c => c.id !== latestUpdate.id));
      }
    }
  }, [connectionUpdates]);

  // Load connection data from API
  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const response = await api('/connections/me');
      if (!response) {
        throw new Error('Failed to load connections data');
      }
      setConnections(response.connections || []);
      setPendingRequests(response.pendingRequests || []);
      setSentRequests(response.sentRequests || []);
      
      // Load connection suggestions
      const suggestionsResponse = await api('/connections/suggestions');
      if (suggestionsResponse) {
        setSuggestions(suggestionsResponse);
      } else {
        // Only use mock data if suggestions specifically fail
        const mockConnectionData = mockProfiles.filter(p => p.id !== profile?.id).slice(0, 5);
        setSuggestions(mockConnectionData);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
      // Show error message to user but keep trying with mock data as fallback
      const mockConnectionData = mockProfiles.filter(p => p.id !== profile?.id).slice(0, 5);
      setSuggestions(mockConnectionData);
      setConnections([]);
      setPendingRequests([]);
      setSentRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter suggestions based on search
  const filteredSuggestions = suggestions.filter((user) => {
    const fullName = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''} ${user.name || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const department = user.profile?.department?.toLowerCase() || '';
    const skills = user.profile?.skills || [];
    
    return (
      fullName.includes(query) ||
      department.includes(query) ||
      skills.some((s: any) => s.skillName.toLowerCase().includes(query))
    );
  });

  // Handle connection request
  const handleConnect = (userId: string) => {
    sendConnectionRequest(userId);
    // Optimistically update UI
    const newRequest = {
      id: `temp-${Date.now()}`,
      requesterId: user!.id,
      receiverId: userId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setSentRequests([...sentRequests, newRequest]);
  };

  // Handle accepting a connection request
  const handleAccept = (connectionId: string) => {
    respondToConnectionRequest(connectionId, true);
    // Optimistically update UI
    const request = pendingRequests.find(r => r.id === connectionId);
    if (request) {
      setPendingRequests(pendingRequests.filter(r => r.id !== connectionId));
      setConnections([...connections, {...request, status: 'accepted'}]);
    }
  };

  // Handle rejecting a connection request
  const handleReject = (connectionId: string) => {
    respondToConnectionRequest(connectionId, false);
    // Optimistically update UI
    setPendingRequests(pendingRequests.filter(r => r.id !== connectionId));
  };

  // Check if connection request is pending
  const isConnectionPending = (userId: string) => {
    return sentRequests.some(r => r.receiverId === userId && r.status === 'pending');
  };

  const UserCard = ({ user }: { user: any }) => {
    const isPending = isConnectionPending(user.id);
    const profile = user.profile || {};
    const name = user.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const department = profile.department || user.role || '';

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
              {name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900">
              {name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{department}</p>

            {profile.currentEmployer && (
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                <Briefcase size={14} />
                <span>{profile.currentEmployer}</span>
              </div>
            )}

            {profile.graduationYear && (
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                <GraduationCap size={14} />
                <span>Class of {profile.graduationYear}</span>
              </div>
            )}

            {profile.bio && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{profile.bio}</p>}

            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {profile.skills.slice(0, 3).map((skill: any) => (
                  <span
                    key={skill.id}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {skill.skillName}
                  </span>
                ))}
                {profile.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{profile.skills.length - 3} more
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => handleConnect(user.id)}
              disabled={isPending}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isPending
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPending ? (
                <>
                  <UserCheck size={18} />
                  <span>Request Sent</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Connect</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Network</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'discover'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('myNetwork')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'myNetwork'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Network ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-4 font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'discover' && (
          <div className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, department, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredSuggestions.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
                
                {filteredSuggestions.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-600">No users found matching your search criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'myNetwork' && (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {connections.map((connection) => {
                const user = connection.receiver?.id === profile?.id 
                  ? connection.requester 
                  : connection.receiver;
                  
                if (!user) return null;
                
                return (
                  <div key={connection.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      {user.profile?.avatarUrl ? (
                        <img 
                          src={user.profile.avatarUrl}
                          alt={user.name || "User"}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                          {(user.name || "?").charAt(0)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-600">{user.role || user.profile?.department}</p>
                            {user.profile?.bio && <p className="text-sm text-gray-600 mt-2">{user.profile.bio}</p>}
                          </div>
                          <button
                            onClick={() => {
                              removeConnection(connection.id);
                              // Optimistically update UI
                              setConnections(prev => prev.filter(c => c.id !== connection.id));
                            }}
                            className="text-gray-400 hover:text-red-600"
                            title="Remove connection"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="p-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No pending connection requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((connection) => {
                  const requester = connection.requester;
                  if (!requester) return null;
                  const profile = requester.profile || {};
                  const name = requester.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
                  const department = profile.department || requester.role || '';

                  return (
                    <div
                      key={connection.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {profile.avatarUrl ? (
                            <img
                              src={profile.avatarUrl}
                              alt={name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                              {name.charAt(0)}
                            </div>
                          )}

                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {name}
                            </h3>
                            <p className="text-sm text-gray-600">{department}</p>
                            {profile.currentEmployer && (
                              <p className="text-sm text-gray-500">{profile.currentEmployer}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAccept(connection.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(connection.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
