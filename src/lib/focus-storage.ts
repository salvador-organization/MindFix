// src/lib/focus-storage.ts

export interface FocusSession {
  id: string;
  date: Date;
  duration: number; // minutos
  category?: string;
  completed: boolean;
}

const STORAGE_KEY = 'focus-sessions';

// Carregar todas as sessões já salvas
export function loadSessions(): FocusSession[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    return parsed.map((s: any) => ({
      ...s,
      date: new Date(s.date)
    }));
  } catch {
    return [];
  }
}

// Salvar uma sessão nova
export function saveSession(session: FocusSession) {
  if (typeof window === 'undefined') return;

  const sessions = loadSessions();
  sessions.push(session);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// Criar e registrar uma sessão concluída
export function registerCompletedSession(durationMinutes: number, category?: string) {
  const session: FocusSession = {
    id: crypto.randomUUID(),
    date: new Date(),
    duration: durationMinutes,
    category: category || 'Sem categoria',
    completed: true,
  };

  saveSession(session);
}

// Criar e registrar uma sessão cancelada (não concluída)
export function registerIncompleteSession(durationMinutes: number, category?: string) {
  const session: FocusSession = {
    id: crypto.randomUUID(),
    date: new Date(),
    duration: durationMinutes,
    category: category || 'Sem categoria',
    completed: false,
  };

  saveSession(session);
}
