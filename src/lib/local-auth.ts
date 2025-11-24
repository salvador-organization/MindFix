// src/lib/local-auth.ts
// Autenticação local + sincronização com Supabase (sem duplicação)

import { saveUser } from "@/utils/saveUser";

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updated_at?: string;
}

const STORAGE_KEYS = {
  CURRENT_USER: "mindfix_current_user",
  SESSION: "mindfix_session",
};

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

    return JSON.parse(userData);
  } catch (error) {
    console.error("Erro ao obter usuário local:", error);
    return null;
  }
};

// Salva usuário local
const setLocalUser = (user: LocalUser) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.SESSION, "active");
};

// Logout local
export const localSignOut = async () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return { error: null };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
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
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return {
      data: null,
      error: { message: "Erro ao criar conta. Tente novamente." },
    };
  }
};

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
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return {
      data: null,
      error: { message: "Erro ao fazer login. Tente novamente." },
    };
  }
};

export const isLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return session === "active" && !!user;
};
