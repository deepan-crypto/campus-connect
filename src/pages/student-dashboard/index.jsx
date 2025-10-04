import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import QuickActionCard from './components/QuickActionCard';
import MentorCard from './components/MentorCard';
import EventCard from './components/EventCard';
import AnnouncementCard from './components/AnnouncementCard';
import StatsCard from './components/StatsCard';
import NotificationBanner from './components/NotificationBanner';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';


const StudentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);

  // Mock data
  const quickActions = [
    {
      title: "Find Mentors",
      description: "Connect with alumni and faculty who can guide your career journey",
      icon: "UserSearch",
      link: "/mentor-discovery",
      badge: "3 new",
      color: "primary"
    },
    {
      title: "Browse Events",
      description: "Discover upcoming workshops, career fairs, and networking events",
      icon: "Calendar",
      link: "/event-discovery",
      badge: "12 upcoming",
      color: "accent"
    },
    {
      title: "Update Profile",
      description: "Keep your profile current to get better mentor matches",
      icon: "User",
      link: "/user-profile",
      color: "success"
    }
  ];

  const recommendedMentors = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "Senior Software Engineer",
      company: "Google",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      graduationYear: 2018,
      location: "San Francisco, CA",
      matchScore: 94,
      matchingSkills: ["React", "JavaScript", "Python", "Machine Learning", "Data Structures"],
      rating: 4.9,
      reviewCount: 23
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      title: "Product Manager",
      company: "Microsoft",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      graduationYear: 2016,
      location: "Seattle, WA",
      matchScore: 87,
      matchingSkills: ["Product Strategy", "Agile", "Leadership", "Analytics"],
      rating: 4.8,
      reviewCount: 31
    },
    {
      id: 3,
      name: "Dr. Emily Watson",
      title: "Research Scientist",
      company: "Stanford University",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      graduationYear: 2012,
      location: "Palo Alto, CA",
      matchScore: 82,
      matchingSkills: ["Research", "Data Science", "Statistics", "Academic Writing"],
      rating: 4.9,
      reviewCount: 18
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Career Fair 2024",
      description: "Meet with top tech companies and explore career opportunities in software engineering, data science, and product management.",
      date: "2024-10-15T10:00:00Z",
      location: "Student Union Building",
      type: "career",
      bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
      attendeeCount: 234,
      capacity: 500,
      tags: ["career", "networking", "tech"],
      rsvpStatus: null
    },
    {
      id: 2,
      title: "AI & Machine Learning Workshop",
      description: "Hands-on workshop covering the fundamentals of artificial intelligence and machine learning with practical coding exercises.",
      date: "2024-10-12T14:00:00Z",
      location: "Engineering Lab 205",
      type: "workshop",
      bannerImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
      attendeeCount: 45,
      capacity: 60,
      tags: ["AI", "workshop", "coding"],
      rsvpStatus: "interested"
    },
    {
      id: 3,
      title: "Cultural Night: International Food Festival",
      description: "Celebrate diversity with food, music, and performances from different cultures around the world.",
      date: "2024-10-18T18:00:00Z",
      location: "Campus Quad",
      type: "cultural",
      bannerImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=200&fit=crop",
      attendeeCount: 156,
      capacity: 300,
      tags: ["cultural", "food", "diversity"],
      rsvpStatus: "going"
    }
  ];

  const campusAnnouncements = [
    {
      id: 1,
      title: "New Research Opportunities Available",
      content: `We're excited to announce several new undergraduate research positions in our Computer Science and Engineering departments.\n\nThese positions offer hands-on experience with cutting-edge projects in:\n• Artificial Intelligence and Machine Learning\n• Cybersecurity and Privacy\n• Sustainable Computing Systems\n• Human-Computer Interaction\n\nApplications are due by October 20th. Don't miss this opportunity to work alongside faculty and graduate students on impactful research!`,
      author: {
        name: "Dr. Jennifer Adams",
        role: "Faculty",
        department: "Computer Science Department",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likeCount: 42,
      isLiked: false,
      priority: "high",
      attachments: [
        { name: "Research_Positions_2024.pdf", size: "245 KB" }
      ],
      comments: [
        {
          id: 1,
          author: "Alex Thompson",
          content: "This sounds amazing! When do applications open?",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          avatar: "/assets/images/no_image.png"
        }
      ]
    },
    {
      id: 2,
      title: "Campus Wi-Fi Maintenance Scheduled",
      content: `Please be aware that campus-wide Wi-Fi maintenance is scheduled for this weekend.\n\nMaintenance Window:\n• Saturday, October 7th: 2:00 AM - 6:00 AM\n• Sunday, October 8th: 2:00 AM - 4:00 AM\n\nDuring this time, you may experience intermittent connectivity issues. We recommend downloading any necessary materials beforehand.\n\nThank you for your patience as we work to improve our network infrastructure.`,
      author: {
        name: "Campus IT Services",
        role: "Admin",
        department: "Information Technology",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likeCount: 15,
      isLiked: true,
      priority: "normal",
      comments: []
    }
  ];

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

  const recentNotifications = [
    {
      id: 1,
      type: "mentorship",
      title: "Mentorship Request Accepted",
      message: "Sarah Chen has accepted your mentorship request. You can now start messaging!",
      time: "5 minutes ago",
      actionRequired: true,
      primaryAction: "Start Chat",
      secondaryAction: "View Profile"
    },
    {
      id: 2,
      type: "event",
      title: "Event Reminder",
      message: "AI & Machine Learning Workshop starts in 2 hours. Don\'t forget to bring your laptop!",
      time: "2 hours ago",
      actionRequired: false
    },
    {
      id: 3,
      type: "connection",
      title: "New Connection Request",
      message: "John Smith wants to connect with you. Check out his profile!",
      time: "1 day ago",
      actionRequired: true,
      primaryAction: "Accept",
      secondaryAction: "View Profile"
    }
  ];

  useEffect(() => {
    setNotifications(recentNotifications);
  }, []);

  const handleRequestMentorship = async (mentorId) => {
    try {
      console.log('Requesting mentorship from mentor:', mentorId);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Mentorship request sent successfully!');
    } catch (error) {
      console.error('Failed to request mentorship:', error);
      alert('Failed to send mentorship request. Please try again.');
    }
  };

  const handleEventRSVP = async (eventId, status) => {
    try {
      console.log('RSVP for event:', eventId, 'Status:', status);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return Promise.resolve();
    } catch (error) {
      console.error('RSVP failed:', error);
      throw error;
    }
  };

  const handleLikeAnnouncement = async (announcementId, isLiked) => {
    try {
      console.log('Like announcement:', announcementId, 'Liked:', isLiked);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Like failed:', error);
      throw error;
    }
  };

  const handleCommentAnnouncement = async (announcementId, comment) => {
    try {
      console.log('Comment on announcement:', announcementId, 'Comment:', comment);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Comment failed:', error);
      throw error;
    }
  };

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
                  Welcome back, Alex! 👋
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
                  {recommendedMentors?.slice(0, 2)?.map((mentor) => (
                    <MentorCard
                      key={mentor?.id}
                      mentor={mentor}
                      onRequestMentorship={handleRequestMentorship}
                    />
                  ))}
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
                  {upcomingEvents?.slice(0, 2)?.map((event) => (
                    <EventCard
                      key={event?.id}
                      event={event}
                      onRSVP={handleEventRSVP}
                    />
                  ))}
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
                {filteredMentors?.map((mentor) => (
                  <MentorCard
                    key={mentor?.id}
                    mentor={mentor}
                    onRequestMentorship={handleRequestMentorship}
                  />
                ))}
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
                {filteredEvents?.map((event) => (
                  <EventCard
                    key={event?.id}
                    event={event}
                    onRSVP={handleEventRSVP}
                  />
                ))}
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
                {campusAnnouncements?.map((announcement) => (
                  <AnnouncementCard
                    key={announcement?.id}
                    announcement={announcement}
                    onLike={handleLikeAnnouncement}
                    onComment={handleCommentAnnouncement}
                  />
                ))}
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