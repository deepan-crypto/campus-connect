import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: string, name: string, department?: string, year?: string) => Promise<void>;
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
    // Initialize auth state from localStorage token
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`http://localhost:4000/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            const currentUser: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role || 'student',
              emailVerified: true,
              createdAt: userData.createdAt || new Date().toISOString(),
            };
            setUser(currentUser);
            setProfile(userData.profile);
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('profile', JSON.stringify(userData.profile || null));
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
      const response = await fetch(`http://localhost:4000/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
      }

      const data = await response.json();
      const user = data.user;
      const token = data.token;

      setUser(user);
      setProfile(user.profile);
      // Trigger a re-render by updating the user state
      setUser({ ...user });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('profile', JSON.stringify(user.profile || null));
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    role: string,
    name: string,
    department?: string,
    year?: string
  ) => {
    try {
      setIsLoading(true);
      console.log('Signup request payload:', { email, role, name, department, year });

      const response = await fetch(`http://localhost:4000/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          role,
          name,
          department,
          year
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Server response:', data);
        throw new Error(data.error || 'Failed to sign up');
      }

      const user = data.user;
      const token = data.token;

      // Set user data in context and localStorage
      setUser(user);
      setProfile(user.profile);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.profile) {
        localStorage.setItem('profile', JSON.stringify(user.profile));
      }
      console.log('Signup successful. User:', user, 'Role:', user.role);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`http://localhost:4000/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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

      const response = await fetch(`http://localhost:4000/api/users/${user.id}/profile`, {
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
