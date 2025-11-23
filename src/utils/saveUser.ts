// src/utils/saveUser.ts

/**
 * saveUser - FRONTEND
 * Dispara a sincronização para o backend /api/save-user
 * e mantém o localStorage atualizado automaticamente.
 */
export async function saveUser(email: string, updates: Record<string, any>) {
  try {
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

    // Atualiza localStorage automaticamente
    try {
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userEmail", data.user.email);
      }
    } catch (e) {
      console.warn("⚠️ localStorage não disponível:", e);
    }

    return data.user;
  } catch (err) {
    console.error("❌ saveUser unexpected error:", err);
    return null;
  }
}
