'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, Pause, RotateCcw, X, CheckCircle2, Volume2, VolumeX, Music } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useBinauralAudio } from '@/hooks/useBinauralAudio';
import { useAmbientSound, type AmbientSoundType } from '@/hooks/useAmbientSound';
import { useFocusSessionTracking } from '@/hooks/useFocusSessionTracking';

const AMBIENT_SOUNDS = [
  { id: 'none' as AmbientSoundType, name: 'Nenhum', icon: '🔇' },
  { id: 'light-rain' as AmbientSoundType, name: 'Chuva leve', icon: '🌧️' },
  { id: 'forest' as AmbientSoundType, name: 'Floresta', icon: '🌲' },
  { id: 'ocean-waves' as AmbientSoundType, name: 'Mar/Ondas', icon: '🌊' },
  { id: 'busy-cafe' as AmbientSoundType, name: 'Café movimentado', icon: '☕' },
  { id: 'ambient-piano' as AmbientSoundType, name: 'Piano ambiente', icon: '🎹' },
  { id: 'white-noise' as AmbientSoundType, name: 'White noise', icon: '📻' },
  { id: 'gentle-wind' as AmbientSoundType, name: 'Vento suave', icon: '💨' }
];

export default function DeepFlowPage() {
  const router = useRouter();
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Som binaural para imersão prolongada (10Hz - Alpha waves)
  const binauralAudio = useBinauralAudio({
    baseFrequency: 200,
    beatFrequency: 10,
    volume: 0.23,
    fadeInDuration: 3,
    fadeOutDuration: 2
  });

  // Som ambiente
  const ambientSound = useAmbientSound({
    initialSound: 'none',
    volume: 0.3
  });

  // 🔹 Hook de tracking da sessão
  const { handleReset } = useFocusSessionTracking({
    isRunning,
    timeLeft,
    totalTime: duration * 60,
    presetName: 'DeepFlow',
    onComplete: () => {
      /// evita conflito ao finalizar
      internalCompletionSequence();
    },
    onReset: () => {
      setIsCompleted(false);
      toast.info('Sessão interrompida. Progresso parcial salvo.');
    }
  });

  /** ----------------------------------------------------------------------
   *  LÓGICA PRINCIPAL
   *  ----------------------------------------------------------------------*/

  // Controlar áudio baseado no timer
  useEffect(() => {
    if (isRunning && soundEnabled) {
      binauralAudio.play();
      if (ambientSound.currentSound !== 'none') {
        ambientSound.play(ambientSound.currentSound);
      }
    } else {
      binauralAudio.pause();
      ambientSound.stop();
    }
  }, [isRunning, soundEnabled]);

  // Cleanup ao sair da página
  useEffect(() => {
    return () => {
      binauralAudio.pause();
      ambientSound.stop();
    };
  }, []);

  // Respiração inicial (60s)
  useEffect(() => {
    if (isRunning && timeLeft === duration * 60) {
      setShowBreathing(true);
      breathIntervalRef.current = setInterval(() => {
        setBreathPhase((prev) => (prev === 'in' ? 'out' : 'in'));
      }, 4000);

      setTimeout(() => {
        setShowBreathing(false);
        if (breathIntervalRef.current) {
          clearInterval(breathIntervalRef.current);
        }
      }, 60000);
    }
  }, [isRunning, timeLeft, duration]);

  // Timer principal
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  // 🔹 Finalização interna (usada quando o hook detecta o fim)
  const internalCompletionSequence = () => {
    setIsRunning(false);
    setIsCompleted(true);

    // Som final suave
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 432;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);
    }

    toast.success(`DeepFlow concluído! +${duration} pontos registrados`);
  };

  /** ----------------------------------------------------------------------
   *  FUNÇÕES DE CONTROLE
   *  ----------------------------------------------------------------------*/

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetPageTimer = () => {
    handleReset(); // <-- tracking automático
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsCompleted(false);
    setShowBreathing(false);
  };

  const changeDuration = (newDuration: number) => {
    setDuration(newDuration);
    setTimeLeft(newDuration * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    binauralAudio.setVolume(parseFloat(e.target.value));
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    ambientSound.setVolume(parseFloat(e.target.value));
  };

  const handleAmbientSoundChange = (soundId: AmbientSoundType) => {
    ambientSound.changeSound(soundId);
    if (isRunning && soundEnabled && soundId !== 'none') {
      setTimeout(() => ambientSound.play(soundId), 100);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  /** ----------------------------------------------------------------------
   *  UI
   *  ----------------------------------------------------------------------*/

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
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

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">

          {/* TITLE */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">DeepFlow Session</h1>
            <p className="text-muted-foreground">
              Foco profundo com ambiente sonoro imersivo (10Hz Alpha waves)
            </p>
          </div>

          {/* TIMER CARD */}
          <Card className="p-12 glass text-center relative overflow-hidden">
            
            {/* BACKGROUND ANIMATIONS */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full"
                  animate={{
                    x: [Math.random() * 400, Math.random() * 400],
                    y: [Math.random() * 400, Math.random() * 400],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 10 + Math.random() * 10,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={{
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%'
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">

              {/* BREATHING GUIDE */}
              <AnimatePresence>
                {showBreathing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-background/95 z-20"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ scale: breathPhase === 'in' ? 1.3 : 1 }}
                        transition={{ duration: 4, ease: 'easeInOut' }}
                        className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center"
                      >
                        <div className="text-2xl font-semibold">
                          {breathPhase === 'in' ? 'Inspire' : 'Expire'}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DURATION SELECTOR */}
              {!isRunning && !isCompleted && (
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground mb-4">Escolha a duração:</p>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={duration === 30 ? 'default' : 'outline'}
                      onClick={() => changeDuration(30)}
                      className={duration === 30 ? 'gradient-primary' : ''}
                    >
                      30 minutos
                    </Button>
                    <Button
                      variant={duration === 50 ? 'default' : 'outline'}
                      onClick={() => changeDuration(50)}
                      className={duration === 50 ? 'gradient-primary' : ''}
                    >
                      50 minutos
                    </Button>
                  </div>
                </div>
              )}

              {/* TIMER PROGRESS */}
              <div className="relative w-72 h-72 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="144"
                    cy="144"
                    r="136"
                    className="text-muted"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                  />

                  <circle
                    cx="144"
                    cy="144"
                    r="136"
                    stroke="url(#deepflow-gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 136}`}
                    strokeDashoffset={`${2 * Math.PI * 136 * (1 - progress / 100)}`}
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />

                  <defs>
                    <linearGradient id="deepflow-gradient">
                      <stop offset="0%" stopColor="oklch(0.55 0.20 290)" />
                      <stop offset="100%" stopColor="oklch(0.60 0.22 250)" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
                    <div className="text-sm text-muted-foreground">
                      {isRunning ? 'Estado de Flow' : isCompleted ? 'Concluído!' : 'Pronto'}
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTROLS */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  size="lg"
                  onClick={toggleTimer}
                  className="gradient-accent w-32"
                  disabled={isCompleted}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar
                    </>
                  )}
                </Button>

                <Button size="lg" variant="outline" onClick={resetPageTimer}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reiniciar
                </Button>
              </div>

              {/* AUDIO SETTINGS */}
              <div className="space-y-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Som ativado
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 mr-2" />
                      Som desativado
                    </>
                  )}
                </Button>

                {soundEnabled && (
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                      <Music className="w-4 h-4" />
                      <span>Som Ambiente</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AMBIENT_SOUNDS.map((sound) => (
                        <Button
                          key={sound.id}
                          variant={ambientSound.currentSound === sound.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAmbientSoundChange(sound.id)}
                          className={`text-xs h-auto min-h-[2.5rem] flex flex-col gap-1 py-2 ${
                            ambientSound.currentSound === sound.id ? 'gradient-primary' : ''
                          }`}
                        >
                          <span className="text-base">{sound.icon}</span>
                          <span className="text-[10px] leading-tight text-center">{sound.name}</span>
                        </Button>
                      ))}
                    </div>

                    {ambientSound.currentSound !== 'none' && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block">
                          Volume do som ambiente
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={ambientSound.currentVolume}
                          onChange={handleAmbientVolumeChange}
                          className="w-full h-2 bg-muted rounded-lg"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Volume do som binaural (10Hz)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={binauralAudio.currentVolume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-muted rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* COMPLETION */}
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-lg bg-gradient-to-br from-accent/20 to-chart-2/20 border border-accent/30"
                >
                  <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">DeepFlow Concluído! 🌊</h3>
                  <p className="text-muted-foreground mb-4">
                    Você alcançou o estado de flow profundo
                  </p>

                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-accent font-semibold">+{duration} pontos</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Progresso registrado</span>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          {/* FEATURES */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Card className="p-4 glass text-center">
              <div className="text-2xl mb-2">🎧</div>
              <div className="text-sm font-semibold mb-1">Sons Personalizáveis</div>
              <div className="text-xs text-muted-foreground">8 opções disponíveis</div>
            </Card>

            <Card className="p-4 glass text-center">
              <div className="text-2xl mb-2">🧘</div>
              <div className="text-sm font-semibold mb-1">Respiração Guiada</div>
              <div className="text-xs text-muted-foreground">Primeiros 60s</div>
            </Card>

            <Card className="p-4 glass text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-semibold mb-1">Progresso</div>
              <div className="text-xs text-muted-foreground">Registrado</div>
            </Card>
          </div>

          {/* TIP */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Dica: Use fones de ouvido para melhor experiência com os sons
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
