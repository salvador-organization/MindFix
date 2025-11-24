'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Target, Zap, Award, TrendingUp, LogOut, Settings, User,
  CheckSquare, BarChart3, Trophy, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ClarityZone } from '@/components/custom/clarity-zone';
import { CustomPomodoro } from '@/components/custom/custom-pomodoro';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useSession } from '@/hooks/useSession';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading, signOut } = useUser();
  const { getTodayStats, getWeeklyStats, totalPoints, currentStreak } = useSession();

  const [stats, setStats] = useState({
    focusToday: '0m',
    streak: 0,
    points: 0,
    level: 1
  });

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = () => {
    const todayStats = getTodayStats();
    const weeklyStats = getWeeklyStats();
    const level = Math.floor(totalPoints / 100) + 1;

    const updatedStats = {
      focusToday: todayStats.totalMinutes > 0 ? `${todayStats.totalMinutes}m` : '0m',
      streak: currentStreak,
      points: totalPoints,
      level: level
    };

    setStats(updatedStats);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
      router.push('/');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.name || user.email?.split('@')[0] || 'Usuário';

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
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {userName}
              </span>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">
            Bem-vindo de volta, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Pronto para mais um dia de foco intenso?
          </p>
        </motion.div>

        {/* Quick Stats - Dados Reais */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Target, label: 'Foco Hoje', value: stats.focusToday, color: 'text-primary' },
            { icon: Zap, label: 'Sequência', value: `${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`, color: 'text-accent' },
            { icon: Award, label: 'Pontos', value: stats.points.toString(), color: 'text-chart-4' },
            { icon: TrendingUp, label: 'Nível', value: stats.level.toString(), color: 'text-chart-2' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 glass hover:scale-105 transition-all">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* POMODORO PERSONALIZADO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Pomodoro Personalizado</h2>
          <CustomPomodoro />
        </motion.div>

        {/* ZONA DE CLAREZA */}
        <ClarityZone />

        {/* Quick Access Navigation */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: CheckSquare, label: 'Tarefas', route: '/tasks', color: 'text-chart-1' },
            { icon: BarChart3, label: 'Relatórios', route: '/reports', color: 'text-chart-2' },
            { icon: Trophy, label: 'Conquistas', route: '/gamification', color: 'text-chart-4' },
            { icon: BookOpen, label: 'Mindfulness', route: '/meditation', color: 'text-accent' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Card 
                className="p-4 glass hover:scale-105 transition-all cursor-pointer"
                onClick={() => router.push(item.route)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 glass">
              <h2 className="text-2xl font-bold mb-4">Comece Agora</h2>
              <p className="text-muted-foreground mb-6">
                Escolha uma técnica e comece sua sessão de foco
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full gradient-primary justify-start" 
                  size="lg"
                  onClick={() => router.push('/pomodoro')}
                >
                  <Target className="w-5 h-5 mr-2" />
                  Pomodoro MindFix (25 min)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  onClick={() => router.push('/meditation')}
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Meditação Rápida (5 min)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  onClick={() => router.push('/hyperfocus')}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  HyperFocus Mode (50 min)
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* User Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 glass">
              <h2 className="text-2xl font-bold mb-4">Seu Progresso</h2>
              <div className="space-y-4">
                {stats.streak === 0 && stats.points === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Comece sua primeira sessão de foco para ver seu progresso aqui
                    </p>
                    <Button 
                      className="gradient-primary"
                      onClick={() => router.push('/pomodoro')}
                    >
                      Iniciar Primeira Sessão
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">Foco Hoje</h3>
                        <span className="text-sm text-primary">{stats.focusToday}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tempo total de foco no dia de hoje
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">Sequência Atual</h3>
                        <span className="text-sm text-accent">{stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stats.streak > 0 ? 'Continue focando para manter sua sequência!' : 'Comece uma nova sequência hoje!'}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-card/50 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">Pontos Totais</h3>
                        <span className="text-sm text-muted-foreground">{stats.points} pts</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nível {stats.level} - Continue evoluindo!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recommended Techniques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">Técnicas Disponíveis</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Brown Noise', 
                desc: 'Som de concentração profunda', 
                duration: '∞ loop',
                route: '/brown-noise'
              },
              { 
                title: 'Respiração 4-7-8', 
                desc: 'Técnica anti-ansiedade', 
                duration: '3 ciclos',
                route: '/breathing'
              },
              { 
                title: 'DeepFlow Session', 
                desc: 'Foco intenso e prolongado', 
                duration: '30-50 min',
                route: '/deepflow'
              }
            ].map((item, i) => (
              <Card 
                key={i} 
                className="p-6 glass hover:scale-105 transition-all cursor-pointer"
                onClick={() => router.push(item.route)}
              >
                <div className="w-full h-32 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4 flex items-center justify-center">
                  <div className="text-4xl">
                    {i === 0 && '🎧'}
                    {i === 1 && '🧘'}
                    {i === 2 && '🌊'}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.duration}</span>
                  <Button size="sm" variant="ghost">
                    Iniciar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-around p-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <Brain className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')}>
              <Target className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/gamification')}>
              <Award className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/reports')}>
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}