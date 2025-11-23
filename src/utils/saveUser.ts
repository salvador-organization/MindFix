/**
 * saveUser - Frontend helper
 * Envia para a API segura do backend realizar o merge/upsert no Supabase
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
      console.error("Erro no saveUser API route:", data);
      return null;
    }

    // 🟢 Atualiza localStorage automaticamente
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userEmail", data.user.email);
    }

    return data.user;
  } catch (err) {
    console.error("saveUser unexpected error:", err);
    return null;
  }
}
