'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, X, TrendingUp, Calendar, Clock, Target,
  BarChart3, Activity, Flame, Award, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Tipos para dados reais do usuário
interface FocusSession {
  id: string;
  date: Date;
  duration: number; // em minutos
  category?: string;
  completed: boolean;
}

interface UserStats {
  weeklyMinutes: number;
  completedSessions: number;
  currentStreak: number;
  dailyAverage: number;
  weeklyData: Array<{ day: string; minutes: number; sessions: number }>;
  hourlyData: Array<{ hour: number; minutes: number }>;
  categoryData: Array<{ category: string; minutes: number; percentage: number }>;
  monthlyData: Array<{ month: string; minutes: number; sessions: number; growth: number }>;
}

export default function ReportsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setMounted(true);
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      // Carregar dados reais do localStorage
      const sessionsData = localStorage.getItem('focus-sessions');
      
      if (!sessionsData) {
        setLoading(false);
        return;
      }

      const sessions: FocusSession[] = JSON.parse(sessionsData);
      
      // Calcular estatísticas reais
      const stats = calculateStats(sessions);
      setUserStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const calculateStats = (sessions: FocusSession[]): UserStats => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filtrar sessões da última semana
    const weekSessions = sessions.filter(s => new Date(s.date) >= weekAgo);
    
    // Calcular minutos totais da semana
    const weeklyMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Contar sessões completas
    const completedSessions = weekSessions.filter(s => s.completed).length;
    
    // Calcular sequência atual
    const currentStreak = calculateStreak(sessions);
    
    // Média diária
    const dailyAverage = Math.round(weeklyMinutes / 7);
    
    // Dados semanais por dia
    const weeklyData = calculateWeeklyData(weekSessions);
    
    // Dados por hora
    const hourlyData = calculateHourlyData(sessions);
    
    // Dados por categoria
    const categoryData = calculateCategoryData(weekSessions);
    
    // Dados mensais
    const monthlyData = calculateMonthlyData(sessions);
    
    return {
      weeklyMinutes,
      completedSessions,
      currentStreak,
      dailyAverage,
      weeklyData,
      hourlyData,
      categoryData,
      monthlyData
    };
  };

  const calculateStreak = (sessions: FocusSession[]): number => {
    if (sessions.length === 0) return 0;
    
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  };

  const calculateWeeklyData = (sessions: FocusSession[]) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekData = days.map(day => ({ day, minutes: 0, sessions: 0 }));
    
    sessions.forEach(session => {
      const dayIndex = new Date(session.date).getDay();
      weekData[dayIndex].minutes += session.duration;
      weekData[dayIndex].sessions += 1;
    });
    
    // Reordenar para começar na segunda-feira
    return [...weekData.slice(1), weekData[0]];
  };

  const calculateHourlyData = (sessions: FocusSession[]) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, minutes: 0 }));
    
    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      hourlyData[hour].minutes += session.duration;
    });
    
    return hourlyData;
  };

  const calculateCategoryData = (sessions: FocusSession[]) => {
    const categoryMap = new Map<string, number>();
    let totalMinutes = 0;
    
    sessions.forEach(session => {
      const category = session.category || 'Sem categoria';
      categoryMap.set(category, (categoryMap.get(category) || 0) + session.duration);
      totalMinutes += session.duration;
    });
    
    return Array.from(categoryMap.entries()).map(([category, minutes]) => ({
      category,
      minutes,
      percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0
    }));
  };

  const calculateMonthlyData = (sessions: FocusSession[]) => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const last3Months = Array.from({ length: 3 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (2 - i));
      return {
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        minutes: 0,
        sessions: 0
      };
    });
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const monthIndex = last3Months.findIndex(m => 
        m.month === monthNames[sessionDate.getMonth()] && 
        m.year === sessionDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        last3Months[monthIndex].minutes += session.duration;
        last3Months[monthIndex].sessions += 1;
      }
    });
    
    return last3Months.map((month, i) => ({
      month: month.month,
      minutes: month.minutes,
      sessions: month.sessions,
      growth: i > 0 && last3Months[i - 1].minutes > 0
        ? Math.round(((month.minutes - last3Months[i - 1].minutes) / last3Months[i - 1].minutes) * 100)
        : 0
    }));
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
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Estado vazio - sem dados
  if (!userStats || userStats.weeklyMinutes === 0) {
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
              <h1 className="text-4xl font-bold mb-2">Relatórios & Histórico</h1>
              <p className="text-muted-foreground">
                Acompanhe sua evolução e identifique padrões de produtividade
              </p>
            </div>
            
            <Card className="p-12 glass text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Nenhum dado disponível ainda</h2>
              <p className="text-muted-foreground mb-6">
                Complete algumas sessões de foco para ver suas estatísticas e relatórios aqui.
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

  const maxMinutes = Math.max(...userStats.weeklyData.map(d => d.minutes), 1);
  const maxHourlyMinutes = Math.max(...userStats.hourlyData.map(d => d.minutes), 1);

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
            <h1 className="text-4xl font-bold mb-2">Relatórios & Histórico</h1>
            <p className="text-muted-foreground">
              Acompanhe sua evolução e identifique padrões de produtividade
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { 
                icon: Clock, 
                label: 'Foco Semanal', 
                value: `${userStats.weeklyMinutes} min`, 
                change: userStats.weeklyMinutes > 0 ? 'Ativo' : 'Inativo', 
                color: 'text-primary' 
              },
              { 
                icon: Target, 
                label: 'Sessões Completas', 
                value: userStats.completedSessions.toString(), 
                change: `Esta semana`, 
                color: 'text-accent' 
              },
              { 
                icon: Flame, 
                label: 'Sequência Atual', 
                value: `${userStats.currentStreak} ${userStats.currentStreak === 1 ? 'dia' : 'dias'}`, 
                change: userStats.currentStreak > 0 ? 'Mantendo!' : 'Comece hoje', 
                color: 'text-chart-4' 
              },
              { 
                icon: TrendingUp, 
                label: 'Média Diária', 
                value: `${userStats.dailyAverage} min`, 
                change: 'Últimos 7 dias', 
                color: 'text-chart-2' 
              }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 glass hover:scale-105 transition-all">
                  <metric.icon className={`w-8 h-8 ${metric.color} mb-3`} />
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold mb-1">{metric.value}</p>
                  <p className="text-xs text-primary">{metric.change}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Weekly Progress Chart */}
          <Card className="p-8 glass mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Progresso Semanal</h2>
                <p className="text-sm text-muted-foreground">Minutos de foco por dia</p>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Esta Semana
              </Button>
            </div>

            <div className="space-y-4">
              {userStats.weeklyData.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12">{day.day}</span>
                    <span className="text-muted-foreground">{day.sessions} sessões</span>
                    <span className="font-bold w-16 text-right">{day.minutes}m</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                      transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                      className="absolute inset-y-0 left-0 gradient-primary rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Hourly Heatmap */}
          <Card className="p-8 glass mb-8">
            <h2 className="text-2xl font-bold mb-1">Horários de Maior Foco</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Identifique seus períodos mais produtivos
            </p>

            <div className="grid grid-cols-12 gap-2">
              {userStats.hourlyData.map((data, i) => {
                const intensity = maxHourlyMinutes > 0 ? data.minutes / maxHourlyMinutes : 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="relative group"
                  >
                    <div
                      className={`aspect-square rounded-lg transition-all cursor-pointer ${
                        intensity === 0
                          ? 'bg-muted'
                          : intensity < 0.3
                          ? 'bg-primary/20'
                          : intensity < 0.6
                          ? 'bg-primary/50'
                          : 'bg-primary'
                      }`}
                      title={`${data.hour}h - ${data.minutes}min`}
                    />
                    {i % 3 === 0 && (
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                        {data.hour}h
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Category Distribution & Monthly Comparison */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Category Distribution */}
            <Card className="p-8 glass">
              <h2 className="text-2xl font-bold mb-1">Distribuição por Categoria</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Onde você investe seu tempo
              </p>

              {userStats.categoryData.length > 0 ? (
                <div className="space-y-4">
                  {userStats.categoryData.map((cat, i) => (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-muted-foreground">{cat.minutes}m ({cat.percentage}%)</span>
                      </div>
                      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                          className="absolute inset-y-0 left-0 gradient-primary rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma categoria registrada ainda</p>
                </div>
              )}
            </Card>

            {/* Monthly Comparison */}
            <Card className="p-8 glass">
              <h2 className="text-2xl font-bold mb-1">Comparação Mensal</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Evolução dos últimos 3 meses
              </p>

              <div className="space-y-6">
                {userStats.monthlyData.map((month, i) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg bg-card/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{month.month}</h3>
                      {month.growth > 0 && (
                        <span className="text-sm text-primary flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +{month.growth}%
                        </span>
                      )}
                      {month.growth < 0 && (
                        <span className="text-sm text-destructive flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 rotate-180" />
                          {month.growth}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total de Foco</p>
                        <p className="text-xl font-bold">{month.minutes}m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sessões</p>
                        <p className="text-xl font-bold">{month.sessions}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
