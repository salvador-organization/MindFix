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
import { useUser } from '@/hooks/useUser';
import { useSession } from '@/hooks/useSession';
import { getDashboardStatsFromSupabase } from '@/lib/points-system';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading, signOut } = useUser();

  const [stats, setStats] = useState({
    focusToday: '0m',
    streak: 0,
    points: 0,
    level: 1
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const dashboardStats = await getDashboardStatsFromSupabase(user.id);

      const updatedStats = {
        focusToday: dashboardStats.todayMinutes > 0 ? `${dashboardStats.todayMinutes}m` : '0m',
        streak: dashboardStats.currentStreak,
        points: dashboardStats.totalPoints,
        level: Math.floor(dashboardStats.totalPoints / 100) + 1
      };

      setStats(updatedStats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  useEffect(() => {
    const handler = () => fetchStats();
    window.addEventListener("dashboardUpdated", handler);
    return () => window.removeEventListener("dashboardUpdated", handler);
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      // Se não há usuário e não está carregando, redirecionar para login
      console.log('Dashboard: usuário não encontrado, redirecionando para login');
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Se ainda está carregando ou não há usuário, mostrar loading dentro do JSX
  const shouldShowLoading = userLoading || !user || loading;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
      router.push('/');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };


  const userName = user?.name || user?.email?.split('@')[0] || 'Usuário';

  // ⚠️ REMOVIDO: Early return que QUEBRA os hooks!
  // Antes: if (userLoading || !user) return (...)
  // Isso causava React Error #310 porque os hooks useUser() e useSession()
  // eram chamados em algumas renderizações mas não em outras.
  // Agora TODOS os hooks são chamados SEMPRE, independente do estado de loading.

  return (
    <div className="min-h-screen bg-background">
      {shouldShowLoading ? (
        // Loading state - sempre renderiza dentro do JSX normal
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {userLoading ? 'Carregando...' : 'Redirecionando para login...'}
            </p>
          </div>
        </div>
      ) : (
        <>
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
        <div className="w-full max-w-[1400px] mx-auto mb-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              label: 'Sequência',
              value: loading ? '...' : `${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`,
              color: 'text-accent'
            },
            {
              icon: Award,
              label: 'Pontos',
              value: loading ? '...' : stats.points.toString(),
              color: 'text-chart-4'
            },
            {
              icon: TrendingUp,
              label: 'Nível',
              value: loading ? '...' : stats.level.toString(),
              color: 'text-chart-2'
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
            >
              <Card className="p-8 glass hover:scale-105 transition-all min-h-[180px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
          </div>
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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ) : stats.streak === 0 && stats.points === 0 ? (
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
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">Sequência Atual</h3>
                        <span className="text-sm text-accent">{loading ? '...' : `${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {loading ? 'Carregando...' : (stats.streak > 0 ? 'Continue focando para manter sua sequência!' : 'Comece uma nova sequência hoje!')}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-card/50 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">Pontos Totais</h3>
                        <span className="text-sm text-muted-foreground">{loading ? '...' : `${stats.points} pts`}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {loading ? 'Carregando...' : `Nível ${stats.level} - Continue evoluindo!`}
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
          <div className="w-full max-w-[1400px] mx-auto mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
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
                className="bg-[#0f0f1a] p-6 rounded-xl border border-white/5 h-full w-full hover:scale-105 transition-all cursor-pointer"
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
        </>
      )}
    </div>
  );
}