import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import QuickActionCard from './components/QuickActionCard';
import MentorCard from './components/MentorCard';
import EventCard from './components/EventCard';
import AnnouncementCard from './components/AnnouncementCard';
import StatsCard from './components/StatsCard';
import NotificationBanner from './components/NotificationBanner';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { getEvents } from '../../services/eventService';
import { getRecommendedMentors } from '../../services/mentorshipService';
import { getAnnouncements } from '../../services/announcementService';
import { getNotifications, getUnreadCount } from '../../services/notificationService';


const StudentDashboard = () => {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Quick actions (static)
  const quickActions = [
    {
      title: "Find Mentors",
      description: "Connect with alumni and faculty who can guide your career journey",
      icon: "UserSearch",
      link: "/mentor-discovery",
      badge: "New",
      color: "primary"
    },
    {
      title: "Browse Events",
      description: "Discover upcoming workshops, career fairs, and networking events",
      icon: "Calendar",
      link: "/event-discovery",
      badge: "Upcoming",
      color: "accent"
    },
    {
      title: "Update Profile",
      description: "Keep your profile current to get better mentor matches",
      icon: "User",
      link: "/user-profile",
      color: "success"
    },
    {
      title: "View Connections",
      description: "Manage your professional network",
      icon: "Users",
      link: "/connections",
      color: "info"
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Fetch recommended mentors
        const { data: mentors } = await getRecommendedMentors(user.id);
        setRecommendedMentors(mentors.slice(0, 3)); // Show top 3

        // Fetch upcoming events
        const { data: events } = await getEvents({ limit: 3 });
        setUpcomingEvents(events);

        // Fetch recent announcements
        const { data: announcementsData } = await getAnnouncements(3);
        setAnnouncements(announcementsData);

        // Fetch notifications
        const { data: notificationsData } = await getNotifications(user.id, 5);
        setNotifications(notificationsData);

        // Fetch unread count
        const { count } = await getUnreadCount(user.id);
        setUnreadCount(count);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const handleRequestMentorship = async (mentorId) => {
    try {
      const { createMentorshipRequest } = await import('../../services/mentorshipService');
      const { data, error } = await createMentorshipRequest(user.id, mentorId, 'I would like to connect with you for mentorship.');
      if (error) throw error;
      alert('Mentorship request sent successfully!');
    } catch (error) {
      console.error('Failed to request mentorship:', error);
      alert('Failed to send mentorship request. Please try again.');
    }
  };

  const handleEventRSVP = async (eventId, status) => {
    try {
      const { updateEventRSVP } = await import('../../services/eventService');
      const { data, error } = await updateEventRSVP(eventId, user.id, status);
      if (error) throw error;
      // Refresh events data
      const { data: events } = await getEvents({ limit: 3 });
      setUpcomingEvents(events);
    } catch (error) {
      console.error('RSVP failed:', error);
      throw error;
    }
  };

  const handleLikeAnnouncement = async (announcementId, isLiked) => {
    try {
      const { likeAnnouncement, unlikeAnnouncement } = await import('../../services/announcementService');
      if (isLiked) {
        await unlikeAnnouncement(announcementId, user.id);
      } else {
        await likeAnnouncement(announcementId, user.id);
      }
      // Refresh announcements
      const { data: announcementsData } = await getAnnouncements(3);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Like failed:', error);
      throw error;
    }
  };

  const handleCommentAnnouncement = async (announcementId, comment) => {
    try {
      const { addComment } = await import('../../services/announcementService');
      const { data, error } = await addComment(announcementId, user.id, comment);
      if (error) throw error;
      // Refresh announcements
      const { data: announcementsData } = await getAnnouncements(3);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Comment failed:', error);
      throw error;
    }
  };

  // Mock stats for now - in real app, calculate from actual data
  const dashboardStats = [
    {
      title: "Active Connections",
      value: "24",
      subtitle: "3 new this week",
      icon: "Users",
      trend: { type: "up", value: "+12%" },
      color: "primary"
    },
    {
      title: "Events Attended",
      value: "8",
      subtitle: "This semester",
      icon: "Calendar",
      trend: { type: "up", value: "+2" },
      color: "success"
    },
    {
      title: "Mentorship Requests",
      value: "3",
      subtitle: "2 pending responses",
      icon: "UserPlus",
      color: "accent"
    },
    {
      title: "Profile Views",
      value: "127",
      subtitle: "Last 30 days",
      icon: "Eye",
      trend: { type: "up", value: "+18%" },
      color: "secondary"
    }
  ];

  const handleDismissNotification = (notificationId) => {
    setNotifications(prev => prev?.filter(n => n?.id !== notificationId));
  };

  const handleViewAllNotifications = () => {
    console.log('View all notifications');
  };

  const filteredMentors = recommendedMentors?.filter(mentor =>
    mentor?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    mentor?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    mentor?.company?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const filteredEvents = upcomingEvents?.filter(event =>
    event?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    event?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    event?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, {userProfile?.full_name || 'Student'}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening in your campus network today.
                </p>
              </div>
              <div className="mt-4 lg:mt-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Last login:</span>
                  <span className="text-sm font-medium text-foreground">Today at 9:30 AM</span>
                </div>
              </div>
            </div>

            {/* Notifications Banner */}
            {notifications?.length > 0 && (
              <div className="mb-6">
                <NotificationBanner
                  notifications={notifications}
                  onDismiss={handleDismissNotification}
                  onViewAll={handleViewAllNotifications}
                />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions?.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </div>
          </section>

          {/* Dashboard Stats */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats?.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>
          </section>

          {/* Search and Tabs */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'overview' ?'bg-card text-card-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('mentors')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'mentors' ?'bg-card text-card-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Mentors
                  </button>
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'events' ?'bg-card text-card-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Events
                  </button>
                  <button
                    onClick={() => setActiveTab('feed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'feed' ?'bg-card text-card-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Campus Feed
                  </button>
                </div>
              </div>
              
              <div className="w-full sm:w-80">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search mentors, events, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recommended Mentors */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Recommended Mentors</h2>
                  <Link to="/mentor-discovery">
                    <Button variant="outline" size="sm" iconName="ArrowRight">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-muted h-32 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : recommendedMentors?.length > 0 ? (
                    recommendedMentors?.slice(0, 2)?.map((mentor) => (
                      <MentorCard
                        key={mentor?.id}
                        mentor={mentor}
                        onRequestMentorship={handleRequestMentorship}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recommended mentors available at the moment.
                    </div>
                  )}
                </div>
              </section>

              {/* Upcoming Events */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Upcoming Events</h2>
                  <Link to="/event-discovery">
                    <Button variant="outline" size="sm" iconName="ArrowRight">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-muted h-40 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingEvents?.length > 0 ? (
                    upcomingEvents?.slice(0, 2)?.map((event) => (
                      <EventCard
                        key={event?.id}
                        event={event}
                        onRSVP={handleEventRSVP}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming events available.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'mentors' && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Recommended Mentors ({filteredMentors?.length})
                </h2>
                <Link to="/mentor-discovery">
                  <Button variant="outline" iconName="ExternalLink">
                    Advanced Search
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                  <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted h-48 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredMentors?.length > 0 ? (
                  filteredMentors?.map((mentor) => (
                    <MentorCard
                      key={mentor?.id}
                      mentor={mentor}
                      onRequestMentorship={handleRequestMentorship}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No mentors found matching your search.
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'events' && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Upcoming Events ({filteredEvents?.length})
                </h2>
                <Link to="/event-discovery">
                  <Button variant="outline" iconName="ExternalLink">
                    Event Calendar
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted h-64 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredEvents?.length > 0 ? (
                  filteredEvents?.map((event) => (
                    <EventCard
                      key={event?.id}
                      event={event}
                      onRSVP={handleEventRSVP}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No events found matching your search.
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'feed' && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Campus Announcements</h2>
                <Button variant="outline" size="sm" iconName="RefreshCw">
                  Refresh
                </Button>
              </div>
              <div className="max-w-2xl mx-auto space-y-6">
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted h-80 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : announcements?.length > 0 ? (
                  announcements?.map((announcement) => (
                    <AnnouncementCard
                      key={announcement?.id}
                      announcement={announcement}
                      onLike={handleLikeAnnouncement}
                      onComment={handleCommentAnnouncement}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No announcements available at the moment.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Empty State */}
          {((activeTab === 'mentors' && filteredMentors?.length === 0) ||
            (activeTab === 'events' && filteredEvents?.length === 0)) && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or browse all {activeTab}.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                iconName="RefreshCw"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;