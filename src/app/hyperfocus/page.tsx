'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Play, Pause, RotateCcw, X, 
  CheckCircle2, Volume2, VolumeX, 
  Maximize2, Music 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useBinauralAudio } from '@/hooks/useBinauralAudio';
import { useAmbientSound, type AmbientSoundType } from '@/hooks/useAmbientSound';

// 🔹 IMPORT DO HOOK DE TRACKING
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

export default function HyperFocusPage() {
  const router = useRouter();
  const TOTAL_TIME = 50 * 60;

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔹 Som binaural (40Hz)
  const binauralAudio = useBinauralAudio({
    baseFrequency: 200,
    beatFrequency: 40,
    volume: 0.25,
    fadeInDuration: 2,
    fadeOutDuration: 1.5
  });

  // 🔹 Som ambiente
  const ambientSound = useAmbientSound({
    initialSound: 'none',
    volume: 0.3
  });

  // 🔹 INTEGRAÇÃO DO HOOK USEFOCUSSESSIONTRACKING
  const { handleReset } = useFocusSessionTracking({
    isRunning,
    timeLeft,
    totalTime: TOTAL_TIME,
    presetName: "DeepFlow",

    onComplete: () => {
      handleComplete();
    },

    onReset: () => {
      // Mantém tudo que já existia no reset original
      setIsRunning(false);
      setTimeLeft(TOTAL_TIME);
      setIsCompleted(false);
    }
  });

  // 🔊 Controle do áudio
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

  // Cleanup ao sair
  useEffect(() => {
    return () => {
      binauralAudio.pause();
      ambientSound.stop();
    };
  }, []);

  // Timer ticking
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  // 🔹 Quando finalizar a sessão
  const handleComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);

    // beep curto
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.7);
    }

    toast.success('HyperFocus concluído! +50 pontos e 50 minutos de foco registrados');
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  // 🔹 RESET — AGORA USANDO HANDLE RESET DO HOOK
  const resetTimer = () => {
    handleReset();
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

  const progress = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

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

      {/* Main */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">HyperFocus Mode</h1>
            <p className="text-muted-foreground">
              Sessão avançada de foco intenso (50 min)
            </p>
          </div>

          {/* Card */}
          <Card className="p-12 glass text-center">

            {/* Progress Circle */}
            <div className="relative w-72 h-72 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="144"
                  cy="144"
                  r="136"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="144"
                  cy="144"
                  r="136"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 136}`}
                  strokeDashoffset={`${2 * Math.PI * 136 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.65 0.25 280)" />
                    <stop offset="100%" stopColor="oklch(0.55 0.20 290)" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-7xl font-bold mb-2">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-muted-foreground">
                    {isRunning ? 'Modo HyperFocus ativo' : isCompleted ? 'Concluído!' : 'Pronto para começar'}
                  </div>

                  {isRunning && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mt-4 text-xs text-primary"
                    >
                      ⚡ Foco máximo + 40Hz binaural
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

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

              <Button size="lg" variant="outline" onClick={resetTimer}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Reiniciar
              </Button>
            </div>

            {/* Audio Controls */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
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

                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  {isFullscreen ? 'Sair tela cheia' : 'Tela cheia'}
                </Button>
              </div>

              {soundEnabled && (
                <div className="max-w-2xl mx-auto space-y-4">

                  <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Music className="w-4 h-4" />
                    <span>Som Ambiente</span>
                  </div>

                  {/* Ambient options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AMBIENT_SOUNDS.map((sound) => (
                      <Button
                        key={sound.id}
                        variant={ambientSound.currentSound === sound.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAmbientSoundChange(sound.id)}
                        className={`text-xs h-auto min-h-[2.5rem] py-2 px-3 flex flex-col items-center justify-center gap-1 ${
                          ambientSound.currentSound === sound.id ? 'gradient-primary' : ''
                        }`}
                      >
                        <span className="text-base">{sound.icon}</span>
                        <span className="text-[10px] leading-tight text-center">{sound.name}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Ambient volume */}
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

                  {/* Binaural volume */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Volume do som binaural (40Hz)
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

            {/* Completion box */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
              >
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">HyperFocus Concluído! 🚀</h3>

                <p className="text-muted-foreground mb-4">
                  Você completou 50 minutos de foco intenso
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <div className="text-2xl font-bold text-primary">+50</div>
                    <div className="text-xs text-muted-foreground">Pontos</div>
                  </div>

                  <div className="p-3 rounded-lg bg-background/50">
                    <div className="text-2xl font-bold text-accent">50min</div>
                    <div className="text-xs text-muted-foreground">Foco Total</div>
                  </div>
                </div>

                <Button onClick={() => router.push('/dashboard')} className="w-full gradient-primary">
                  Ver Progresso
                </Button>
              </motion.div>
            )}
          </Card>

          {/* Feature Cards */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Card className="p-4 glass text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-semibold mb-1">Foco Intenso</div>
              <div className="text-xs text-muted-foreground">40Hz Gamma waves</div>
            </Card>
            <Card className="p-4 glass text-center">
              <div className="text-2xl mb-2">🎧</div>
              <div className="text-sm font-semibold mb-1">Sons Personalizáveis</div>
              <div className="text-xs text-muted-foreground">8 opções disponíveis</div>
            </Card>
            <Card className="p-4 glass text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-semibold mb-1">Progresso</div>
              <div className="text-xs text-muted-foreground">Registrado</div>
            </Card>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
