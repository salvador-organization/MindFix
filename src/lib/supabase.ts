// src/lib/supabase.ts

import { createBrowserClient } from "@supabase/ssr";

// 🔥 Agora SEMPRE cria o cliente — mesmo no client-side.
// ANTES: você retornava null se a env falhasse → quebrava useUser()
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,        // Persistir sessão no navegador
      autoRefreshToken: true,      // Renova tokens automaticamente
      detectSessionInUrl: true,    // Necessário para OAuth e login
    },
  }
);

// ⚠️ remover o retorno null — isso causava BUGS DIRETOS:
// hooks chamavam supabase.auth.getSession() com supabase = null → erro silencioso

// ❌ Removido:
// const isSupabaseConfigured = supabaseUrl !== "" && supabaseAnonKey !== "";
// export const supabase = isSupabaseConfigured ? createClient(...) : null;

// Agora o supabase NUNCA é null.


// ---------------------------------------------------------
// 🔥 CLIENTE ADMIN (server-side)
import { createClient } from "@supabase/supabase-js";

export const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY não configurada no ambiente do servidor");
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

