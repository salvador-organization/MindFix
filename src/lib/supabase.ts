// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Verifica se credenciais existem
const isSupabaseConfigured =
  supabaseUrl !== "" && supabaseAnonKey !== "";

// Cliente Supabase completo com autenticação
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,  // ✅ Permite persistir sessão
        autoRefreshToken: true, // ✅ Renova tokens automaticamente
        detectSessionInUrl: true, // ✅ Detecta sessão na URL
      },
    })
  : null;

// Helper
export const isConfigured = () => isSupabaseConfigured;

// Cliente admin para operações server-side (usado nas APIs)
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY não configurada');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
