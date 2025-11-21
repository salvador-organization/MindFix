import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verifica se as credenciais do Supabase estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '';

// Cria o cliente APENAS se as credenciais estiverem configuradas
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

// Helper para verificar se o Supabase está configurado
export const isConfigured = () => isSupabaseConfigured;

// NOTA: Todas as funções de autenticação foram movidas para local-auth.ts
// O Supabase agora é OPCIONAL e usado apenas se configurado
