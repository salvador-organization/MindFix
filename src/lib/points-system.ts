/**
 * Sistema Centralizado de Pontuação MindFix
 * Gerencia pontos para todas as técnicas de foco do aplicativo
 * INTEGRADO COM SUPABASE - Salva dados na nuvem automaticamente
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


/**
 * @deprecated - Migrado para Supabase. Usar getDashboardStatsFromSupabase() no Dashboard.
 * Mantido apenas como fallback para gamification.
 */
export function loadUserPoints(): UserPoints {
  // REMOVIDO: implementação localStorage - usar Supabase
  return {
    totalPoints: 0,
    history: []
  };
}

/**
 * Adiciona pontos ao usuário quando uma técnica é concluída
 * AGORA SALVA NO SUPABASE AUTOMATICAMENTE!
 */
export function addPoints(technique: TechniqueType, customDuration?: number): number {
  const pointsToAdd = POINTS_CONFIG[technique];

  if (!pointsToAdd) {
    console.error(`Técnica desconhecida: ${technique}`);
    return 0;
  }

  const duration = customDuration || TECHNIQUE_DURATIONS[technique];
  // REMOVIDO: loadUserPoints() - migrado para Supabase

  const newEntry: PointsEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    technique,
    points: pointsToAdd,
    timestamp: new Date(),
    techniqueName: TECHNIQUE_NAMES[technique],
    duration
  };

  // REMOVIDO: updatedPoints, saveUserPoints(), updateStreak() - migrado para Supabase

  // NOVO: Salvar no Supabase
  savePointsToSupabase(newEntry);

  // REMOVIDO: updateDashboardStats() - migrado para Supabase

  // Disparar evento para atualizar UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('pointsUpdated'));
    window.dispatchEvent(new Event('focusUpdated'));
  }

  return pointsToAdd;
}

/**
 * Salva pontos no Supabase (nova funcionalidade)
 */
async function savePointsToSupabase(entry: PointsEntry) {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Salvar sessão no Supabase
    const { error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        type: entry.technique,
        duration: entry.duration || 0,
        completed: true,
        started_at: entry.timestamp.toISOString(),
        completed_at: new Date().toISOString(),
        points_earned: entry.points
      });

    if (error) {
      console.error('Erro ao salvar pontos no Supabase:', error);
    }

    // Atualizar progresso do usuário
    await updateUserProgress(user.id, entry.points, entry.duration);

    // Disparar evento para atualizar dashboard em tempo real
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dashboardUpdated'));
    }

  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error);
  }
}

/**
 * Atualiza progresso do usuário no Supabase
 */
async function updateUserProgress(userId: string, pointsEarned: number, sessionDuration?: number) {
  try {
    const { supabase } = await import('@/lib/supabase');

    // Buscar progresso atual
    const { data: currentProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    let newStreak = currentProgress?.current_streak || 0;
    let newLongestStreak = currentProgress?.longest_streak || 0;

    // Calcular sequência
    if (currentProgress?.last_activity_date === today) {
      // Já registrou hoje
    } else if (currentProgress?.last_activity_date === getYesterdayDate()) {
      // Continua sequência
      newStreak = (currentProgress.current_streak || 0) + 1;
      if (newStreak > (currentProgress.longest_streak || 0)) {
        newLongestStreak = newStreak;
      }
    } else {
      // Nova sequência
      newStreak = 1;
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        total_points: (currentProgress?.total_points || 0) + pointsEarned,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        total_sessions: (currentProgress?.total_sessions || 0) + 1,
        total_focus_time: (currentProgress?.total_focus_time || 0) + (sessionDuration || 0),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erro ao atualizar progresso:', error);
    }

  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
  }
}

function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// REMOVIDO: saveUserPoints() - migrado para Supabase





export function getPointsHistory(limit?: number): PointsEntry[] {
  const points = loadUserPoints();
  return limit ? points.history.slice(0, limit) : points.history;
}

// REMOVIDO: funções que usam localStorage - migrado para Supabase
// getTotalPoints, getPointsByTechnique, getPointsStatsByTechnique, clearPointsHistory, getWeeklyFocusStats

/**
 * Busca estatísticas do dashboard diretamente do Supabase
 * Substitui completamente o sistema baseado em localStorage
 */
export async function getDashboardStatsFromSupabase(userId: string): Promise<{
  todayMinutes: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  minutesByTechnique?: Record<string, number>;
}> {
  try {
    const { supabase } = await import('@/lib/supabase');

    // Buscar progresso do usuário
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    // CORREÇÃO: usar horário local em vez de UTC
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const { data: todaySessions } = await supabase
      .from('focus_sessions')
      .select('duration, type')
      .eq('user_id', userId)
      .gte('started_at', startOfDay.toISOString())
      .lte('started_at', endOfDay.toISOString())
      .eq('completed', true);

    // Calcular minutos de hoje
    const todayMinutes = todaySessions?.reduce((sum: number, session: any) => sum + session.duration, 0) || 0;

    // Calcular minutos por técnica (opcional)
    const minutesByTechnique = todaySessions?.reduce((acc: Record<string, number>, session: any) => {
      acc[session.type] = (acc[session.type] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      todayMinutes,
      totalPoints: progress?.total_points || 0,
      currentStreak: progress?.current_streak || 0,
      longestStreak: progress?.longest_streak || 0,
      totalSessions: progress?.total_sessions || 0,
      minutesByTechnique
    };

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    // Retornar valores padrão em caso de erro
    return {
      todayMinutes: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      minutesByTechnique: {}
    };
  }
}

/**
 * Busca pontos totais do usuário com fallback inteligente
 */
export async function getTotalPoints(userId?: string): Promise<number> {
  try {
    const { supabase } = await import('@/lib/supabase');

    let id = userId;
    if (!id) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      id = user?.id;
    }

    if (!id) return 0;

    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('total_points')
      .eq('user_id', id)
      .single();

    if (error) {
      console.error('getTotalPoints: erro ao buscar user_progress', error);

      const { data: sessions, error: sessErr } = await supabase
        .from('focus_sessions')
        .select('points_earned')
        .eq('user_id', id)
        .is('completed', true);

      if (!sessErr && sessions) {
        const sum = sessions.reduce((s: number, r: any) => s + (r.points_earned || 0), 0);
        return sum;
      }

      return 0;
    }

    return progress?.total_points || 0;
  } catch (err) {
    console.error('getTotalPoints: fallback por erro', err);
    return 0;
  }
}