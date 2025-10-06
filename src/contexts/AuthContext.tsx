import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

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

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (data) {
      const profileData: Profile = {
        id: data.id,
        userId: data.id,
        firstName: data.full_name?.split(' ')[0] || '',
        lastName: data.full_name?.split(' ').slice(1).join(' ') || '',
        bio: data.bio || '',
        department: data.department || '',
        graduationYear: data.graduation_year,
        currentEmployer: data.current_employer || '',
        profileVisibility: data.profile_visibility || 'public',
        skills: data.skills?.map((skill: string, index: number) => ({
          id: `${index}`,
          skillName: skill,
          endorsements: 0
        })) || [],
        interests: data.interests || []
      };
      return profileData;
    }

    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const currentUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'student',
            emailVerified: session.user.email_confirmed_at !== null,
            createdAt: session.user.created_at || new Date().toISOString(),
          };

          setUser(currentUser);

          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      (async () => {
        if (session?.user) {
          const currentUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'student',
            emailVerified: session.user.email_confirmed_at !== null,
            createdAt: session.user.created_at || new Date().toISOString(),
          };

          setUser(currentUser);

          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const currentUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'student',
          emailVerified: data.user.email_confirmed_at !== null,
          createdAt: data.user.created_at || new Date().toISOString(),
        };

        setUser(currentUser);

        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
      }
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
    profileData: Partial<Profile>
  ) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            full_name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || email.split('@')[0]
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            full_name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || email.split('@')[0],
            bio: profileData.bio || '',
            department: profileData.department || '',
            graduation_year: profileData.graduationYear,
            role: role as any
          })
          .eq('id', data.user.id);

        const currentUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: role as UserRole,
          emailVerified: data.user.email_confirmed_at !== null,
          createdAt: data.user.created_at || new Date().toISOString(),
        };

        setUser(currentUser);

        const updatedProfile = await fetchProfile(data.user.id);
        setProfile(updatedProfile);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;

    try {
      const updateData: any = {};

      if (data.firstName !== undefined || data.lastName !== undefined) {
        updateData.full_name = `${data.firstName || profile?.firstName || ''} ${data.lastName || profile?.lastName || ''}`.trim();
      }
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.graduationYear !== undefined) updateData.graduation_year = data.graduationYear;
      if (data.currentEmployer !== undefined) updateData.current_employer = data.currentEmployer;
      if (data.profileVisibility !== undefined) updateData.profile_visibility = data.profileVisibility;
      if (data.skills !== undefined) updateData.skills = data.skills.map(s => s.skillName);
      if (data.interests !== undefined) updateData.interests = data.interests;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
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
