// src/app/breathing/page.tsx with integrated useFocusSessionTracking hook

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, Pause, X, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFocusSessionTracking } from '@/hooks/useFocusSessionTracking';

type Phase = 'inhale' | 'hold' | 'exhale';

export default function BreathingPage() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isContinuous, setIsContinuous] = useState(false);

  const phaseDurations = {
    inhale: 4,
    hold: 7,
    exhale: 8
  };

  const phaseTexts = {
    inhale: 'Inspire',
    hold: 'Segure',
    exhale: 'Expire'
  };

  const phaseColors = {
    inhale: 'from-primary/30 to-accent/30',
    hold: 'from-accent/30 to-chart-2/30',
    exhale: 'from-chart-2/30 to-primary/30'
  };

  // Total time for tracking
  const totalTimeSeconds = (4 + 7 + 8) * 3; // default 3 cycles

  const {
    handleReset: handleTrackedReset,
    handleComplete: handleTrackedComplete
  } = useFocusSessionTracking({
    isRunning,
    timeLeft: 0, // breathing isn't a countdown, so unused
    totalTime: totalTimeSeconds,
    presetName: 'Breathing 4-7-8',
    onComplete: () => {},
    onReset: () => {}
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeInPhase((prev) => {
          const nextTime = prev + 1;
          const currentPhaseDuration = phaseDurations[phase];

          if (nextTime >= currentPhaseDuration) {
            if (phase === 'inhale') {
              setPhase('hold');
            } else if (phase === 'hold') {
              setPhase('exhale');
            } else {
              const newCycleCount = cycleCount + 1;
              setCycleCount(newCycleCount);

              if (!isContinuous && newCycleCount >= 3) {
                setIsRunning(false);
                handleTrackedComplete();
                return 0;
              }

              setPhase('inhale');
            }
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, phase, cycleCount, isContinuous]);

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setPhase('inhale');
    setTimeInPhase(0);
    setCycleCount(0);
    handleTrackedReset();
  };

  const getScale = () => {
    const progress = timeInPhase / phaseDurations[phase];

    if (phase === 'inhale') {
      return 1 + progress * 0.5;
    } else if (phase === 'hold') {
      return 1.5;
    } else {
      return 1.5 - progress * 0.5;
    }
  };

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

      <main className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Respiração 4-7-8</h1>
            <p className="text-muted-foreground">Técnica anti-ansiedade para acalmar a mente</p>
          </div>

          <Card className="p-12 glass text-center">
            <div className="relative w-80 h-80 mx-auto mb-8">
              <motion.div animate={{ scale: getScale() }} transition={{ duration: 1, ease: 'easeInOut' }} className={`w-full h-full rounded-full bg-gradient-to-br ${phaseColors[phase]} backdrop-blur-sm flex items-center justify-center border-4 border-primary/20`}>
                <div className="text-center">
                  <AnimatePresence mode="wait">
                    <motion.div key={phase} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                      <div className="text-6xl font-bold mb-4">{phaseDurations[phase] - timeInPhase}</div>
                      <div className="text-2xl text-muted-foreground">{phaseTexts[phase]}</div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                {(['inhale', 'hold', 'exhale'] as Phase[]).map((p) => (
                  <div key={p} className={`w-3 h-3 rounded-full transition-all ${phase === p ? 'bg-primary scale-125' : 'bg-muted'}`} />
                ))}
              </div>
            </div>

            <div className="text-lg text-muted-foreground mb-8 mt-12">Ciclo {cycleCount + 1} {!isContinuous && '/ 3'}</div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <Button size="lg" onClick={toggleRunning} className="gradient-primary w-32">
                {isRunning ? (<><Pause className="w-5 h-5 mr-2" />Pausar</>) : (<><Play className="w-5 h-5 mr-2" />Iniciar</>)}
              </Button>

              <Button size="lg" variant="outline" onClick={reset}>
                <RotateCcw className="w-5 h-5 mr-2" /> Reiniciar
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button variant={!isContinuous ? 'default' : 'outline'} onClick={() => setIsContinuous(false)} className={!isContinuous ? 'gradient-primary' : ''}>3 Ciclos</Button>
              <Button variant={isContinuous ? 'default' : 'outline'} onClick={() => setIsContinuous(true)} className={isContinuous ? 'gradient-primary' : ''}>Contínuo</Button>
            </div>
          </Card>

        </motion.div>
      </main>
    </div>
  );
}
