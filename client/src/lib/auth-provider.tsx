import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { apiRequest } from './api';
import { Session, User } from '@supabase/supabase-js';
import { isDemoMode, createDemoUser } from './demo-utils';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  pet_name?: string;
  pet_breed?: string;
  pet_birth_month?: number;
  pet_birth_year?: number;
  pet_gender?: string;
  auth_method: "google" | "email";
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isProfileComplete: () => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  isProfileComplete: () => false,
  refreshUserProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isProfileComplete = (): boolean => {
    if (!userProfile) return false;
    
    // Check mandatory pet fields
    return !!(
      userProfile.pet_name &&
      userProfile.pet_breed &&
      userProfile.pet_birth_month &&
      userProfile.pet_birth_year
    );
  };

  const fetchUserProfile = async (session: Session) => {
    try {
      const response = await apiRequest("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    // Check for demo mode first
    if (isDemoMode()) {
      // Create demo user immediately without any Supabase calls
      const demoUser = createDemoUser();
      setSession(null);
      setUser({
        id: demoUser.id,
        email: demoUser.email,
        user_metadata: {
          first_name: demoUser.first_name,
          last_name: demoUser.last_name,
          full_name: demoUser.full_name,
        }
      } as User);
      setUserProfile(demoUser);
      setLoading(false);
      return;
    }

    // Get initial session for non-demo users
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session).finally(() => setLoading(false));
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth changes for non-demo users
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Skip auth changes if we're in demo mode
      if (isDemoMode()) {
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session).finally(() => setLoading(false));
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (isDemoMode()) {
      // For demo mode, just refresh the demo user
      const demoUser = createDemoUser();
      setUserProfile(demoUser);
      return;
    }
    
    if (session) {
      await fetchUserProfile(session);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    isProfileComplete,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};