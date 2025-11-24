// src/lib/local-auth.ts
<<<<<<< HEAD
// Autenticação 100% baseada no Supabase Auth
// REMOVIDO: qualquer lógica de usuários locais ou duplicação

import { supabase } from '@/lib/supabase';

// Legacy: manter apenas para compatibilidade durante transição
// TODO: remover após migrar todos os componentes para useUser()
=======
// Autenticação local + sincronização com Supabase (sem duplicação)

import { saveUser } from "@/utils/saveUser";
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updated_at?: string;
}

<<<<<<< HEAD
// LEGACY: manter apenas para transição
=======
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
const STORAGE_KEYS = {
  CURRENT_USER: "mindfix_current_user",
  SESSION: "mindfix_session",
};

<<<<<<< HEAD
// LEGACY: será removido
export const getLocalCurrentUser = (): LocalUser | null => {
  console.warn('DEPRECATED: getLocalCurrentUser será removido. Use useUser() hook.');
  try {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session !== "active") return null;
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userData) return null;
=======
// Normaliza email globalmente
const normalizeEmail = (email: string) =>
  String(email || "").trim().toLowerCase();

// Carrega usuário do localStorage
export const getLocalCurrentUser = (): LocalUser | null => {
  try {
    if (typeof window === "undefined") return null;

    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session !== "active") return null;

    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userData) return null;

>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
    return JSON.parse(userData);
  } catch (error) {
    console.error("Erro ao obter usuário local:", error);
    return null;
  }
};

<<<<<<< HEAD
// LEGACY: será removido - use supabase.auth.signOut()
export const localSignOut = async () => {
  console.warn('DEPRECATED: localSignOut será removido. Use useUser().signOut().');
  try {
    await supabase.auth.signOut();
=======
// Salva usuário local
const setLocalUser = (user: LocalUser) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.SESSION, "active");
};

// Logout local
export const localSignOut = async () => {
  try {
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return { error: null };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
<<<<<<< HEAD
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
=======
    return { error: null };
  }
};

/**  
 * CRIAR CONTA (sem duplicar):
 * 1. Normaliza email  
 * 2. Salva local  
 * 3. Chama saveUser()  
 * 4. Se Supabase retornar registro existente, usa ele  
 */
export const localSignUp = async (email: string, password: string, name: string) => {
  try {
    email = normalizeEmail(email);

    const now = new Date().toISOString();

    const newUser: LocalUser = {
      id: `local_${Date.now()}`,
      email,
      name,
      createdAt: now,
      updated_at: now,
    };

    setLocalUser(newUser);

    const synced = await saveUser(email, {
      name,
      createdAt: now,
      updated_at: now,
    });

    if (synced) {
      setLocalUser(synced);
      return { data: { user: synced }, error: null };
    }

    return { data: { user: newUser }, error: null };
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return {
      data: null,
      error: { message: "Erro ao criar conta. Tente novamente." },
    };
  }
};

<<<<<<< HEAD
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
=======
/**
 * LOGIN LOCAL (versão CORRETA):
 * Não cria conta nova → apenas sincroniza com Supabase
 */
export const localSignIn = async (email: string, password: string) => {
  try {
    email = normalizeEmail(email);

    const now = new Date().toISOString();

    // Tenta buscar usuário existente direto no Supabase via saveUser()
    const serverUser = await saveUser(email, { updated_at: now });

    if (serverUser) {
      setLocalUser(serverUser);
      return { data: { user: serverUser }, error: null };
    }

    // Caso nunca tenha existido (raríssimo, mas protegido)
    const tempUser = {
      id: `local_${Date.now()}`,
      email,
      name: "Usuário",
      createdAt: now,
      updated_at: now,
    };

    setLocalUser(tempUser);

    return { data: { user: tempUser }, error: null };
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return {
      data: null,
      error: { message: "Erro ao fazer login. Tente novamente." },
    };
  }
};

<<<<<<< HEAD
// LEGACY: será removido - use useUser().isAuthenticated
export const isLoggedIn = (): boolean => {
  console.warn('DEPRECATED: isLoggedIn será removido. Use useUser().isAuthenticated.');
=======
export const isLoggedIn = (): boolean => {
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
  if (typeof window === "undefined") return false;
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return session === "active" && !!user;
};
<<<<<<< HEAD

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
      for (const session of sessions) {
        await supabase.from('focus_sessions').insert({
          user_id: session.user.id,
          type: session.type || 'pomodoro',
          duration: session.duration || 0,
          completed: session.completed || false,
          started_at: session.startTime || new Date().toISOString(),
          completed_at: session.completed ? new Date().toISOString() : null,
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
=======
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
