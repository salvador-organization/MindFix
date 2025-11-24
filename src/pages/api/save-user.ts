import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

<<<<<<< HEAD
/**
 * LEGACY API: será removida após migração completa para Supabase Auth
 * Mantida apenas para compatibilidade durante transição
 *
 * @deprecated Use operações diretas do Supabase ao invés desta API
 */
=======
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

<<<<<<< HEAD
  console.warn('DEPRECATED: /api/save-user será removido. Use operações diretas do Supabase.');

=======
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
  let { email, updates } = req.body;

  if (!email) {
    return res.status(400).json({ error: "email requerido" });
  }

  // Normalizar email
  email = String(email).trim().toLowerCase();

  // Garantir que updates sempre seja um objeto
  if (!updates || typeof updates !== "object") {
    updates = {};
  }

  try {
    // Primeiro: buscar o estado atual do usuário
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Erro ao buscar user:", fetchError);
      return res.status(500).json({ error: fetchError });
    }

    // MERGE Inteligente 🧠
    const mergedData = existingUser
      ? {
          ...existingUser,
          ...clean(updates),
          email,
          updated_at: new Date().toISOString()
        }
      : {
          email,
          ...clean(updates),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

    // Se nada mudou, evitar update desnecessário
    if (existingUser && !hasDifferences(existingUser, mergedData)) {
      return res.status(200).json({ user: existingUser });
    }

    // UPSERT real no banco
    const { data, error } = await supabase
      .from("users")
      .upsert(mergedData, { onConflict: "email" })
      .select()
      .single();

    if (error) {
      console.error("Erro no UPSERT:", error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ user: data });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

/**
 * Remove campos nulos, undefined ou strings vazias
 */
function clean(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value === null || value === undefined || value === "") continue;
    result[key] = value;
  }
  return result;
}

/**
 * Verifica se existem diferenças reais entre dois objetos
 */
function hasDifferences(a: any, b: any) {
  const jsA = JSON.stringify(a);
  const jsB = JSON.stringify(b);
  return jsA !== jsB;
}
