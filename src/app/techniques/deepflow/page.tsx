'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, CheckCircle2, Maximize } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DeepFlowPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutos
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

  const progress = ((90 * 60 - timeLeft) / (90 * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e]">
      {/* Minimal Header */}
      {!isFullscreen && (
        <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">DeepFlow Session</h1>
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

      {/* Ultra Minimal Content */}
      <main className="container mx-auto px-4 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showCompletion ? (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto"
            >
              <Card className="p-8 glass text-center border-primary/20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <CheckCircle2 className="w-24 h-24 text-primary mx-auto mb-6" />
                </motion.div>
                <h2 className="text-4xl font-bold mb-4">Flow State Alcançado! 🌊</h2>
                <p className="text-muted-foreground mb-2">
                  Você completou 90 minutos de DeepFlow
                </p>
                <p className="text-6xl font-bold text-primary mb-6">+150 pontos</p>
                <div className="space-y-3">
                  <Button
                    className="w-full gradient-primary"
                    size="lg"
                    onClick={() => {
                      setShowCompletion(false);
                      setTimeLeft(90 * 60);
                    }}
                  >
                    Nova Sessão DeepFlow
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl mx-auto"
            >
              {/* Ambient Background Effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[100px]"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                  }}
                  className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/20 blur-[100px]"
                />
              </div>

              {/* Timer Display - Ultra Clean */}
              <div className="relative z-10 text-center mb-16">
                <motion.div
                  key={timeLeft}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className="text-[10rem] md:text-[12rem] font-bold leading-none mb-6 bg-gradient-to-br from-white via-primary/80 to-accent/60 bg-clip-text text-transparent"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <motion.p
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-2xl text-white/40 tracking-widest uppercase"
                >
                  Deep Flow State
                </motion.p>
              </div>

              {/* Minimal Progress */}
              <div className="relative z-10 mb-16 max-w-2xl mx-auto">
                <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Single Control Button */}
              <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="icon"
                    className="w-28 h-28 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl"
                    onClick={toggleTimer}
                  >
                    {isRunning ? (
                      <Pause className="w-12 h-12 text-white" />
                    ) : (
                      <Play className="w-12 h-12 ml-1 text-white" />
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Floating Quote - Only when running */}
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                  className="relative z-10 text-center mt-16 max-w-2xl mx-auto"
                >
                  <p className="text-lg text-white/30 italic">
                    "No flow state, tempo desaparece. Você e a tarefa se tornam um."
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fullscreen Exit */}
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
            className="bg-white/5 backdrop-blur-xl border border-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
