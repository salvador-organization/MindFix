/**
 * Sistema Centralizado de Pontuação MindFix
 * Gerencia pontos para todas as técnicas de foco do aplicativo
 */

export type TechniqueType = 
  | 'pomodoro-standard'
  | 'pomodoro-custom'
  | 'meditation'
  | 'hyperfocus'
  | 'breathing'
  | 'deepflow';

export interface PointsConfig {
  [key: string]: number;
}

export interface PointsEntry {
  id: string;
  technique: TechniqueType;
  points: number;
  timestamp: Date;
  techniqueName: string;
  duration?: number; // duração em minutos
}

export interface UserPoints {
  totalPoints: number;
  history: PointsEntry[];
}

export interface FocusSession {
  id: string;
  technique: TechniqueType;
  duration: number; // em minutos
  timestamp: Date;
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  lastActivityDate: string; // formato YYYY-MM-DD
  longestStreak: number;
}

// Configuração de pontos por técnica
export const POINTS_CONFIG: PointsConfig = {
  'pomodoro-standard': 20,
  'pomodoro-custom': 25,
  'meditation': 15,
  'hyperfocus': 30,
  'breathing': 10,
  'deepflow': 25
};

// Duração padrão de cada técnica em minutos
export const TECHNIQUE_DURATIONS: Record<TechniqueType, number> = {
  'pomodoro-standard': 25,
  'pomodoro-custom': 25, // pode variar
  'meditation': 5,
  'hyperfocus': 50,
  'breathing': 3,
  'deepflow': 40
};

// Nomes amigáveis das técnicas
export const TECHNIQUE_NAMES: Record<TechniqueType, string> = {
  'pomodoro-standard': 'Pomodoro Padrão',
  'pomodoro-custom': 'Pomodoro Personalizado',
  'meditation': 'Meditação',
  'hyperfocus': 'HiperFocus Mode',
  'breathing': 'Respiração 4-7-8',
  'deepflow': 'DeepFlow Session'
};

const STORAGE_KEY = 'mindfix_user_points';
const SESSIONS_KEY = 'mindfix_focus_sessions';
const STREAK_KEY = 'mindfix_user_streak';

/**
 * Carrega os pontos do usuário do localStorage
 */
export function loadUserPoints(): UserPoints {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Converter timestamps de string para Date
      parsed.history = parsed.history.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      return parsed;
    }
  } catch (error) {
    console.error('Erro ao carregar pontos:', error);
  }
  
  return {
    totalPoints: 0,
    history: []
  };
}

/**
 * Salva os pontos do usuário no localStorage
 */
function saveUserPoints(points: UserPoints): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  } catch (error) {
    console.error('Erro ao salvar pontos:', error);
  }
}

/**
 * Carrega as sessões de foco do localStorage
 */
export function loadFocusSessions(): FocusSession[] {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp)
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar sessões:', error);
  }
  return [];
}

/**
 * Salva as sessões de foco no localStorage
 */
function saveFocusSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Erro ao salvar sessões:', error);
  }
}

/**
 * Carrega dados de sequência do localStorage
 */
export function loadStreakData(): StreakData {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar streak:', error);
  }
  
  return {
    currentStreak: 0,
    lastActivityDate: '',
    longestStreak: 0
  };
}

/**
 * Salva dados de sequência no localStorage
 */
function saveStreakData(streak: StreakData): void {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch (error) {
    console.error('Erro ao salvar streak:', error);
  }
}

/**
 * Atualiza a sequência do usuário
 */
function updateStreak(): void {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const streakData = loadStreakData();
  
  // Se já registrou atividade hoje, não faz nada
  if (streakData.lastActivityDate === today) {
    return;
  }
  
  // Verificar se a última atividade foi ontem
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (streakData.lastActivityDate === yesterdayStr) {
    // Continua a sequência
    streakData.currentStreak += 1;
  } else if (streakData.lastActivityDate === '') {
    // Primeira atividade
    streakData.currentStreak = 1;
  } else {
    // Quebrou a sequência, reinicia
    streakData.currentStreak = 1;
  }
  
  // Atualizar maior sequência
  if (streakData.currentStreak > streakData.longestStreak) {
    streakData.longestStreak = streakData.currentStreak;
  }
  
  streakData.lastActivityDate = today;
  saveStreakData(streakData);
}

/**
 * Adiciona pontos ao usuário quando uma técnica é concluída
 */
