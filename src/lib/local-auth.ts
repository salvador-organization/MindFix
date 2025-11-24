// src/lib/local-auth.ts
// Autenticação local + sincronização com Supabase

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

/**
 * Normaliza emails globalmente
 */
const normalizeEmail = (email: string) =>
  String(email || "").trim().toLowerCase();

/**
 * Carrega usuário atual do localStorage
 */
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

/**
 * Salva o usuário no localStorage + cria sessão
 */
const setLocalUser = (user: LocalUser) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.SESSION, "active");
};

/**
 * Remove sessão local
 */
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
 * Criar conta local + sincronizar com Supabase
 */
export const localSignUp = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    email = normalizeEmail(email);

    // Criar usuário local
    const newUser: LocalUser = {
      id: `local_${Date.now()}`, // substituído depois pelo ID real do Supabase
      email,
      name,
      createdAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Salvar no localStorage
    setLocalUser(newUser);

    // 🔥 Enviar para Supabase (isso define o ID REAL)
    const synced = await saveUser(email, {
      name,
      createdAt: newUser.createdAt,
      updated_at: newUser.updated_at,
    });

    if (synced) setLocalUser(synced); // substituir ID local pelo ID oficial

    return { data: { user: synced || newUser }, error: null };
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return {
      data: null,
      error: { message: "Erro ao criar conta. Tente novamente." },
    };
  }
};

/**
 * Login local (sincroniza com servidor)
 */
export const localSignIn = async (email: string, password: string) => {
  try {
    email = normalizeEmail(email);

    // Apenas valida — dados reais vêm do Supabase
    const now = new Date().toISOString();

    // Criar objeto temporário local
    const tempUser = {
      id: `local_${Date.now()}`,
      email,
      name: "Usuário",
      createdAt: now,
      updated_at: now,
    };

    // Salvar no localStorage
    setLocalUser(tempUser);

    // 🔥 Sincronizar com Supabase (caso já exista lá)
    const serverUser = await saveUser(email, { updated_at: now });

    if (serverUser) {
      setLocalUser(serverUser);
      return { data: { user: serverUser }, error: null };
    }

    return { data: { user: tempUser }, error: null };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return {
      data: null,
      error: { message: "Erro ao fazer login. Tente novamente." },
    };
  }
};

/**
 * Verifica se há sessão local válida
 */
export const isLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return session === "active" && !!user;
};
