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
      // Carregar sessões de foco
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (sessionsError) {
        console.error('Erro ao carregar sessões:', sessionsError);
      } else {
        setSessions(sessionsData || []);
      }

      // Carregar progresso do usuário
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Erro ao carregar progresso:', progressError);
      } else {
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFocusSession = async (sessionData: Omit<FocusSession, 'id' | 'user_id' | 'created_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          ...sessionData,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar sessão:', error);
        return null;
      }

      // Atualizar lista local
      setSessions(prev => [data, ...prev]);

      // Atualizar progresso se necessário
      if (sessionData.completed) {
        await updateProgressAfterSession(sessionData);
      }

      return data;
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      return null;
    }
  };

  const updateProgressAfterSession = async (sessionData: Omit<FocusSession, 'id' | 'user_id' | 'created_at'>) => {
    if (!user?.id || !progress) return;

    try {
      const pointsEarned = calculatePoints(sessionData.type, sessionData.duration);
      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = progress.last_activity_date;

      let newStreak = progress.current_streak;
      let newLongestStreak = progress.longest_streak;

      // Calcular sequência
      if (lastActivityDate === today) {
        // Já registrou hoje, não muda streak
      } else if (lastActivityDate === getYesterdayDate()) {
        // Continua a sequência
        newStreak = progress.current_streak + 1;
        if (newStreak > progress.longest_streak) {
          newLongestStreak = newStreak;
        }
      } else {
        // Nova sequência
        newStreak = 1;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .update({
          total_points: progress.total_points + pointsEarned,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          total_sessions: progress.total_sessions + 1,
          total_focus_time: progress.total_focus_time + sessionData.duration,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar progresso:', error);
      } else {
        setProgress(data);
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const calculatePoints = (type: string, duration: number): number => {
    const basePoints: Record<string, number> = {
      'pomodoro': 20,
      'hyperfocus': 30,
      'deepflow': 25,
      'meditation': 15,
      'breathing': 10
    };

    return basePoints[type] || 10;
  };

  const getYesterdayDate = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(session =>
      session.started_at.startsWith(today) && session.completed
    );

    return {
      sessionsCount: todaySessions.length,
      totalMinutes: todaySessions.reduce((sum, session) => sum + session.duration, 0),
      pointsEarned: todaySessions.reduce((sum, session) => sum + (session.points_earned || 0), 0)
    };
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekSessions = sessions.filter(session =>
      new Date(session.started_at) >= weekAgo && session.completed
    );

    const stats = weekSessions.reduce((acc, session) => ({
      totalMinutes: acc.totalMinutes + session.duration,
      totalSessions: acc.totalSessions + 1,
      totalPoints: acc.totalPoints + (session.points_earned || 0)
    }), { totalMinutes: 0, totalSessions: 0, totalPoints: 0 });

    return {
      ...stats,
      dailyAverage: Math.round(stats.totalMinutes / 7)
    };
  };

  return {
    sessions,
    progress,
    loading,
    saveFocusSession,
    loadUserData,
    getTodayStats,
    getWeeklyStats,
    currentStreak: progress?.current_streak || 0,
    totalPoints: progress?.total_points || 0,
    totalFocusTime: progress?.total_focus_time || 0
  };
}
