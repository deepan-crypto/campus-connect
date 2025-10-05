import { useState } from 'react';
import { UserPlus, UserCheck, X, Search, Briefcase, GraduationCap } from 'lucide-react';
import { mockProfiles, mockConnections } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

export function ConnectionsPage() {
  const { profile } = useAuth();
  const [connections, setConnections] = useState(mockConnections);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'myNetwork' | 'requests'>('discover');

  const myConnections = connections.filter(
    (c) =>
      (c.requesterId === profile?.id || c.receiverId === profile?.id) && c.status === 'accepted'
  );

  const pendingRequests = connections.filter(
    (c) => c.receiverId === profile?.id && c.status === 'pending'
  );

  const connectedUserIds = new Set([
    ...myConnections.map((c) => (c.requesterId === profile?.id ? c.receiverId : c.requesterId)),
    profile?.id,
  ]);

  const discoverUsers = mockProfiles.filter((p) => !connectedUserIds.has(p.id));

  const filteredDiscoverUsers = discoverUsers.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      user.department?.toLowerCase().includes(query) ||
      user.skills.some((s) => s.skillName.toLowerCase().includes(query))
    );
  });

  const handleConnect = (userId: string) => {
    const newConnection = {
      id: Math.random().toString(36).substr(2, 9),
      requesterId: profile!.id,
      receiverId: userId,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    setConnections([...connections, newConnection]);
  };

  const handleAccept = (connectionId: string) => {
    setConnections(
      connections.map((c) => (c.id === connectionId ? { ...c, status: 'accepted' as const } : c))
    );
  };

  const handleReject = (connectionId: string) => {
    setConnections(connections.filter((c) => c.id !== connectionId));
  };

  const isConnectionPending = (userId: string) => {
    return connections.some(
      (c) =>
        c.requesterId === profile?.id &&
        c.receiverId === userId &&
        c.status === 'pending'
    );
  };

  const UserCard = ({ user }: { user: typeof mockProfiles[0] }) => {
    const isPending = isConnectionPending(user.id);

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{user.department}</p>

            {user.currentEmployer && (
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                <Briefcase size={14} />
                <span>{user.currentEmployer}</span>
              </div>
            )}

            {user.graduationYear && (
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                <GraduationCap size={14} />
                <span>Class of {user.graduationYear}</span>
              </div>
            )}

            {user.bio && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>}

            {user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {user.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {skill.skillName}
                  </span>
                ))}
                {user.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{user.skills.length - 3} more
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
            My Network ({myConnections.length})
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

            <div className="grid gap-6 md:grid-cols-2">
              {filteredDiscoverUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'myNetwork' && (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {myConnections.map((connection) => {
                const userId =
                  connection.requesterId === profile?.id
                    ? connection.receiverId
                    : connection.requesterId;
                const user = mockProfiles.find((p) => p.id === userId);
                return user ? <UserCard key={connection.id} user={user} /> : null;
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
                  const user = mockProfiles.find((p) => p.id === connection.requesterId);
                  if (!user) return null;

                  return (
                    <div
                      key={connection.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </div>
                          )}

                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{user.department}</p>
                            {user.currentEmployer && (
                              <p className="text-sm text-gray-500">{user.currentEmployer}</p>
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
