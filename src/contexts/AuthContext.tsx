import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile } from '../types';

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

const API_URL = 'http://localhost:4000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage token
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            const currentUser: User = {
              id: userData.id,
              email: userData.email,
              role: userData.role || 'student',
              emailVerified: true,
              createdAt: userData.createdAt || new Date().toISOString(),
            };
            setUser(currentUser);
            setProfile(userData.profile);
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('profile', JSON.stringify(userData.profile));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Clear any stale data and token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('profile');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      // Cleanup function if needed
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { token, user: userData } = await response.json();
      localStorage.setItem('token', token);

      // Fetch user profile
      const profileResponse = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await profileResponse.json();
      
      // Create user object
      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role || 'student',
        emailVerified: true,
        createdAt: userData.createdAt || new Date().toISOString(),
      };

      // Create profile object
      const profile: Profile = profileData.profile;

      // Update local storage and state
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('profile', JSON.stringify(profile));
      setUser(user);
      setProfile(profile);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const signup = async (
    email: string,
    password: string,
    role: string,
    profileData: Partial<Profile>
  ) => {
    try {
      setIsLoading(true);
      console.log('Signup attempt with:', {
        email,
        role,
        name: email.split('@')[0]
      });
      
      // Sign up with our backend
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
          name: email.split('@')[0], // Use email username as display name
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sign up');
      }

      // Get the token and user data
      const { token, user: userData } = await response.json();
      
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);

      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        emailVerified: true,
        createdAt: userData.createdAt || new Date().toISOString(),
      };

      setUser(user);
      setProfile(userData.profile);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('profile', JSON.stringify(userData.profile));
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint if needed
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
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
