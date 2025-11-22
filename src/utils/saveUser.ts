import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnon);

/**
 * saveUser - centraliza atualização do usuário no Supabase e no localStorage
 * @param email string
 * @param updates object - os campos a atualizar no Supabase (partial)
 * @returns the updated user record (or null)
 */
export async function saveUser(email: string, updates: Record<string, any>) {
  try {
    // Upsert: cria ou atualiza por email (onConflict em email)
    const { data, error } = await supabase
      .from("users")
      .upsert({ email, ...updates }, { onConflict: ["email"] })
      .select()
      .single();

    if (error) {
      console.error("saveUser supabase error:", error);
      return null;
    }

    // Salva no localStorage (sincroniza)
    try {
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userEmail", email);
    } catch (e) {
      // localStorage pode não existir no server-side; ignore erros
      console.warn("localStorage não disponível:", e);
    }

    return data;
  } catch (err) {
    console.error("saveUser unexpected error:", err);
    return null;
  }
}
