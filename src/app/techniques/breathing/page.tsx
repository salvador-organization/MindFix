'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export default function BreathingPage() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('rest');
  const [cycleCount, setCycleCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const phaseConfig = {
    inhale: { duration: 4000, text: 'Inspire', next: 'hold' as BreathPhase },
    hold: { duration: 7000, text: 'Segure', next: 'exhale' as BreathPhase },
    exhale: { duration: 8000, text: 'Expire', next: 'rest' as BreathPhase },
    rest: { duration: 2000, text: 'Descanse', next: 'inhale' as BreathPhase },
  };

  useEffect(() => {
    if (isActive && phase !== 'rest') {
      const config = phaseConfig[phase];
      timeoutRef.current = setTimeout(() => {
        if (config.next === 'rest') {
          const newCount = cycleCount + 1;
          setCycleCount(newCount);
          if (newCount >= 8) {
            handleComplete();
            return;
          }
        }
        setPhase(config.next);
      }, config.duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isActive, phase, cycleCount]);

  const handleComplete = () => {
    setIsActive(false);
    setPhase('rest');
    setShowCompletion(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const startBreathing = () => {
    setIsActive(true);
    setPhase('inhale');
    setCycleCount(0);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase('rest');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 0.8;
      default:
        return 1;
    }
  };

  const getCircleDuration = () => {
    if (phase === 'rest') return 0.5;
    return phaseConfig[phase].duration / 1000;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Respiração 4-7-8</h1>
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
                <h2 className="text-3xl font-bold mb-4">Excelente! 🌬️</h2>
                <p className="text-muted-foreground mb-2">
                  Você completou 8 ciclos de respiração
                </p>
                <p className="text-4xl font-bold text-primary mb-6">+25 pontos</p>
                <div className="space-y-3">
                  <Button
                    className="w-full gradient-primary"
                    size="lg"
                    onClick={() => {
                      setShowCompletion(false);
                      setCycleCount(0);
                    }}
                  >
                    Respirar Novamente
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
              key="breathing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Breathing Circle */}
              <div className="relative mb-12 h-96 flex items-center justify-center">
                {/* Outer glow */}
                <motion.div
                  animate={{
                    scale: getCircleScale(),
                    opacity: isActive ? [0.2, 0.4, 0.2] : 0.2,
                  }}
                  transition={{
                    duration: getCircleDuration(),
                    ease: 'easeInOut',
                  }}
                  className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl"
                />

                {/* Main circle */}
                <motion.div
                  animate={{
                    scale: getCircleScale(),
                  }}
                  transition={{
                    duration: getCircleDuration(),
                    ease: 'easeInOut',
                  }}
                  className="relative w-64 h-64 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                >
                  <div className="text-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-3xl font-bold text-white mb-2"
                      >
                        {isActive ? phaseConfig[phase].text : 'Pronto?'}
                      </motion.p>
                    </AnimatePresence>
                    {isActive && (
                      <p className="text-white/80 text-sm">
                        {phase === 'inhale' && '4 segundos'}
                        {phase === 'hold' && '7 segundos'}
                        {phase === 'exhale' && '8 segundos'}
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Cycle Counter */}
              <div className="text-center mb-8">
                <p className="text-5xl font-bold mb-2">{cycleCount}/8</p>
                <p className="text-muted-foreground">Ciclos completados</p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center mb-8">
                {!isActive ? (
                  <Button
                    size="icon"
                    className="w-20 h-20 rounded-full gradient-primary"
                    onClick={startBreathing}
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={stopBreathing}
                  >
                    Parar
                  </Button>
                )}
              </div>

              {/* Instructions */}
              <Card className="p-6 glass">
                <h3 className="font-semibold mb-4">📖 Como funciona</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Inspire pelo nariz</p>
                      <p>Conte até 4 enquanto inspira profundamente</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Segure a respiração</p>
                      <p>Mantenha o ar por 7 segundos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Expire pela boca</p>
                      <p>Solte o ar lentamente por 8 segundos</p>
                    </div>
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
