import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ProfileHeader from './components/ProfileHeader';
import SkillsSection from './components/SkillsSection';
import InterestsSection from './components/InterestsSection';
import ActivityFeed from './components/ActivityFeed';
import PrivacySettings from './components/PrivacySettings';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Mock current user ID - in real app, this would come from auth context
  const currentUserId = 'current-user-123';

  // Mock user data
  const mockUsers = {
    'current-user-123': {
      id: 'current-user-123',
      name: 'Alex Thompson',
      role: 'Student',
      department: 'Computer Science',
      graduationYear: 2025,
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: `Passionate computer science student with a focus on artificial intelligence and machine learning. Currently working on research projects involving natural language processing and computer vision. Always eager to learn new technologies and collaborate on innovative projects.`,
      currentEmployer: null,
      currentPosition: null,
      stats: {
        connections: 156,
        endorsements: 23,
        eventsAttended: 12
      },
      skills: [
        {
          id: 1,
          name: 'React.js',
          endorsementCount: 8,
          endorsedByUser: false,
          recentEndorsers: [
            { name: 'Sarah Johnson' },
            { name: 'Mike Chen' },
            { name: 'Lisa Wang' }
          ]
        },
        {
          id: 2,
          name: 'Python',
          endorsementCount: 12,
          endorsedByUser: false,
          recentEndorsers: [
            { name: 'Dr. Smith' },
            { name: 'Emma Davis' }
          ]
        },
        {
          id: 3,
          name: 'Machine Learning',
          endorsementCount: 6,
          endorsedByUser: false,
          recentEndorsers: [
            { name: 'Prof. Anderson' }
          ]
        },
        {
          id: 4,
          name: 'Data Analysis',
          endorsementCount: 9,
          endorsedByUser: false,
          recentEndorsers: [
            { name: 'John Miller' },
            { name: 'Kate Wilson' }
          ]
        }
      ],
      interests: [
        { id: 1, name: 'Artificial Intelligence', category: 'Technology' },
        { id: 2, name: 'Startup Culture', category: 'Business' },
        { id: 3, name: 'Photography', category: 'Arts' },
        { id: 4, name: 'Rock Climbing', category: 'Sports' },
        { id: 5, name: 'Quantum Computing', category: 'Science', isPopular: true },
        { id: 6, name: 'Tech Meetups', category: 'Social' },
        { id: 7, name: 'Research Papers', category: 'Academic' },
        { id: 8, name: 'Career Development', category: 'Career' }
      ],
      activities: [
        {
          id: 1,
          type: 'post',
          title: 'Shared a post about AI trends',
          description: 'Just attended an amazing workshop on the future of AI in healthcare. The potential applications are incredible!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likes: 15,
          comments: 3
        },
        {
          id: 2,
          type: 'event',
          title: 'Attended Tech Career Fair 2024',
          description: 'Great networking opportunities and learned about exciting internship programs.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          metadata: {
            eventName: 'Tech Career Fair 2024',
            eventDate: 'October 3, 2024',
            eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
          }
        },
        {
          id: 3,
          type: 'connection',
          title: 'Connected with Sarah Johnson',
          description: 'Now connected with Sarah Johnson, Software Engineer at Google.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          metadata: {
            connectionName: 'Sarah Johnson',
            connectionRole: 'Software Engineer at Google',
            connectionAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
          }
        },
        {
          id: 4,
          type: 'endorsement',
          title: 'Received endorsement for React.js',
          description: 'Mike Chen endorsed you for React.js',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          metadata: {
            skill: 'React.js'
          }
        }
      ],
      privacySettings: {
        profileVisibility: 'public',
        contactInfo: 'network',
        activityFeed: 'network',
        searchable: true,
        showOnlineStatus: true,
        allowMentorshipRequests: false,
        notifications: {
          connectionRequests: true,
          endorsements: true,
          mentorshipRequests: false,
          eventInvitations: true,
          weeklyDigest: true
        }
      }
    },
    'user-456': {
      id: 'user-456',
      name: 'Dr. Sarah Johnson',
      role: 'Alumni',
      department: 'Computer Science',
      graduationYear: 2018,
      profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      bio: `Senior Software Engineer at Google with 6+ years of experience in full-stack development and machine learning. Passionate about mentoring students and helping them navigate their career paths in tech. Specialized in distributed systems and AI applications.`,
      currentEmployer: 'Google',
      currentPosition: 'Senior Software Engineer',
      stats: {
        connections: 342,
        endorsements: 67,
        eventsAttended: 28
      },
      skills: [
        {
          id: 1,
          name: 'JavaScript',
          endorsementCount: 25,
          endorsedByUser: false,
          recentEndorsers: [
            { name: 'Alex Thompson' },
            { name: 'Mike Chen' },
            { name: 'Lisa Wang' }
          ]
        },
        {
          id: 2,
          name: 'System Design',
          endorsementCount: 18,
          endorsedByUser: true,
          recentEndorsers: [
            { name: 'John Smith' },
            { name: 'Emma Davis' }
          ]
        },
        {
          id: 3,
          name: 'Leadership',
          endorsementCount: 22,
          endorsedByUser: false,
          recentEndorsers: [
            { name: 'Prof. Anderson' },
            { name: 'Kate Wilson' }
          ]
        }
      ],
      interests: [
        { id: 1, name: 'Machine Learning', category: 'Technology' },
        { id: 2, name: 'Mentorship', category: 'Career' },
        { id: 3, name: 'Travel', category: 'Social' },
        { id: 4, name: 'Public Speaking', category: 'Career' }
      ],
      activities: [
        {
          id: 1,
          type: 'mentorship',
          title: 'Started mentoring 3 new students',
          description: 'Excited to guide the next generation of engineers in their career journey.',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
          id: 2,
          type: 'post',
          title: 'Shared insights on system design',
          description: 'Key principles for designing scalable distributed systems - lessons learned from 6 years at Google.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          likes: 42,
          comments: 8
        }
      ],
      privacySettings: {
        profileVisibility: 'public',
        contactInfo: 'network',
        activityFeed: 'public'
      }
    }
  };

  useEffect(() => {
    // Simulate loading user data
    const loadUserData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const targetUserId = userId || currentUserId;
      const userData = mockUsers?.[targetUserId];
      
      if (userData) {
        setUser(userData);
        setIsOwnProfile(targetUserId === currentUserId);
        
        // Set connection status based on user relationship
        if (targetUserId === currentUserId) {
          setConnectionStatus('own');
        } else if (targetUserId === 'user-456') {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('none');
        }
      }
      
      setLoading(false);
    };

    loadUserData();
  }, [userId, currentUserId]);

  const handleConnectionAction = () => {
    if (connectionStatus === 'none') {
      setConnectionStatus('pending');
      console.log('Connection request sent');
    }
  };

  const handleMessageAction = () => {
    navigate('/messaging', { state: { userId: user?.id, userName: user?.name } });
  };

  const handleMentorshipRequest = () => {
    console.log('Mentorship request sent to:', user?.name);
    // In real app, this would send a mentorship request
  };

  const handleEndorseSkill = (skillId) => {
    setUser(prevUser => ({
      ...prevUser,
      skills: prevUser?.skills?.map(skill => 
        skill?.id === skillId 
          ? { 
              ...skill, 
              endorsedByUser: true, 
              endorsementCount: skill?.endorsementCount + 1 
            }
          : skill
      )
    }));
    console.log('Endorsed skill:', skillId);
  };

  const handlePrivacySettingsUpdate = (newSettings) => {
    setUser(prevUser => ({
      ...prevUser,
      privacySettings: newSettings
    }));
    console.log('Privacy settings updated:', newSettings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-6">
                  <div className="w-32 h-32 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 h-64"></div>
                  <div className="bg-card border border-border rounded-lg p-6 h-64"></div>
                </div>
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 h-64"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The profile you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => navigate('/student-dashboard')}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <ProfileHeader
              user={user}
              isOwnProfile={isOwnProfile}
              connectionStatus={connectionStatus}
              onConnectionAction={handleConnectionAction}
              onMessageAction={handleMessageAction}
              onMentorshipRequest={handleMentorshipRequest}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Skills and Interests */}
            <div className="lg:col-span-2 space-y-8">
              <SkillsSection
                skills={user?.skills}
                isOwnProfile={isOwnProfile}
                connectionStatus={connectionStatus}
                onEndorseSkill={handleEndorseSkill}
              />
              
              <InterestsSection
                interests={user?.interests}
                isOwnProfile={isOwnProfile}
              />
              
              <ActivityFeed
                activities={user?.activities}
                isOwnProfile={isOwnProfile}
              />
            </div>

            {/* Right Column - Privacy Settings (only for own profile) */}
            <div className="space-y-8">
              {isOwnProfile && (
                <PrivacySettings
                  settings={user?.privacySettings}
                  onSettingsUpdate={handlePrivacySettingsUpdate}
                />
              )}
              
              {/* Connection Suggestions or Related Profiles */}
              {!isOwnProfile && (
                <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    People You May Know
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        name: 'Mike Chen',
                        role: 'Student',
                        department: 'Computer Science',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                        mutualConnections: 5
                      },
                      {
                        name: 'Lisa Wang',
                        role: 'Alumni',
                        department: 'Data Science',
                        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
                        mutualConnections: 3
                      }
                    ]?.map((person, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:shadow-elevation-2 transition-shadow">
                        <img
                          src={person?.avatar}
                          alt={person?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{person?.name}</p>
                          <p className="text-sm text-muted-foreground">{person?.role} • {person?.department}</p>
                          <p className="text-xs text-muted-foreground">{person?.mutualConnections} mutual connections</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;