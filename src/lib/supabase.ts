// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Verifica se credenciais existem
const isSupabaseConfigured =
  supabaseUrl !== "" && supabaseAnonKey !== "";

// Cliente para LEITURA apenas
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

// Helper
export const isConfigured = () => isSupabaseConfigured;

// TODA escrita ocorre via /api/save-user usando Service Role
