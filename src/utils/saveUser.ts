// src/utils/saveUser.ts

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
  try {
    if (!email) {
      console.error("saveUser: email vazio");
      return null;
    }

    // Normalizar email globalmente
    email = String(email).trim().toLowerCase();

    // Remover valores inválidos
    updates = clean(updates);

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
