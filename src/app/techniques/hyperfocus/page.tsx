'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, CheckCircle2, Maximize } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HyperFocusPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutos
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    setShowCompletion(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((60 * 60 - timeLeft) / (60 * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Header */}
      {!isFullscreen && (
        <header className="border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">HyperFocus Mode</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  <Maximize className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 min-h-[calc(100vh-80px)] flex items-center justify-center">
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
                  <CheckCircle2 className="w-24 h-24 text-primary mx-auto mb-6" />
                </motion.div>
                <h2 className="text-4xl font-bold mb-4">Incrível! 🚀</h2>
                <p className="text-muted-foreground mb-2">
                  Você completou 1 hora de HyperFocus
                </p>
                <p className="text-5xl font-bold text-primary mb-6">+100 pontos</p>
                <div className="space-y-3">
                  <Button
                    className="w-full gradient-primary"
                    size="lg"
                    onClick={() => {
                      setShowCompletion(false);
                      setTimeLeft(60 * 60);
                    }}
                  >
                    Iniciar Nova Sessão
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard')}
                  >
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
              className="max-w-2xl mx-auto w-full"
            >
              {/* Immersive Timer Display */}
              <div className="text-center mb-12">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <p className="text-xl text-muted-foreground">
                  Modo de Concentração Profunda
                </p>
              </div>

              {/* Minimal Progress Bar */}
              <div className="mb-12 max-w-md mx-auto">
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Minimal Controls */}
              <div className="flex items-center justify-center gap-6 mb-12">
                <Button
                  size="icon"
                  className="w-24 h-24 rounded-full gradient-primary"
                  onClick={toggleTimer}
                >
                  {isRunning ? (
                    <Pause className="w-10 h-10" />
                  ) : (
                    <Play className="w-10 h-10 ml-1" />
                  )}
                </Button>
              </div>

              {/* Motivational Quote */}
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center max-w-lg mx-auto"
                >
                  <Card className="p-6 glass">
                    <p className="text-lg italic text-muted-foreground">
                      "O foco é a porta de entrada para o flow state. Mantenha-se presente."
                    </p>
                  </Card>
                </motion.div>
              )}

              {/* Stats */}
              {!isRunning && (
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
                  <Card className="p-4 glass text-center">
                    <p className="text-2xl font-bold text-primary">60</p>
                    <p className="text-xs text-muted-foreground">Minutos</p>
                  </Card>
                  <Card className="p-4 glass text-center">
                    <p className="text-2xl font-bold text-accent">100</p>
                    <p className="text-xs text-muted-foreground">Pontos</p>
                  </Card>
                  <Card className="p-4 glass text-center">
                    <p className="text-2xl font-bold text-chart-4">Pro</p>
                    <p className="text-xs text-muted-foreground">Nível</p>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 right-4 z-50"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-background/50 backdrop-blur-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
