'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PomodoroPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isBreak) {
      // Completou sessão de foco
      setCycles((prev) => prev + 1);
      setShowCompletion(true);
      // Vibração se disponível
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } else {
      // Completou pausa
      setIsBreak(false);
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const startBreak = () => {
    setShowCompletion(false);
    setIsBreak(true);
    setTimeLeft(5 * 60);
    setIsRunning(true);
  };

  const skipBreak = () => {
    setShowCompletion(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Pomodoro MindFix</h1>
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {showCompletion ? (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto"
            >
              <Card className="p-8 glass text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">Parabéns! 🎉</h2>
                <p className="text-muted-foreground mb-2">
                  Você completou uma sessão de Pomodoro
                </p>
                <p className="text-4xl font-bold text-primary mb-6">+50 pontos</p>
                <div className="space-y-3">
                  <Button className="w-full gradient-primary" size="lg" onClick={startBreak}>
                    Iniciar Pausa (5 min)
                  </Button>
                  <Button variant="outline" className="w-full" onClick={skipBreak}>
                    Pular Pausa
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => router.push('/dashboard')}>
                    Voltar ao Dashboard
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              {/* Status Badge */}
              <div className="text-center mb-8">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  isBreak ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                }`}>
                  {isBreak ? '☕ Pausa' : '🎯 Foco'}
                </span>
              </div>

              {/* Timer Circle */}
              <div className="relative mb-12">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-border"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(139, 92, 246)" />
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Timer Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={timeLeft}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-bold mb-2"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    {isBreak ? 'Tempo de pausa' : 'Tempo de foco'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <Button
                  size="icon"
                  variant="outline"
                  className="w-14 h-14 rounded-full"
                  onClick={resetTimer}
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  className="w-20 h-20 rounded-full gradient-primary"
                  onClick={toggleTimer}
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>
              </div>

              {/* Stats */}
              <Card className="p-6 glass">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{cycles}</p>
                    <p className="text-sm text-muted-foreground">Ciclos Hoje</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{cycles * 50}</p>
                    <p className="text-sm text-muted-foreground">Pontos</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
