import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export interface FocusSession {
  id: string;
  user_id: string;
  type: 'pomodoro' | 'hyperfocus' | 'deepflow' | 'meditation' | 'breathing';
  duration: number; // minutos
  completed: boolean;
  started_at: string;
  completed_at?: string;
  points_earned?: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_sessions: number;
  total_focus_time: number; // minutos
  updated_at: string;
}

export function useSession(userId?: string) {
  // ⚠️ IMPORTANTE: Sempre inicializar com valores padrão consistentes
  // Isso garante que o hook NUNCA muda sua estrutura interna
  // independente de userId existir ou não
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      // ⚠️ CORREÇÃO CRÍTICA: Quando userId não existe ainda,
      // definir estado CONSISTENTE e só executar busca quando existir
      if (!userId) {
        setSessions([]);
        setProgress(null);
        setLoading(true); // Sempre true quando não há userId
        return;
      }

      if (cancelled) return;

      setLoading(true);
      try {
        const { data: sessionsData } = await supabase
          .from('focus_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(50);

        if (cancelled) return;
        setSessions(sessionsData || []);

        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (cancelled) return;
        setProgress(progressData ?? null);
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar dados:', error);
          // Em caso de erro, manter estado consistente
          setSessions([]);
          setProgress(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [userId]);


  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];

    const todaySessions = sessions.filter(
      (session) =>
        session.started_at.startsWith(today) && session.completed
    );

    return {
      sessionsCount: todaySessions.length,
      totalMinutes: todaySessions.reduce(
        (sum, session) => sum + session.duration,
        0
      ),
      pointsEarned: todaySessions.reduce(
        (sum, session) => sum + (session.points_earned || 0),
        0
      ),
    };
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekSessions = sessions.filter(
      (session) =>
        new Date(session.started_at) >= weekAgo && session.completed
    );

    return {
      totalMinutes: weekSessions.reduce(
        (sum, s) => sum + s.duration,
        0
      ),
      totalSessions: weekSessions.length,
    };
  };

  async function saveFocusSession(sessionData: {
    type: string;
    duration: number;
    completed: boolean;
    started_at: string;
    completed_at?: string;
  }) {
    const { error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: userId,
        ...sessionData
      });

    if (error) console.error("Erro ao salvar sessão de foco:", error);
  }

  const memoizedStats = useMemo(() => ({
    sessions,
    progress,
    loading,
    getTodayStats,
    getWeeklyStats,
    currentStreak: progress?.current_streak ?? 0,
    totalPoints: progress?.total_points ?? 0,
    saveFocusSession,
  }), [sessions, progress, loading]);

  return memoizedStats;
}
