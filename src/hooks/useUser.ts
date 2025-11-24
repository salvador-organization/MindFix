import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface MindFixUser {
  id: string;
  email: string;
  name?: string;
  is_lifetime?: boolean;
  subscription_status?: string;
  payment_verified?: boolean;
  access_expires_at?: string;
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useUser() {
  const [user, setUser] = useState<MindFixUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    // Buscar usuário autenticado do Supabase Auth
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Erro ao buscar sessão inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<MindFixUser>) => {
    if (!authUser) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return null;
      }

      setUser(data);
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAuthUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    user,
    authUser,
    loading,
    updateUserProfile,
    signOut,
    isAuthenticated: !!authUser,
    isLifetime: user?.is_lifetime === true,
    hasActiveSubscription:
      user?.subscription_status === 'active' && user?.payment_verified === true,
    hasExpiredAccess:
      user?.access_expires_at && new Date(user.access_expires_at) < new Date()
  };
}
