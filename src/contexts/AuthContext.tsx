import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Profile } from '@/types';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Will be connected to Supabase once Cloud is enabled
  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Placeholder - will use supabase.auth.getSession()
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const signUp = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      // Placeholder - will use supabase.auth.signUp()
      console.log('Sign up:', email);
      return { error: 'Lovable Cloud not yet connected. Please enable it.' };
    } catch {
      return { error: 'Something went wrong. Please try again.' };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      console.log('Sign in:', email);
      return { error: 'Lovable Cloud not yet connected. Please enable it.' };
    } catch {
      return { error: 'Something went wrong. Please try again.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
  }, [profile]);

  const refreshProfile = useCallback(async () => {
    // Will fetch profile from Supabase
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
