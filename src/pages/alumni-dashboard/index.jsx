import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MentorshipRequestCard from './components/MentorshipRequestCard';
import CurrentMenteeCard from './components/CurrentMenteeCard';
import EventCard from './components/EventCard';
import AnnouncementCard from './components/AnnouncementCard';
import StatsCard from './components/StatsCard';
import QuickActionCard from './components/QuickActionCard';

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);

  // Mock data for mentorship requests
  const mentorshipRequests = [
    {
      id: 1,
      student: {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        department: "Computer Science",
        university: "Stanford University",
        year: "Junior",
        gpa: "3.8",
        expectedGraduation: "May 2025"
      },
      message: "Hi! I\'m really interested in transitioning into product management after graduation. I\'ve been following your career at Google and would love to learn from your experience. Could you help me understand the key skills needed and how to build a strong PM portfolio?",
      skillsRequested: ["Product Management", "Strategy", "User Research", "Analytics"],
      matchPercentage: 92,
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      student: {
        name: "Marcus Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        department: "Business Administration",
        university: "Stanford University",
        year: "Senior",
        gpa: "3.6",
        expectedGraduation: "December 2024"
      },
      message: "I\'m preparing for consulting interviews and would appreciate guidance on case study preparation and industry insights. Your background at McKinsey would be incredibly valuable for my career preparation.",
      skillsRequested: ["Consulting", "Case Studies", "Business Strategy", "Problem Solving"],
      matchPercentage: 78,
      requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: 3,
      student: {
        name: "Emily Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        department: "Data Science",
        university: "Stanford University",
        year: "Sophomore",
        gpa: "3.9",
        expectedGraduation: "June 2026"
      },
      message: "I\'m passionate about machine learning and AI applications in healthcare. I\'d love to learn about your journey in tech and get advice on building relevant projects and internship opportunities.",
      skillsRequested: ["Machine Learning", "Python", "Data Analysis", "Healthcare Tech"],
      matchPercentage: 85,
      requestedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ];

  // Mock data for current mentees
  const currentMentees = [
    {
      id: 1,
      name: "Alex Thompson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      department: "Computer Science",
      year: "Senior",
      progress: 75,
      focusAreas: ["Software Engineering", "System Design", "Career Planning"],
      sessionsCompleted: 8,
      goalsAchieved: 5,
      monthsActive: 4,
      isOnline: true,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastActivityHours: 2
    },
    {
      id: 2,
      name: "Jessica Park",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      department: "Business",
      year: "Junior",
      progress: 60,
      focusAreas: ["Product Management", "Leadership", "Networking"],
      sessionsCompleted: 6,
      goalsAchieved: 3,
      monthsActive: 3,
      isOnline: false,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastActivityHours: 24
    },
    {
      id: 3,
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      department: "Economics",
      year: "Sophomore",
      progress: 40,
      focusAreas: ["Finance", "Investment Banking", "Excel Modeling"],
      sessionsCompleted: 4,
      goalsAchieved: 2,
      monthsActive: 2,
      isOnline: true,
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      lastActivityHours: 1
    }
  ];

  // Mock data for events
  const upcomingEvents = [
    {
      id: 1,
      title: "Alumni Tech Career Panel",
      description: "Join successful alumni from top tech companies as they share insights about career growth, industry trends, and networking strategies in the technology sector.",
      type: "Career",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: "Memorial Auditorium",
      isVirtual: false,
      bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
      attendeesCount: 156,
      capacity: 200,
      organizer: {
        name: "Career Services",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=50&h=50&fit=crop&crop=face"
      },
      rsvpStatus: null
    },
    {
      id: 2,
      title: "Startup Founder Workshop",
      description: "Learn from successful entrepreneurs about building startups, raising funding, and scaling businesses. Interactive workshop with Q&A sessions.",
      type: "Workshop",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "Virtual Event",
      isVirtual: true,
      bannerImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
      attendeesCount: 89,
      capacity: 150,
      organizer: {
        name: "Entrepreneurship Club",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=50&h=50&fit=crop&crop=face"
      },
      rsvpStatus: "interested"
    },
    {
      id: 3,
      title: "Alumni Networking Mixer",
      description: "Connect with fellow alumni across different industries and graduation years. Enjoy refreshments while building meaningful professional relationships.",
      type: "Networking",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      location: "Alumni Center",
      isVirtual: false,
      bannerImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=200&fit=crop",
      attendeesCount: 234,
      capacity: 300,
      organizer: {
        name: "Alumni Association",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
      },
      rsvpStatus: "going"
    }
  ];

  // Mock data for announcements
  const campusAnnouncements = [
    {
      id: 1,
      title: "New Alumni Mentorship Program Launch",
      content: `We're excited to announce the launch of our enhanced Alumni Mentorship Program!\n\nThis program connects current students with experienced alumni for career guidance, skill development, and professional networking. Key features include:\n\n• Structured mentorship matching based on career interests and skills\n• Monthly virtual meetups and workshops\n• Access to exclusive career resources and job opportunities\n• Recognition program for outstanding mentors\n\nApplications are now open for both mentors and mentees. Join us in building stronger connections within our alumni community.`,
      author: {
        name: "Dr. Jennifer Martinez",
        title: "Director of Alumni Relations",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        type: "Faculty"
      },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likesCount: 47,
      commentsCount: 12,
      isLiked: false,
      isPinned: true,
      tags: ["mentorship", "career", "networking"],
      attachments: [
        { name: "Mentorship_Program_Guide.pdf", size: "2.3 MB" },
        { name: "Application_Form.docx", size: "156 KB" }
      ],
      recentComments: [
        {
          author: {
            name: "Michael Chen",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
          },
          content: "This is exactly what our community needed! Excited to participate as a mentor.",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          author: {
            name: "Sarah Wilson",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
          },
          content: "Great initiative! How do we apply to become mentors?",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 2,
      title: "Campus Innovation Challenge 2024",
      content: `Calling all innovative minds! The annual Campus Innovation Challenge is back with exciting opportunities for students and alumni to collaborate.\n\nThis year's theme: 'Technology for Social Good'\n\nPrizes:\n• First Place: $10,000 + Incubator Program\n• Second Place: $5,000 + Mentorship Package\n• Third Place: $2,500 + Industry Connections\n\nSubmission deadline: November 15, 2024\nDemo Day: December 10, 2024`,
      author: {
        name: "Innovation Hub",
        title: "Campus Innovation Center",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        type: "Department"
      },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      likesCount: 89,
      commentsCount: 23,
      isLiked: true,
      isPinned: false,
      tags: ["innovation", "competition", "technology"],
      attachments: null,
      recentComments: [
        {
          author: {
            name: "Alex Rodriguez",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face"
          },
          content: "Looking for team members with AI/ML background. DM me if interested!",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ]
    }
  ];

  // Mock statistics data
  const statsData = [
    {
      title: "Students Mentored",
      value: "12",
      change: 15,
      changeType: "increase",
      icon: "Users",
      color: "primary"
    },
    {
      title: "Active Mentorships",
      value: "3",
      change: 0,
      changeType: "neutral",
      icon: "UserCheck",
      color: "success"
    },
    {
      title: "Events Attended",
      value: "8",
      change: 25,
      changeType: "increase",
      icon: "Calendar",
      color: "accent"
    },
    {
      title: "Network Connections",
      value: "156",
      change: 8,
      changeType: "increase",
      icon: "Network",
      color: "secondary"
    }
  ];

  // Mock quick actions data
  const quickActions = [
    {
      title: "Browse Students",
      description: "Discover students seeking mentorship in your areas of expertise",
      icon: "Search",
      color: "primary",
      onClick: () => navigate('/mentor-discovery'),
      badge: null
    },
    {
      title: "Create Event",
      description: "Organize networking events, workshops, or career sessions for students",
      icon: "Plus",
      color: "success",
      onClick: () => navigate('/event-discovery'),
      badge: null
    },
    {
      title: "Update Availability",
      description: "Manage your mentorship availability and preferred meeting times",
      icon: "Clock",
      color: "warning",
      onClick: () => navigate('/user-profile'),
      badge: null
    },
    {
      title: "View Messages",
      description: "Check messages from current mentees and connection requests",
      icon: "MessageCircle",
      color: "accent",
      onClick: () => navigate('/messaging'),
      badge: "5"
    }
  ];

  useEffect(() => {
    // Simulate loading notifications
    const newNotifications = [
      { id: 1, type: 'mentorship', message: 'New mentorship request from Sarah Chen', time: '2 min ago' },
      { id: 2, type: 'event', message: 'Reminder: Alumni Tech Panel tomorrow', time: '1 hour ago' }
    ];
    setNotifications(newNotifications);
  }, []);

  const handleAcceptMentorship = (requestId) => {
    console.log('Accepting mentorship request:', requestId);
    // Implementation for accepting mentorship request
  };

  const handleDeclineMentorship = (requestId) => {
    console.log('Declining mentorship request:', requestId);
    // Implementation for declining mentorship request
  };

  const handleMessageMentee = (menteeId) => {
    navigate('/messaging', { state: { userId: menteeId } });
  };

  const handleViewProgress = (menteeId) => {
    console.log('Viewing progress for mentee:', menteeId);
    // Implementation for viewing mentee progress
  };

  const handleEventRSVP = (eventId, status) => {
    console.log('RSVP for event:', eventId, 'Status:', status);
    // Implementation for event RSVP
  };

  const handleViewEventDetails = (eventId) => {
    navigate('/event-discovery', { state: { eventId } });
  };

  const handleLikeAnnouncement = (announcementId) => {
    console.log('Liking announcement:', announcementId);
    // Implementation for liking announcement
  };

  const handleCommentAnnouncement = (announcementId, comment) => {
    console.log('Commenting on announcement:', announcementId, 'Comment:', comment);
    // Implementation for commenting on announcement
  };

  const handleShareAnnouncement = (announcementId) => {
    console.log('Sharing announcement:', announcementId);
    // Implementation for sharing announcement
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData?.map((stat, index) => (
                <StatsCard
                  key={index}
                  title={stat?.title}
                  value={stat?.value}
                  change={stat?.change}
                  changeType={stat?.changeType}
                  icon={stat?.icon}
                  color={stat?.color}
                />
              ))}
            </div>
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions?.map((action, index) => (
                  <QuickActionCard
                    key={index}
                    title={action?.title}
                    description={action?.description}
                    icon={action?.icon}
                    color={action?.color}
                    onClick={action?.onClick}
                    badge={action?.badge}
                  />
                ))}
              </div>
            </div>
            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Recent Campus Announcements</h2>
              <div className="space-y-6">
                {campusAnnouncements?.slice(0, 2)?.map((announcement) => (
                  <AnnouncementCard
                    key={announcement?.id}
                    announcement={announcement}
                    onLike={handleLikeAnnouncement}
                    onComment={handleCommentAnnouncement}
                    onShare={handleShareAnnouncement}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'mentorship':
        return (
          <div className="space-y-8">
            {/* Mentorship Requests */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Mentorship Requests</h2>
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {mentorshipRequests?.length} New
                </span>
              </div>
              <div className="space-y-6">
                {mentorshipRequests?.map((request) => (
                  <MentorshipRequestCard
                    key={request?.id}
                    request={request}
                    onAccept={handleAcceptMentorship}
                    onDecline={handleDeclineMentorship}
                  />
                ))}
              </div>
            </div>
            {/* Current Mentees */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Current Mentees</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentMentees?.map((mentee) => (
                  <CurrentMenteeCard
                    key={mentee?.id}
                    mentee={mentee}
                    onMessage={handleMessageMentee}
                    onViewProgress={handleViewProgress}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Upcoming Events</h2>
                <Button
                  variant="outline"
                  onClick={() => navigate('/event-discovery')}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Create Event
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingEvents?.map((event) => (
                  <EventCard
                    key={event?.id}
                    event={event}
                    onRSVP={handleEventRSVP}
                    onViewDetails={handleViewEventDetails}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Campus Announcements</h2>
              <div className="space-y-6">
                {campusAnnouncements?.map((announcement) => (
                  <AnnouncementCard
                    key={announcement?.id}
                    announcement={announcement}
                    onLike={handleLikeAnnouncement}
                    onComment={handleCommentAnnouncement}
                    onShare={handleShareAnnouncement}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome back, Alex!</h1>
                <p className="text-muted-foreground mt-2">
                  You have {mentorshipRequests?.length} new mentorship requests and {notifications?.length} notifications
                </p>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/user-profile')}
                  iconName="Settings"
                  iconPosition="left"
                >
                  Settings
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/messaging')}
                  iconName="MessageCircle"
                  iconPosition="left"
                >
                  Messages
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: 'Home' },
                { id: 'mentorship', label: 'Mentorship', icon: 'Users', badge: mentorshipRequests?.length },
                { id: 'events', label: 'Events', icon: 'Calendar' },
                { id: 'announcements', label: 'Announcements', icon: 'Bell' }
              ]?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span>{tab?.label}</span>
                  {tab?.badge && tab?.badge > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                      {tab?.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default AlumniDashboard;