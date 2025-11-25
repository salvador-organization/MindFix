import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface FocusSession {
  id: string;
  user_id: string;
  type: 'pomodoro' | 'hyperfocus' | 'deepflow' | 'meditation' | 'breathing';
  duration: number;
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
  total_focus_time: number;
  updated_at: string;
}

export function useSession(userId: string | null) {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      // SESSÕES
      const { data: sessionsData } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(50);

      setSessions(sessionsData || []);

      // PROGRESSO
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      setProgress(progressData || null);

    } catch (err) {
      console.error('Erro ao carregar dados de sessão:', err);
    }

    setLoading(false);
  };

  const getTodayStats = () => {
    if (!sessions.length) return { totalMinutes: 0, pointsEarned: 0 };

    const today = new Date().toISOString().split('T')[0];

    const todaySessions = sessions.filter(
      (s) => s.completed && s.started_at.startsWith(today)
    );

    return {
      totalMinutes: todaySessions.reduce((acc, s) => acc + s.duration, 0),
      pointsEarned: todaySessions.reduce((acc, s) => acc + (s.points_earned || 0), 0),
    };
  };

  const getWeeklyStats = () => {
    if (!sessions.length) return { totalMinutes: 0, totalSessions: 0, totalPoints: 0 };

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekSessions = sessions.filter(
      (s) => new Date(s.started_at) >= weekAgo && s.completed
    );

    return {
      totalMinutes: weekSessions.reduce((acc, s) => acc + s.duration, 0),
      totalSessions: weekSessions.length,
      totalPoints: weekSessions.reduce((acc, s) => acc + (s.points_earned || 0), 0),
    };
  };

  return {
    sessions,
    progress,
    loading,
    getTodayStats,
    getWeeklyStats,
    currentStreak: progress?.current_streak || 0,
    totalPoints: progress?.total_points || 0,
    totalFocusTime: progress?.total_focus_time || 0,
  };
}
