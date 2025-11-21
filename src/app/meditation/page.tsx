'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, Pause, X, CheckCircle2, Volume2, VolumeX, Music } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

import { useBinauralAudio } from '@/hooks/useBinauralAudio';
import { useAmbientSound, type AmbientSoundType } from '@/hooks/useAmbientSound';
import { useFocusSessionTracking } from '@/hooks/useFocusSessionTracking';

const phases = [
  { duration: 30, text: 'Prepare-se, respire fundo...', instruction: 'Encontre uma posição confortável' },
  { duration: 180, text: 'Body Scan', instruction: 'Escaneie seu corpo dos pés até a cabeça' },
  { duration: 90, text: 'Respiração Consciente', instruction: 'Observe sua respiração natural' }
];

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

export default function MeditationPage() {
  const router = useRouter();

  // 5 minutos padrão
  const TOTAL_TIME = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [breathScale, setBreathScale] = useState(1);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Som binaural relaxante
  const binauralAudio = useBinauralAudio({
    baseFrequency: 200,
    beatFrequency: 7,
    volume: 0.2,
    fadeInDuration: 3,
    fadeOutDuration: 2
  });

  // Som ambiente
  const ambientSound = useAmbientSound({
    initialSound: 'none',
    volume: 0.3
  });

  // ---------------------------------------------------------
  // 🔥 INTEGRAÇÃO DO HOOK useFocusSessionTracking
  // ---------------------------------------------------------
  const { handleReset } = useFocusSessionTracking({
    isRunning,
    timeLeft,
    totalTime: TOTAL_TIME,
    presetName: "Meditation",

    onComplete: () => {
      // continua usando seu sistema original de conclusão
      finalizeMeditation();
    },

    onReset: () => {
      // reset visual e funcional
      setIsRunning(false);
      setIsCompleted(false);
      setTimeLeft(TOTAL_TIME);
    }
  });
  // ---------------------------------------------------------

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

  // Cleanup de áudio ao sair da página
  useEffect(() => {
    return () => {
      binauralAudio.pause();
      ambientSound.stop();
    };
  }, []);

  // Animação de respiração
  useEffect(() => {
    if (isRunning) {
      breathIntervalRef.current = setInterval(() => {
        setBreathScale(prev => (prev === 1 ? 1.3 : 1));
      }, 4000);
    } else {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      setBreathScale(1);
    }

    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [isRunning]);

  // Timer principal
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Em vez de chamar finalizeMeditation direto,
            // quem chama agora é o hook via onComplete
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  // Fases dinâmicas da meditação
  useEffect(() => {
    const elapsed = TOTAL_TIME - timeLeft;

    if (elapsed < phases[0].duration) setCurrentPhase(0);
    else if (elapsed < phases[0].duration + phases[1].duration) setCurrentPhase(1);
    else setCurrentPhase(2);
  }, [timeLeft]);

  // Função original de conclusão preservada
  const finalizeMeditation = () => {
    setIsRunning(false);
    setIsCompleted(true);

    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 528;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    }

    toast.success('Meditação concluída! +20 pontos');
  };

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const handleManualReset = () => {
    handleReset(); 
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            <Button variant="ghost" size="icon" onClick={() => { handleManualReset(); router.push('/dashboard'); }}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Meditação Rápida</h1>
            <p className="text-muted-foreground">Body Scan + Respiração Consciente (5 min)</p>
          </div>

          {/* Card */}
          <Card className="p-12 glass text-center">

            {/* Breathing Animation */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <motion.div
                animate={{ scale: breathScale }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{formatTime(timeLeft)}</div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-muted-foreground"
                    >
                      {isRunning ? (breathScale > 1 ? 'Inspire...' : 'Expire...') : 'Pronto'}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Phase */}
            {isRunning && !isCompleted && (
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h3 className="text-xl font-semibold mb-2">{phases[currentPhase].text}</h3>
                <p className="text-muted-foreground">{phases[currentPhase].instruction}</p>
              </motion.div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="gradient-primary w-32"
                disabled={isCompleted}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" /> Iniciar
                  </>
                )}
              </Button>
            </div>

            {/* Audio Settings */}
            <div className="space-y-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" /> Som ativado
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" /> Som desativado
                  </>
                )}
              </Button>

              {soundEnabled && (
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Ambient Selector */}
                  <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Music className="w-4 h-4" />
                    <span>Som Ambiente</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AMBIENT_SOUNDS.map(sound => (
                      <Button
                        key={sound.id}
                        variant={ambientSound.currentSound === sound.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAmbientSoundChange(sound.id)}
                        className={`text-xs h-auto min-height-[2.5rem] py-2 px-3 flex flex-col items-center justify-center gap-1 ${
                          ambientSound.currentSound === sound.id ? 'gradient-primary' : ''
                        }`}
                      >
                        <span className="text-base">{sound.icon}</span>
                        <span className="text-[10px] leading-tight text-center">{sound.name}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Ambient Volume */}
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
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Binaural Volume */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Volume do som binaural (7Hz)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={binauralAudio.currentVolume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Completion */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-lg bg-primary/10 border border-primary/20"
              >
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Meditação Concluída! 🧘</h3>
                <p className="text-muted-foreground mb-4">Você completou sua sessão de meditação</p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-primary font-semibold">+20 pontos</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Sessão registrada</span>
                </div>
              </motion.div>
            )}
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Dica: Escolha um som ambiente relaxante para aprofundar sua meditação
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

