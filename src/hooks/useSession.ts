import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

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

export function useSession() {
  const { user } = useUser();

  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      // Buscar sessões
      const { data: sessionsData } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      setSessions(sessionsData || []);

      // Buscar progresso
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProgress(progressData || null);

    } catch (error) {
      console.error('Erro ao carregar progress/sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular pontos
  const calculatePoints = (type: string, duration: number) => {
    const base = {
      pomodoro: 20,
      hyperfocus: 30,
      deepflow: 25,
      meditation: 15,
      breathing: 10
    } as Record<string, number>;

    return base[type] || 10;
  };

  // Estatísticas do dia
  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];

    const todaySessions = sessions.filter(
      s => s.started_at.startsWith(today) && s.completed
    );

    return {
      sessionsCount: todaySessions.length,
      totalMinutes: todaySessions.reduce((t, s) => t + s.duration, 0),
      pointsEarned: todaySessions.reduce((t, s) => t + (s.points_earned || 0), 0)
    };
  };

  // Estatísticas da semana
  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekSessions = sessions.filter(
      s => new Date(s.started_at) >= weekAgo && s.completed
    );

    const totalMinutes = weekSessions.reduce((t, s) => t + s.duration, 0);
    const totalSessions = weekSessions.length;

    return {
      totalMinutes,
      totalSessions,
      dailyAverage: Math.round(totalMinutes / 7)
    };
  };

  return {
    sessions,
    progress,
    loading,

    // Chamados pelo dashboard:
    getTodayStats,
    getWeeklyStats,

    // Dados brutos usados no dashboard:
    totalPoints: progress?.total_points ?? 0,
    currentStreak: progress?.current_streak ?? 0,
    totalFocusTime: progress?.total_focus_time ?? 0
  };
}
