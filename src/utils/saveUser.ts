// src/utils/saveUser.ts
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

  try {
    if (!email) {
      console.error("saveUser: email vazio");
      return null;
    }

    // Normalizar email globalmente
    email = String(email).trim().toLowerCase();

    // Remover valores inválidos
    updates = clean(updates);

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