export function addPoints(technique: TechniqueType, customDuration?: number): number {
  const pointsToAdd = POINTS_CONFIG[technique];
  
  if (!pointsToAdd) {
    console.error(`Técnica desconhecida: ${technique}`);
    return 0;
  }

  const duration = customDuration || TECHNIQUE_DURATIONS[technique];
  const currentPoints = loadUserPoints();
  
  const newEntry: PointsEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    technique,
    points: pointsToAdd,
    timestamp: new Date(),
    techniqueName: TECHNIQUE_NAMES[technique],
    duration
  };

  const updatedPoints: UserPoints = {
    totalPoints: currentPoints.totalPoints + pointsToAdd,
    history: [newEntry, ...currentPoints.history]
  };

  saveUserPoints(updatedPoints);
  
  // Registrar sessão de foco
  recordFocusSession(technique, duration);
  
  // Atualizar sequência
  updateStreak();
  
  // Atualizar também as stats do dashboard
  updateDashboardStats();
  
  // Disparar evento para atualizar UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('pointsUpdated'));
    window.dispatchEvent(new Event('focusUpdated'));
  }
  
  return pointsToAdd;
}

/**
 * Registra uma sessão de foco completa
 */
function recordFocusSession(technique: TechniqueType, duration: number): void {
  const sessions = loadFocusSessions();
  
  const newSession: FocusSession = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    technique,
    duration,
    timestamp: new Date(),
    completed: true
  };
  
  sessions.unshift(newSession);
  saveFocusSessions(sessions);
}

/**
 * Calcula o tempo total de foco do dia atual
 */
export function getTodayFocusTime(): { hours: number; minutes: number; totalMinutes: number } {
  const sessions = loadFocusSessions();
  const today = new Date().toISOString().split('T')[0];
  
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.timestamp).toISOString().split('T')[0];
    return sessionDate === today && session.completed;
  });
  
  const totalMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return { hours, minutes, totalMinutes };
}

/**
 * Formata o tempo de foco para exibição
 */
export function formatFocusTime(): string {
  const { hours, minutes } = getTodayFocusTime();
  
  if (hours === 0 && minutes === 0) {
    return '0m';
  }
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Obtém a sequência atual do usuário
 */
export function getCurrentStreak(): number {
  const streakData = loadStreakData();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Se a última atividade foi hoje ou ontem, retorna a sequência atual
  if (streakData.lastActivityDate === today || streakData.lastActivityDate === yesterdayStr) {
    return streakData.currentStreak;
  }
  
  // Caso contrário, a sequência foi quebrada
  return 0;
}

/**
 * Atualiza as estatísticas do dashboard
 */
function updateDashboardStats(): void {
  try {
    const statsKey = 'mindfix_user_stats';
    const totalPoints = getTotalPoints();
    const focusTime = formatFocusTime();
    const streak = getCurrentStreak();
    
    const stats = {
      focusToday: focusTime,
      streak: streak,
      points: totalPoints,
      level: Math.floor(totalPoints / 100) + 1
    };
    
    localStorage.setItem(statsKey, JSON.stringify(stats));
  } catch (error) {
    console.error('Erro ao atualizar stats do dashboard:', error);
  }
}

/**
 * Obtém o histórico de pontos do usuário
 */
export function getPointsHistory(limit?: number): PointsEntry[] {
  const points = loadUserPoints();
  return limit ? points.history.slice(0, limit) : points.history;
}

/**
 * Obtém pontos totais do usuário
 */
export function getTotalPoints(): number {
  return loadUserPoints().totalPoints;
}

/**
 * Obtém pontos ganhos por técnica específica
 */
export function getPointsByTechnique(technique: TechniqueType): number {
  const points = loadUserPoints();
  return points.history
    .filter(entry => entry.technique === technique)
    .reduce((sum, entry) => sum + entry.points, 0);
}

/**
 * Obtém estatísticas de pontos por técnica
 */
export function getPointsStatsByTechnique(): Record<TechniqueType, { count: number; totalPoints: number }> {
  const points = loadUserPoints();
  const stats: any = {};
  
  Object.keys(POINTS_CONFIG).forEach(technique => {
    const entries = points.history.filter(entry => entry.technique === technique);
    stats[technique] = {
      count: entries.length,
      totalPoints: entries.reduce((sum, entry) => sum + entry.points, 0)
    };
  });
  
  return stats;
}

/**
 * Limpa todo o histórico de pontos (usar com cuidado!)
 */
export function clearPointsHistory(): void {
  const emptyPoints: UserPoints = {
    totalPoints: 0,
    history: []
  };
  saveUserPoints(emptyPoints);
}

/**
 * Obtém estatísticas semanais de foco
 */
export function getWeeklyFocusStats(): { day: string; minutes: number }[] {
  const sessions = loadFocusSessions();
  const today = new Date();
  const weekData: { day: string; minutes: number }[] = [];
  
  // Últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.timestamp).toISOString().split('T')[0];
      return sessionDate === dateStr && session.completed;
    });
    
    const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
    
    weekData.push({
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      minutes: totalMinutes
    });
  }
  
  return weekData;
}
