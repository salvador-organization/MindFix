import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🟢 chave que pode fazer UPSERT real
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { email, updates } = req.body;

  if (!email) return res.status(400).json({ error: "Email requerido" });

  try {
    // 🟢 UPSERT REAL (merge automático)
    const { data, error } = await supabase
      .from("users")
      .upsert({ email, ...updates }, { onConflict: "email" })
      .select()
      .single();

    if (error) {
      console.error("Erro supabase save-user:", error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ user: data });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return res.status(500).json({ error: err });
  }
}
