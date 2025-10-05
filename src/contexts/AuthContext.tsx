import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: string, profileData: Partial<Profile>) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedProfile = localStorage.getItem('profile');

    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
    }

    setIsLoading(false);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const mockUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'student',
            emailVerified: true,
            createdAt: session.user.created_at || new Date().toISOString(),
          };
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('user');
          localStorage.removeItem('profile');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, _password: string) => {
    let mockUser: User;
    let mockProfile: Profile;

    if (email.includes('alumni')) {
      mockUser = {
        id: '1',
        email,
        role: 'alumni',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      mockProfile = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Alumni working at Microsoft. Passionate about mentoring and helping students grow.',
        department: 'Computer Science',
        graduationYear: 2018,
        currentEmployer: 'Microsoft',
        profileVisibility: 'public',
        avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
        skills: [
          { id: '1', skillName: 'React', endorsements: 15 },
          { id: '2', skillName: 'TypeScript', endorsements: 10 },
        ],
        interests: ['Mentorship', 'Web Development', 'Software Architecture'],
      };
    } else if (email.includes('faculty')) {
      mockUser = {
        id: '4',
        email,
        role: 'faculty',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      mockProfile = {
        id: '4',
        firstName: 'Dr. Emily',
        lastName: 'Rodriguez',
        bio: 'Professor of Computer Science. Passionate about education and innovation.',
        department: 'Computer Science',
        profileVisibility: 'public',
        skills: [
          { id: '7', skillName: 'Algorithms', endorsements: 25 },
          { id: '8', skillName: 'Research', endorsements: 30 },
        ],
        interests: ['Education', 'Research', 'Mentoring'],
      };
    } else {
      mockUser = {
        id: '3',
        email,
        role: 'student',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      mockProfile = {
        id: '3',
        firstName: 'Michael',
        lastName: 'Chen',
        bio: 'Data Science enthusiast. Looking to connect with fellow students.',
        department: 'Data Science',
        graduationYear: 2024,
        profileVisibility: 'public',
        skills: [
          { id: '5', skillName: 'Python', endorsements: 7 },
          { id: '6', skillName: 'Machine Learning', endorsements: 5 },
        ],
        interests: ['AI', 'Research', 'Basketball'],
      };
    }

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('profile', JSON.stringify(mockProfile));

    setUser(mockUser);
    setProfile(mockProfile);

    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const signup = async (
    email: string,
    _password: string,
    role: string,
    profileData: Partial<Profile>
  ) => {
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      role: role as User['role'],
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    const mockProfile: Profile = {
      id: mockUser.id,
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      bio: profileData.bio || '',
      department: profileData.department,
      graduationYear: profileData.graduationYear,
      currentEmployer: profileData.currentEmployer,
      profileVisibility: 'public',
      skills: [],
      interests: [],
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('profile', JSON.stringify(mockProfile));

    setUser(mockUser);
    setProfile(mockProfile);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) return;

    const updatedProfile = { ...profile, ...data };
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        signup,
        logout,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
