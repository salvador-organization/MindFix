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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: sessionsData } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      setSessions(sessionsData || []);

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProgress(progressData ?? null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return {
    sessions,
    progress,
    loading,
    getTodayStats,
    getWeeklyStats,
    currentStreak: progress?.current_streak ?? 0,
    totalPoints: progress?.total_points ?? 0,
  };
}
