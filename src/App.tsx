import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { FeedPage } from './pages/FeedPage';
import { EventsPage } from './pages/EventsPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { MentorshipPage } from './pages/MentorshipPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPage } from './pages/AdminPage';
import { MessagesPage } from './pages/MessagesPage';
import { MentorshipDebug } from './components/MentorshipDebug';
import { TestMentorshipPage } from './components/TestMentorshipPage';

// Debug function to auto-login as alumni for testing
function autoLoginAsAlumni() {
  const mockUser = {
    id: '1', // This ID should match the mentor ID in mentorship requests
    email: 'alumni@example.com',
    role: 'alumni',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  };
  
  const mockProfile = {
    id: '1', // This ID should match the mentor ID in mentorship requests
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Alumni working at Microsoft. Passionate about mentoring and helping students grow.',
    department: 'Computer Science',
    graduationYear: 2018,
    currentEmployer: 'Microsoft',
    profileVisibility: 'public',
    skills: [
      { id: '1', skillName: 'React', endorsements: 15 },
      { id: '2', skillName: 'TypeScript', endorsements: 10 },
    ],
    interests: ['Mentorship', 'Web Development', 'Software Architecture'],
  };

  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem('profile', JSON.stringify(mockProfile));
}

// Check for a special URL param to auto-login
if (window.location.search.includes('alumni=true')) {
  autoLoginAsAlumni();
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(window.location.search.includes('alumni=true') ? 'mentorship' : 'feed');

  // Debug logging
  console.log("=== AppContent Render ===");
  console.log("User:", user);
  console.log("Current Page:", currentPage);

  // Check for direct page routing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
      setCurrentPage(page);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onNavigate={setCurrentPage} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'feed':
        return <FeedPage />;
      case 'events':
        return <EventsPage />;
      case 'connections':
        return <ConnectionsPage />;
      case 'mentorship':
        return <MentorshipPage />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'manage-events':
        return <EventsPage managementMode={true} />;
      case 'manage-mentorship':
        return <MentorshipPage />; // For now, reuse MentorshipPage but could be a separate manage page
      case 'admin':
        return user.role === 'admin' ? <AdminPage /> : <FeedPage />;
      case 'test-mentorship':
        return <TestMentorshipPage />;
      default:
        return <FeedPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <MentorshipDebug />
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <MessagingProvider>
        <AppContent />
      </MessagingProvider>
    </AuthProvider>
  );
}

export default App;
