import { ReactNode } from 'react';
import { Bell, Home, Calendar, Users, Briefcase, CircleUser as UserCircle, Settings, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMessaging } from '../contexts/MessagingContext';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, logout, user } = useAuth();
  const { getUnreadCount } = useMessaging();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadMessages = getUnreadCount();

  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'connections', label: 'Network', icon: Users },
    { id: 'mentorship', label: 'Mentorship', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessages },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Settings }] : []),
  ];

  const alumniFacultyNavItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'connections', label: 'Network', icon: Users },
    { id: 'mentorship', label: 'Mentorship', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessages },
    { id: 'manage-events', label: 'Manage Events', icon: Calendar },
    { id: 'manage-mentorship', label: 'Manage Mentees', icon: Users },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Settings }] : []),
  ];

  const currentNavItems = (user?.role === 'alumni' || user?.role === 'faculty') ? alumniFacultyNavItems : navItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex-shrink-0 flex items-center ml-2 lg:ml-0">
                <UserCircle className="text-blue-600" size={32} />
                <span className="ml-2 text-xl font-bold text-gray-900">CampusConnect</span>
              </div>
              <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                {currentNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                        currentPage === item.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon size={18} />
                        <span>{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('notifications')}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
              >
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {profile?.firstName}
                </span>
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                      currentPage === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
