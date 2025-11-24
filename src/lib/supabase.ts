// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Verifica se as credenciais do Supabase estão configuradas
const isSupabaseConfigured =
  supabaseUrl !== "" && supabaseAnonKey !== "";

// Cliente básico (usado apenas para leitura leve)
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

// NOTA: Toda escrita ocorre via /api/save-user usando Service Role!
// Nunca escrevemos diretamente no cliente do frontend.
