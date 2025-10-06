import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';


const Header = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const location = useLocation();
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const navigationItems = [
    { 
      label: 'Dashboard', 
      path: userProfile?.role === 'alumni' ? '/alumni-dashboard' : '/student-dashboard', 
      icon: 'Home' 
    },
    { label: 'Discover', path: '/mentor-discovery', icon: 'Search' },
    { label: 'Events', path: '/event-discovery', icon: 'Calendar' },
    { label: 'Profile', path: '/user-profile', icon: 'User' },
    { label: 'Messages', path: '/messaging', icon: 'MessageCircle' },
  ];

  useEffect(() => {
    // Fetch notifications when user is available
    const fetchNotifications = async () => {
      if (user?.id) {
        try {
          const { getNotifications, getUnreadCount } = await import('../../services/notificationService');
          const { data } = await getNotifications(user.id, 10);
          setNotifications(data || []);
          const { count } = await getUnreadCount(user.id);
          setUnreadCount(count || 0);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      }
    };

    fetchNotifications();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setIsSearchExpanded(false);
      }
      if (notificationRef?.current && !notificationRef?.current?.contains(event?.target)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    setIsNotificationOpen(false);
  };

  const isActivePath = (path) => {
    if (path === '/student-dashboard' || path === '/alumni-dashboard') {
      return location?.pathname === '/student-dashboard' || location?.pathname === '/alumni-dashboard';
    }
    return location?.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-elevation-1">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <Link to="/student-dashboard" className="flex items-center space-x-3 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="GraduationCap" size={20} color="white" />
          </div>
          <span className="text-xl font-semibold text-foreground hidden sm:block">
            CampusConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative w-full">
            <div className={`relative transition-all duration-200 ${isSearchExpanded ? 'w-full' : 'w-full'}`}>
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <input
                type="text"
                placeholder="Search people, events, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                onFocus={() => setIsSearchExpanded(true)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          >
            <Icon name="Search" size={20} />
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative"
            >
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevation-3 animate-slide-in">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-popover-foreground">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications?.map((notification) => (
                    <button
                      key={notification?.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                        !notification?.is_read ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notification?.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-popover-foreground">{notification?.title}</p>
                          <p className="text-sm text-muted-foreground">{notification?.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification?.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="relative">
                <img
                  src={userProfile?.avatar_url || '/assets/images/no_image.png'}
                  alt={userProfile?.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
                <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-xs font-medium rounded-full ${getRoleColor(userProfile?.role)}`}>
                  {userProfile?.role?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-elevation-3 animate-slide-in">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <img
                      src={userProfile?.avatar_url || '/assets/images/no_image.png'}
                      alt={userProfile?.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-popover-foreground truncate">{userProfile?.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(currentUser?.role)}`}>
                        {currentUser?.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link
                    to="/user-profile"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Icon name="User" size={16} />
                    <span>View Profile</span>
                  </Link>
                  <button className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors w-full text-left">
                    <Icon name="Settings" size={16} />
                    <span>Settings</span>
                  </button>
                  <button className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors w-full text-left">
                    <Icon name="HelpCircle" size={16} />
                    <span>Help & Support</span>
                  </button>
                </div>
                <div className="border-t border-border py-2">
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-error hover:bg-muted transition-colors w-full text-left"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>
      </div>
      {/* Mobile Search Bar */}
      {isSearchExpanded && (
        <div className="md:hidden px-4 pb-4 border-t border-border bg-card">
          <form onSubmit={handleSearch} className="relative">
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              placeholder="Search people, events, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              autoFocus
            />
          </form>
        </div>
      )}
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <nav className="px-4 py-4 space-y-2">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;


