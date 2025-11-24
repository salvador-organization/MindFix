// src/utils/saveUser.ts
<<<<<<< HEAD
// DEPRECATED: Esta função será removida após migração completa para Supabase Auth
// Use os hooks useUser() e useSession() para operações de usuário

import { supabase } from '@/lib/supabase';

/**
 * LEGACY: saveUser - será removido após migração completa
 * Mantido apenas para compatibilidade durante transição
 *
 * @deprecated Use useUser().updateUserProfile() ao invés desta função
 */
export async function saveUser(
  email: string,
  updates: Record<string, any>,
  options: { force?: boolean } = {}
) {
  console.warn('DEPRECATED: saveUser será removido. Use useUser().updateUserProfile() diretamente.');

=======

/**
 * saveUser (frontend)
 *
 * - Normaliza email
 * - Faz limpeza dos updates (remove null/undefined/"")
 * - Sincroniza com `/api/save-user`
 * - Resolve conflitos usando updated_at
 * - Mantém localStorage SEMPRE alinhado ao backend
 */

export async function saveUser(
  email: string,
  updates: Record<string, any>,
  options: { force?: boolean } = {} // force = sobrescrever sempre
) {
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
  try {
    if (!email) {
      console.error("saveUser: email vazio");
      return null;
    }

    // Normalizar email globalmente
    email = String(email).trim().toLowerCase();

    // Remover valores inválidos
    updates = clean(updates);

<<<<<<< HEAD
    // Buscar usuário atual no Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      console.error("saveUser: usuário não autenticado");
      return null;
    }

    // Atualizar perfil usando Supabase diretamente
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
      console.error("❌ Erro ao atualizar usuário:", error);
      return null;
    }

    return data;
=======
    // ---------- 1. Pegar dados atuais do localStorage ----------
    let localUser: any = null;

    try {
      const stored = localStorage.getItem("user");
      if (stored) localUser = JSON.parse(stored);
    } catch (_) {}

    // ---------- 2. Resolver conflitos usando updated_at ----------
    if (localUser && !options.force) {
      const localUpdatedAt = new Date(localUser.updated_at || 0).getTime();
      const updateTimestamp = new Date(updates.updated_at || 0).getTime();

      // Se os dados locais forem MAIS RECENTES → ignorar updates antigos
      if (localUpdatedAt > updateTimestamp) {
        // Manda o estado local inteiro ao servidor
        updates = { ...localUser, updated_at: new Date().toISOString() };
      }
    }

    // ---------- 3. Enviar ao backend ----------
    const res = await fetch("/api/save-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, updates }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Erro no saveUser API route:", data);
      return null;
    }

    const user = data.user;

    // ---------- 4. Atualizar localStorage ----------
    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userEmail", user.email);
    } catch (e) {
      console.warn("⚠️ localStorage não disponível:", e);
    }

    return user;
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
  } catch (err) {
    console.error("❌ saveUser unexpected error:", err);
    return null;
  }
}

/**
 * Limpa null/undefined/"" dos updates
 */
function clean(obj: Record<string, any>) {
  const r: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === null || v === undefined || v === "") continue;
    r[k] = v;
  }
  return r;
}
<<<<<<< HEAD

// NOVO: função auxiliar para criar/atualizar perfil do usuário
export async function createOrUpdateUserProfile(userId: string, profileData: Record<string, any>) {
  try {
    const cleanData = clean(profileData);

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...cleanData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar/atualizar perfil:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro inesperado ao salvar perfil:', error);
    return null;
  }
}
=======
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
