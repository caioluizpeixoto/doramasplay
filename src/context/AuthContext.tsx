import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Profile, Subscription } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSubscriber: boolean;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  selectProfile: (profile: Profile) => void;
  subscribeToPlan: (planId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'user-default',
  email: 'dorameiro@doramasplay.com',
  name: 'Caio Doramas',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'admin', // Demo starts as admin so all pages (including /admin) can be tested immediately
  subscription: {
    id: 'sub-active',
    user_id: 'user-default',
    plan_id: 'plan-3',
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
    provider: 'doramasplay-vip',
    external_subscription_id: 'sub_vip_12345',
    created_at: new Date().toISOString(),
  }
};

const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'profile-1',
    user_id: 'user-default',
    name: 'Principal',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_kids: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'profile-2',
    user_id: 'user-default',
    name: 'Kids & Família',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    is_kids: true,
    created_at: new Date().toISOString(),
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('doramasplay_session');
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
  });

  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(DEFAULT_PROFILES[0]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Supabase Auth listener
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const authUser: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            role: session.user.email?.includes('admin') ? 'admin' : 'subscriber',
          };
          setUser(authUser);
          localStorage.setItem('doramasplay_session', JSON.stringify(authUser));
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const authUser: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            role: session.user.email?.includes('admin') ? 'admin' : 'subscriber',
          };
          setUser(authUser);
          localStorage.setItem('doramasplay_session', JSON.stringify(authUser));
        } else {
          // If signed out from Supabase
          setUser(null);
          localStorage.removeItem('doramasplay_session');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password?: string) => {
    if (isSupabaseConfigured() && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return;
    }

    // Mock Login
    const isAdmin = email.toLowerCase().includes('admin');
    const mockUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0] || 'Dorameiro VIP',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: isAdmin ? 'admin' : 'subscriber',
      subscription: {
        id: `sub-${Date.now()}`,
        user_id: `user-${Date.now()}`,
        plan_id: 'plan-3',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
        provider: 'doramasplay-vip',
        external_subscription_id: 'sub_vip',
        created_at: new Date().toISOString(),
      }
    };
    setUser(mockUser);
    localStorage.setItem('doramasplay_session', JSON.stringify(mockUser));
  };

  const signUp = async (email: string, password?: string, name?: string) => {
    if (isSupabaseConfigured() && password) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split('@')[0] } }
      });
      if (error) throw error;
      return;
    }

    // Mock SignUp
    const mockUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: name || email.split('@')[0] || 'Novo Dorameiro',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'subscriber',
    };
    setUser(mockUser);
    localStorage.setItem('doramasplay_session', JSON.stringify(mockUser));
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('doramasplay_session');
  };

  const selectProfile = (profile: Profile) => {
    setActiveProfile(profile);
  };

  const subscribeToPlan = async (planId: string) => {
    if (!user) return;
    const updatedSub: Subscription = {
      id: `sub-${Date.now()}`,
      user_id: user.id,
      plan_id: planId,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      provider: 'stripe',
      external_subscription_id: `ext_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const updatedUser: UserProfile = {
      ...user,
      subscription: updatedSub,
    };
    setUser(updatedUser);
    localStorage.setItem('doramasplay_session', JSON.stringify(updatedUser));
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';
  const isSubscriber = Boolean(user?.subscription && user.subscription.status === 'active');

  return (
    <AuthContext.Provider
      value={{
        user,
        profiles,
        activeProfile,
        isAuthenticated,
        isAdmin,
        isSubscriber,
        loading,
        signIn,
        signUp,
        signOut,
        selectProfile,
        subscribeToPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
