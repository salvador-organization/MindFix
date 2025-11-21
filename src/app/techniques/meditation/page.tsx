'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const meditationSteps = [
  { time: 0, text: 'Encontre uma posição confortável...' },
  { time: 30, text: 'Feche os olhos suavemente...' },
  { time: 60, text: 'Respire profundamente pelo nariz...' },
  { time: 90, text: 'Expire lentamente pela boca...' },
  { time: 120, text: 'Observe seus pensamentos sem julgamento...' },
  { time: 180, text: 'Sinta seu corpo relaxando...' },
  { time: 240, text: 'Continue respirando naturalmente...' },
  { time: 270, text: 'Prepare-se para retornar...' },
];

export default function MeditationPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutos
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
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

  useEffect(() => {
    // Atualizar step baseado no tempo
    const elapsed = 5 * 60 - timeLeft;
    const step = meditationSteps.findIndex((s, i) => {
      const nextStep = meditationSteps[i + 1];
      return elapsed >= s.time && (!nextStep || elapsed < nextStep.time);
    });
    if (step !== -1) setCurrentStep(step);
  }, [timeLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    setShowCompletion(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Meditação Rápida</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                <X className="w-5 h-5" />
              </Button>
            </div>
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
                <h2 className="text-3xl font-bold mb-4">Namastê 🙏</h2>
                <p className="text-muted-foreground mb-2">
                  Você completou sua meditação
                </p>
                <p className="text-4xl font-bold text-primary mb-6">+30 pontos</p>
                <div className="space-y-3">
                  <Button
                    className="w-full gradient-primary"
                    size="lg"
                    onClick={() => {
                      setShowCompletion(false);
                      setTimeLeft(5 * 60);
                      setCurrentStep(0);
                    }}
                  >
                    Meditar Novamente
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
              key="meditation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              {/* Breathing Animation */}
              <div className="relative mb-12 h-64 flex items-center justify-center">
                <motion.div
                  animate={
                    isRunning
                      ? {
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }
                      : { scale: 1, opacity: 0.3 }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl"
                />
                <motion.div
                  animate={
                    isRunning
                      ? {
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }
                      : { scale: 1, opacity: 0.5 }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent"
                />
                <div className="relative z-10 text-center">
                  <motion.div
                    key={timeLeft}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-bold mb-2"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                </div>
              </div>

              {/* Instruction Text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center mb-8"
                >
                  <p className="text-lg text-muted-foreground">
                    {meditationSteps[currentStep]?.text}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center mb-8">
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

              {/* Tips */}
              <Card className="p-6 glass">
                <h3 className="font-semibold mb-3">💡 Dicas</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Encontre um lugar tranquilo</li>
                  <li>• Use fones de ouvido para melhor experiência</li>
                  <li>• Não se preocupe se sua mente divagar</li>
                  <li>• Pratique regularmente para melhores resultados</li>
                </ul>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
