'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, X, Award, Trophy, Star, Zap, Target,
  CheckCircle2, Lock, TrendingUp, Flame, AlertCircle, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTotalPoints, getPointsHistory, type PointsEntry } from '@/lib/points-system';
import { supabase } from '@/lib/supabase';

// Tipos para dados reais
interface UserLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'comum' | 'raro' | 'epico' | 'lendario';
}

interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  type: 'foco' | 'tarefas' | 'meditacao' | 'habitos';
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
  expiresAt: Date;
}

const RARITY_COLORS = {
  comum: 'border-muted text-muted-foreground',
  raro: 'border-chart-1 text-chart-1',
  epico: 'border-chart-3 text-chart-3',
  lendario: 'border-chart-4 text-chart-4'
};

export default function GamificationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<WeeklyMission[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsEntry[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    loadUserData();
    
    // Listener para atualizar quando pontos mudarem
    const handlePointsUpdate = () => {
      loadUserData();
    };
    
    window.addEventListener('pointsUpdated', handlePointsUpdate);
    
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate);
    };
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Buscar sessão do usuário
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Buscar dados do perfil do usuário
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData) {
        console.error('Perfil não encontrado');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Buscar pontos totais usando a nova função
      const points = await getTotalPoints(session.user.id);
      setTotalPoints(points);

      // Calcular nível baseado em dados do perfil
      const calculatedLevel = {
        level: profile.level || 1,
        currentXP: profile.xp % 100,
        xpToNextLevel: 100,
        totalXP: profile.xp || 0
      };
      setUserLevel(calculatedLevel);

      // Carregar histórico de pontos (últimos 10)
      const history = getPointsHistory(10);
      setPointsHistory(history);

      // Carregar dados do localStorage para conquistas e missões (por enquanto mantemos localStorage)
      const achievementsData = localStorage.getItem('user-achievements');
      const missionsData = localStorage.getItem('weekly-missions');
      const sessionsData = localStorage.getItem('focus-sessions');

      // Carregar conquistas reais
      if (achievementsData) {
        const loadedAchievements = JSON.parse(achievementsData);
        setAchievements(loadedAchievements);
      } else {
        // Inicializar conquistas baseadas em dados reais
        const initialAchievements = initializeAchievements(sessionsData ? JSON.parse(sessionsData) : []);
        setAchievements(initialAchievements);
        localStorage.setItem('user-achievements', JSON.stringify(initialAchievements));
      }

      // Carregar missões semanais reais
      if (missionsData) {
        const loadedMissions = JSON.parse(missionsData);
        // Verificar se missões expiraram
        const validMissions = loadedMissions.filter((m: WeeklyMission) =>
          new Date(m.expiresAt) > new Date()
        );

        if (validMissions.length === 0) {
          // Gerar novas missões baseadas em dados reais
          const newMissions = generateWeeklyMissions(sessionsData ? JSON.parse(sessionsData) : []);
          setWeeklyMissions(newMissions);
          localStorage.setItem('weekly-missions', JSON.stringify(newMissions));
        } else {
          setWeeklyMissions(validMissions);
        }
      } else {
        // Gerar missões iniciais
        const newMissions = generateWeeklyMissions(sessionsData ? JSON.parse(sessionsData) : []);
        setWeeklyMissions(newMissions);
        localStorage.setItem('weekly-missions', JSON.stringify(newMissions));
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
      setLoading(false);
    }
  };

  const calculateUserLevel = (points: number): UserLevel => {
    // Calcular nível (100 pontos por nível)
    const level = Math.floor(points / 100) + 1;
    const currentXP = points % 100;
    const xpToNextLevel = 100;
    
    return {
      level,
      currentXP,
      xpToNextLevel,
      totalXP: points
    };
  };

  const initializeAchievements = (sessions: any[]): Achievement[] => {
    const completedCount = sessions.filter(s => s.completed).length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    
    return [
      {
        id: 'first-session',
        title: 'Primeiro Passo',
        description: 'Complete sua primeira sessão de foco',
        icon: '🎯',
        xpReward: 50,
        requirement: 1,
        progress: Math.min(completedCount, 1),
        unlocked: completedCount >= 1,
        unlockedAt: completedCount >= 1 ? new Date() : undefined,
        rarity: 'comum'
      },
      {
        id: 'focus-warrior',
        title: 'Guerreiro do Foco',
        description: 'Complete 10 sessões de foco',
        icon: '⚔️',
        xpReward: 100,
        requirement: 10,
        progress: Math.min(completedCount, 10),
        unlocked: completedCount >= 10,
        unlockedAt: completedCount >= 10 ? new Date() : undefined,
        rarity: 'raro'
      },
      {
        id: 'focus-master',
        title: 'Mestre do Foco',
        description: 'Complete 50 sessões de foco',
        icon: '🏆',
        xpReward: 250,
        requirement: 50,
        progress: Math.min(completedCount, 50),
        unlocked: completedCount >= 50,
        unlockedAt: completedCount >= 50 ? new Date() : undefined,
        rarity: 'epico'
      },
      {
        id: 'time-lord',
        title: 'Senhor do Tempo',
        description: 'Acumule 1000 minutos de foco',
        icon: '⏰',
        xpReward: 300,
        requirement: 1000,
        progress: Math.min(totalMinutes, 1000),
        unlocked: totalMinutes >= 1000,
        unlockedAt: totalMinutes >= 1000 ? new Date() : undefined,
        rarity: 'epico'
      },
      {
        id: 'legend',
        title: 'Lenda Viva',
        description: 'Complete 100 sessões de foco',
        icon: '👑',
        xpReward: 500,
        requirement: 100,
        progress: Math.min(completedCount, 100),
        unlocked: completedCount >= 100,
        unlockedAt: completedCount >= 100 ? new Date() : undefined,
        rarity: 'lendario'
      }
    ];
  };

  const generateWeeklyMissions = (sessions: any[]): WeeklyMission[] => {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Contar sessões da semana atual
    const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    const weekSessions = sessions.filter(s => new Date(s.date) >= weekStart);
    const completedThisWeek = weekSessions.filter(s => s.completed).length;
    
    return [
      {
        id: 'weekly-focus',
        title: 'Foco Semanal',
        description: 'Complete 10 sessões de foco esta semana',
        type: 'foco',
        target: 10,
        progress: completedThisWeek,
        xpReward: 200,
        completed: completedThisWeek >= 10,
        expiresAt: weekEnd
      },
      {
        id: 'weekly-consistency',
        title: 'Consistência',
        description: 'Faça pelo menos uma sessão por dia durante 5 dias',
        type: 'habitos',
        target: 5,
        progress: 0,
        xpReward: 150,
        completed: false,
        expiresAt: weekEnd
      },
      {
        id: 'weekly-minutes',
        title: 'Maratona de Foco',
        description: 'Acumule 300 minutos de foco esta semana',
        type: 'foco',
        target: 300,
        progress: weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
        xpReward: 250,
        completed: weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) >= 300,
        expiresAt: weekEnd
      }
    ];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Estado de carregamento
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">MindFix</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Estado vazio - usuário novo
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">MindFix</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Estado vazio - usuário novo
  if (!userLevel || userLevel.totalXP === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">MindFix</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Conquistas & Recompensas</h1>
              <p className="text-muted-foreground">
                Acompanhe seu progresso e desbloqueie conquistas especiais
              </p>
            </div>
            
            <Card className="p-12 glass text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Comece sua jornada!</h2>
              <p className="text-muted-foreground mb-6">
                Complete sessões de foco para ganhar pontos, subir de nível e desbloquear conquistas incríveis.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Iniciar Primeira Sessão
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const xpProgress = profile ? ((profile.xp % 100) / 100) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">MindFix</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Conquistas & Recompensas</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e desbloqueie conquistas especiais
            </p>
          </div>

          {/* Level Card */}
          <Card className="p-8 glass mb-8 relative overflow-hidden">
            <div className="absolute inset-0 gradient-hero opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Nível {profile?.level ?? 1}</h2>
                    <p className="text-muted-foreground">
                      {profile?.xp ?? 0} XP Total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Pontos Totais</p>
                  <p className="text-2xl font-bold text-primary">{totalPoints}</p>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 gradient-primary rounded-full"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {profile ? `${100 - (profile.xp % 100)} pontos para o próximo nível` : 'Carregando...'}
              </p>
            </div>
          </Card>

          {/* Histórico de Pontos */}
          {pointsHistory.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Histórico de Pontos
              </h2>
              <Card className="p-6 glass">
                <div className="space-y-3">
                  {pointsHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Award className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{entry.techniqueName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">+{entry.points}</p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Weekly Missions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Missões Semanais
            </h2>
            {weeklyMissions.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {weeklyMissions.map((mission, i) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`p-6 glass ${
                      mission.completed ? 'border-primary border-2' : ''
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold">{mission.title}</h3>
                        {mission.completed && (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {mission.description}
                      </p>
                      
                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-semibold">
                            {mission.progress} / {mission.target}
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((mission.progress / mission.target) * 100, 100)}%` }}
                            transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                            className={`absolute inset-y-0 left-0 rounded-full ${
                              mission.completed ? 'bg-primary' : 'gradient-primary'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Reward */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Recompensa</span>
                        <span className="font-bold text-primary">+{mission.xpReward} XP</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-8 glass text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma missão disponível no momento</p>
              </Card>
            )}
          </div>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Conquistas Desbloqueadas ({unlockedAchievements.length})
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                {unlockedAchievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="p-6 glass hover:scale-105 transition-all border-primary border-2">
                      <div className="text-center">
                        <div className="text-5xl mb-3">{achievement.icon}</div>
                        <h3 className="font-bold mb-1">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-sm text-primary">
                          <Star className="w-4 h-4" />
                          <span className="font-semibold">+{achievement.xpReward} XP</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-muted-foreground" />
                Conquistas Bloqueadas ({lockedAchievements.length})
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                {lockedAchievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="p-6 glass hover:scale-105 transition-all opacity-60">
                      <div className="text-center">
                        <div className="text-5xl mb-3 grayscale">{achievement.icon}</div>
                        <h3 className="font-bold mb-1">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        
                        {/* Progress */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-semibold">
                              {achievement.progress} / {achievement.requirement}
                            </span>
                          </div>
                          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(achievement.progress / achievement.requirement) * 100}%` }}
                              transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                              className="absolute inset-y-0 left-0 bg-muted-foreground rounded-full"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span className="font-semibold">+{achievement.xpReward} XP</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
