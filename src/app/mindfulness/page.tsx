'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, X, Play, Clock, Star, Sparkles,
  Headphones, Eye, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MENTAL_EXERCISES, type MentalExercise } from '@/lib/types';

const MICRO_MEDITATIONS = [
  {
    id: 'breath-30',
    name: 'Respiração Consciente',
    duration: 30,
    description: 'Foque apenas na sua respiração por 30 segundos',
    icon: '🌬️'
  },
  {
    id: 'body-scan-60',
    name: 'Body Scan Rápido',
    duration: 60,
    description: 'Escaneie seu corpo dos pés à cabeça em 1 minuto',
    icon: '🧘'
  },
  {
    id: 'gratitude-45',
    name: 'Gratidão Express',
    duration: 45,
    description: 'Pense em 3 coisas pelas quais você é grato',
    icon: '💝'
  },
  {
    id: 'reset-30',
    name: 'Reset Mental',
    duration: 30,
    description: 'Limpe sua mente e recomece do zero',
    icon: '🔄'
  }
];

const DIFFICULTY_COLORS = {
  facil: 'text-chart-2',
  medio: 'text-chart-4',
  dificil: 'text-chart-5'
};

const TYPE_ICONS = {
  auditivo: Headphones,
  visual: Eye,
  cognitivo: Zap
};

export default function MindfulnessPage() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<MentalExercise | null>(null);

  const startMicroMeditation = (meditation: typeof MICRO_MEDITATIONS[0]) => {
    router.push(`/meditation?type=micro&duration=${meditation.duration}&name=${encodeURIComponent(meditation.name)}`);
  };

  const startMentalExercise = (exercise: MentalExercise) => {
    setSelectedExercise(exercise);
    // Aqui você implementaria a lógica do exercício
  };

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
            <h1 className="text-4xl font-bold mb-2">Mindfulness & Foco Mental</h1>
            <p className="text-muted-foreground">
              Treine sua mente com micro-meditações e exercícios mentais
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Sessões Hoje', value: '0', icon: Brain, color: 'text-primary' },
              { label: 'Tempo Total', value: '0m', icon: Clock, color: 'text-accent' },
              { label: 'Sequência', value: '0 dias', icon: Star, color: 'text-chart-4' }
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

          {/* Micro Meditations */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Micro-Meditações (30-60s)</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Práticas rápidas para resetar sua mente em menos de 1 minuto
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {MICRO_MEDITATIONS.map((meditation, i) => (
                <motion.div
                  key={meditation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 glass hover:scale-105 transition-all cursor-pointer group">
                    <div className="text-center">
                      <div className="text-5xl mb-4">{meditation.icon}</div>
                      <h3 className="font-bold mb-2">{meditation.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {meditation.description}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="w-4 h-4" />
                        <span>{meditation.duration}s</span>
                      </div>
                      <Button 
                        className="w-full gradient-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        size="sm"
                        onClick={() => startMicroMeditation(meditation)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mental Exercises */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Treinos Mentais</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Exercícios para fortalecer diferentes aspectos do seu foco
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {MENTAL_EXERCISES.map((exercise, i) => {
                const Icon = TYPE_ICONS[exercise.type];
                return (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="p-6 glass hover:scale-105 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <Icon className="w-8 h-8 text-accent" />
                        <span className={`text-xs px-2 py-1 rounded-full bg-card border border-border capitalize ${
                          DIFFICULTY_COLORS[exercise.difficulty]
                        }`}>
                          {exercise.difficulty}
                        </span>
                      </div>
                      <h3 className="font-bold mb-2">{exercise.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {exercise.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{exercise.duration}s</span>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {exercise.type}
                        </span>
                      </div>
                      <Button 
                        className="w-full gradient-primary"
                        onClick={() => startMentalExercise(exercise)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Começar Treino
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Full Meditations */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Meditações Completas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: 'Meditação Guiada',
                  duration: '5 min',
                  description: 'Body scan completo com respiração consciente',
                  route: '/meditation',
                  icon: '🧘'
                },
                {
                  name: 'Respiração 4-7-8',
                  duration: '3 ciclos',
                  description: 'Técnica anti-ansiedade para acalmar a mente',
                  route: '/breathing',
                  icon: '🌬️'
                }
              ].map((meditation, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card 
                    className="p-8 glass hover:scale-105 transition-all cursor-pointer"
                    onClick={() => router.push(meditation.route)}
                  >
                    <div className="flex items-start gap-6">
                      <div className="text-6xl">{meditation.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{meditation.name}</h3>
                        <p className="text-muted-foreground mb-4">
                          {meditation.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{meditation.duration}</span>
                          </div>
                          <Button className="gradient-primary">
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
