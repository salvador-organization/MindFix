// src/lib/local-auth.ts
// Autenticação 100% baseada no Supabase Auth
// REMOVIDO: qualquer lógica de usuários locais ou duplicação

import { supabase } from '@/lib/supabase';

// Legacy: manter apenas para compatibilidade durante transição
// TODO: remover após migrar todos os componentes para useUser()

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updated_at?: string;
}

// LEGACY: manter apenas para transição
const STORAGE_KEYS = {
  CURRENT_USER: "mindfix_current_user",
  SESSION: "mindfix_session",
};

// LEGACY: será removido
export const getLocalCurrentUser = (): LocalUser | null => {
  console.warn('DEPRECATED: getLocalCurrentUser será removido. Use useUser() hook.');
  try {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session !== "active") return null;
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error("Erro ao obter usuário local:", error);
    return null;
  }
};

// LEGACY: será removido - use supabase.auth.signOut()
export const localSignOut = async () => {
  console.warn('DEPRECATED: localSignOut será removido. Use useUser().signOut().');
  try {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return { error: null };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return { error };
  }
};

// DEPRECATED: substituído por supabase.auth.signUp()
export const localSignUp = async (email: string, password: string, name: string) => {
  console.warn('DEPRECATED: localSignUp será removido. Use supabase.auth.signUp() diretamente.');

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name,
          created_at: new Date().toISOString()
        }
      }
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return {
      data: null,
      error: { message: "Erro ao criar conta. Tente novamente." },
    };
  }
};

// DEPRECATED: substituído por supabase.auth.signInWithPassword()
export const localSignIn = async (email: string, password: string) => {
  console.warn('DEPRECATED: localSignIn será removido. Use supabase.auth.signInWithPassword() diretamente.');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return {
      data: null,
      error: { message: "Erro ao fazer login. Tente novamente." },
    };
  }
};

// LEGACY: será removido - use useUser().isAuthenticated
export const isLoggedIn = (): boolean => {
  console.warn('DEPRECATED: isLoggedIn será removido. Use useUser().isAuthenticated.');
  if (typeof window === "undefined") return false;
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return session === "active" && !!user;
};

// NOVO: função para migrar dados locais para Supabase
export const migrateLocalDataToSupabase = async () => {
  console.log('🔄 Iniciando migração de dados locais para Supabase...');

  try {
    // Verificar se há dados locais para migrar
    const localUser = getLocalCurrentUser();
    if (!localUser) {
      console.log('✅ Nenhum dado local para migrar');
      return;
    }

    // Buscar sessão atual do Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log('⚠️ Usuário não autenticado no Supabase, pulando migração');
      return;
    }

    // Migrar pontos e progresso
    const totalPoints = parseInt(localStorage.getItem('totalPoints') || '0');
    const focusTime = parseInt(localStorage.getItem('focusTime') || '0');

    if (totalPoints > 0 || focusTime > 0) {
      await supabase.from('user_progress').upsert({
        user_id: session.user.id,
        total_points: totalPoints,
        total_focus_time: focusTime,
        updated_at: new Date().toISOString()
      });
    }

    // Migrar sessões de foco
    const focusSessions = localStorage.getItem('focus-sessions');
    if (focusSessions) {
      const sessions = JSON.parse(focusSessions);
      for (const sessionData of sessions) {
        await supabase.from('focus_sessions').insert({
          user_id: session.user.id,
          type: sessionData.type || 'pomodoro',
          duration: sessionData.duration || 0,
          completed: sessionData.completed || false,
          started_at: sessionData.startTime || new Date().toISOString(),
          completed_at: sessionData.completed ? new Date().toISOString() : null,
          created_at: new Date().toISOString()
        });
      }
    }

    console.log('✅ Migração concluída com sucesso');

    // Limpar dados locais após migração
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem('totalPoints');
    localStorage.removeItem('focusTime');
    localStorage.removeItem('focus-sessions');

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
  }
};