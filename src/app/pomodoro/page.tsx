'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  X,
  CheckCircle2,
  Volume2,
  VolumeX,
  Settings,
  Clock,
  Zap,
  Coffee,
  Music,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  DEFAULT_TIMER_PRESETS,
  ACTIVE_REST_ACTIVITIES,
  type TimerPreset,
} from '@/lib/types';
import { useBinauralAudio } from '@/hooks/useBinauralAudio';
import { useAmbientSound, type AmbientSoundType } from '@/hooks/useAmbientSound';

// Hook de tracking (assume que você criou src/hooks/useFocusSessionTracking.ts)
import { useFocusSessionTracking } from '@/hooks/useFocusSessionTracking';

const AMBIENT_SOUNDS = [
  { id: 'none' as AmbientSoundType, name: 'Nenhum', icon: '🔇' },
  { id: 'light-rain' as AmbientSoundType, name: 'Chuva leve', icon: '🌧️' },
  { id: 'forest' as AmbientSoundType, name: 'Floresta', icon: '🌲' },
  { id: 'ocean-waves' as AmbientSoundType, name: 'Mar/Ondas', icon: '🌊' },
  { id: 'busy-cafe' as AmbientSoundType, name: 'Café movimentado', icon: '☕' },
  { id: 'ambient-piano' as AmbientSoundType, name: 'Piano ambiente', icon: '🎹' },
  { id: 'white-noise' as AmbientSoundType, name: 'White noise', icon: '📻' },
  { id: 'gentle-wind' as AmbientSoundType, name: 'Vento suave', icon: '💨' },
];

export default function PomodoroPage() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(
    DEFAULT_TIMER_PRESETS[0]
  );
  const [customFocusTime, setCustomFocusTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  const [customCycles, setCustomCycles] = useState(4);
  const [showSettings, setShowSettings] = useState(false);

  const [timeLeft, setTimeLeft] = useState(selectedPreset.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showActiveRest, setShowActiveRest] = useState(false);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [showCommitment, setShowCommitment] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar compromisso da Zona de Clareza
  useEffect(() => {
    const savedCommitment = sessionStorage.getItem('mindfix_session_commitment');
    if (savedCommitment) {
      setCommitment(savedCommitment);
      setShowCommitment(true);
      setTimeout(() => setShowCommitment(false), 5000);
      sessionStorage.removeItem('mindfix_session_commitment');
    }
  }, []);

  // Som binaural para concentração leve (14Hz - Beta waves)
  const binauralAudio = useBinauralAudio({
    baseFrequency: 200,
    beatFrequency: 14,
    volume: 0.22,
    fadeInDuration: 2,
    fadeOutDuration: 1.5,
  });

  // Som ambiente
  const ambientSound = useAmbientSound({
    initialSound: 'none',
    volume: 0.3,
  });

  // Controlar áudio baseado no timer
  useEffect(() => {
    if (isRunning && !isBreak && soundEnabled) {
      binauralAudio.play();
      if (ambientSound.currentSound !== 'none') {
        ambientSound.play(ambientSound.currentSound);
      }
    } else {
      binauralAudio.pause();
      ambientSound.stop();
    }
  }, [isRunning, isBreak, soundEnabled]);

  // Hook reutilizável que registra sessões (comporta onComplete e onReset)
  const { handleReset, handleComplete } = useFocusSessionTracking({
    isRunning,
    timeLeft,
    totalTime: selectedPreset.focusTime * 60,
    presetName: selectedPreset.name,

    onComplete: () => {
      // Esta função é chamada pelo hook quando a sessão foi registrada como completa
      // Aqui ainda fazemos o que o UI precisa: som, toast, ciclos
      if (soundEnabled) playCompletionSound();

      toast.success(`Sessão de foco concluída! +${selectedPreset.focusTime} minutos registrados`);

      if (currentCycle < selectedPreset.cycles) {
        setIsBreak(true);
        setTimeLeft(selectedPreset.breakTime * 60);
        setShowActiveRest(true);
      } else {
        setIsCompleted(true);
      }
    },

    onReset: () => {
      // Chamado quando o usuário solicita reset (hook já registrou sessão incompleta se houver)
      toast('Sessão cancelada');
      setIsRunning(false);
      setIsBreak(false);
      setCurrentCycle(1);
      setTimeLeft(selectedPreset.focusTime * 60);
      setIsCompleted(false);
      setShowActiveRest(false);
    },
  });

  // Cleanup ao sair da página (a maior parte do registro é feito pelo hook em onunmount dele)
  useEffect(() => {
    return () => {
      binauralAudio.pause();
      ambientSound.stop();
    };
  }, []);

  // Contagem regressiva (chama handleComplete quando chega a zero)
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
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Substituímos resetTimer por handleReset fornecido pelo hook (o hook já registra sessão incompleta quando aplicável)

  const applyPreset = (preset: TimerPreset) => {
    setSelectedPreset(preset);
    setTimeLeft(preset.focusTime * 60);
    setIsRunning(false);
    setIsBreak(false);
    setCurrentCycle(1);
    setIsCompleted(false);
    toast.success(`Preset "${preset.name}" aplicado`);
  };

  const applyCustomPreset = () => {
    const customPreset: TimerPreset = {
      id: 'custom',
      name: 'Personalizado',
      focusTime: customFocusTime,
      breakTime: customBreakTime,
      cycles: customCycles,
      isCustom: true,
    };
    applyPreset(customPreset);
    setShowSettings(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    binauralAudio.setVolume(newVolume);
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    ambientSound.setVolume(newVolume);
  };

  const handleAmbientSoundChange = (soundId: AmbientSoundType) => {
    ambientSound.changeSound(soundId);
    if (isRunning && !isBreak && soundEnabled && soundId !== 'none') {
      setTimeout(() => ambientSound.play(soundId), 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const totalTime = isBreak
    ? selectedPreset.breakTime * 60
    : selectedPreset.focusTime * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-5 h-5" />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {isBreak ? 'Descanso Ativo' : 'Pomodoro MindFix'}
            </h1>
            <p className="text-muted-foreground">
              {isBreak
                ? 'Relaxe e recarregue suas energias'
                : `Sessão de foco intenso - Ciclo ${currentCycle} de ${selectedPreset.cycles}`}
            </p>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Card className="p-6 glass">
                  <h2 className="text-xl font-bold mb-4">Configurações do Timer</h2>

                  {/* Presets */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3">Presets Rápidos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DEFAULT_TIMER_PRESETS.map((preset) => (
                        <Button
                          key={preset.id}
                          variant={selectedPreset.id === preset.id ? 'default' : 'outline'}
                          className={selectedPreset.id === preset.id ? 'gradient-primary' : ''}
                          onClick={() => applyPreset(preset)}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Personalizar</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Tempo de Foco (min)</label>
                        <Input
                          type="number"
                          value={customFocusTime}
                          onChange={(e) => setCustomFocusTime(Number(e.target.value))}
                          min={1}
                          max={120}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Tempo de Descanso (min)</label>
                        <Input
                          type="number"
                          value={customBreakTime}
                          onChange={(e) => setCustomBreakTime(Number(e.target.value))}
                          min={1}
                          max={30}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Número de Ciclos</label>
                        <Input
                          type="number"
                          value={customCycles}
                          onChange={(e) => setCustomCycles(Number(e.target.value))}
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>
                    <Button className="w-full gradient-primary" onClick={applyCustomPreset}>
                      Aplicar Configuração Personalizada
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer Card */}
          <Card className="p-12 glass text-center mb-8">
            {/* Progress Circle */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 120}`} strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`} className={`${isBreak ? 'text-accent' : 'text-primary'} transition-all duration-1000`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    {isBreak ? (
                      <>
                        <Coffee className="w-4 h-4" />
                        Descanso
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        {isRunning ? 'Focando...' : isCompleted ? 'Concluído!' : 'Pronto'}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button size="lg" onClick={toggleTimer} className="gradient-primary w-32" disabled={isCompleted}>
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
              <Button size="lg" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Reiniciar
              </Button>
            </div>

            {/* Audio Controls */}
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

              {/* Ambient Sound Selector */}
              {soundEnabled && !isBreak && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Music className="w-4 h-4" />
                    <span>Som Ambiente</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AMBIENT_SOUNDS.map((sound) => (
                      <Button key={sound.id} variant={ambientSound.currentSound === sound.id ? 'default' : 'outline'} size="sm" onClick={() => handleAmbientSoundChange(sound.id)} className={`text-xs h-auto min-h-[2.5rem] py-2 px-3 flex flex-col items-center justify-center gap-1 ${ambientSound.currentSound === sound.id ? 'gradient-primary' : ''}`}>
                        <span className="text-base">{sound.icon}</span>
                        <span className="text-[10px] leading-tight text-center">{sound.name}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Ambient Volume Slider */}
                  {ambientSound.currentSound !== 'none' && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Volume do som ambiente</label>
                      <input type="range" min="0" max="1" step="0.01" value={ambientSound.currentVolume} onChange={handleAmbientVolumeChange} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
                    </div>
                  )}

                  {/* Binaural Volume Slider */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Volume do som binaural (14Hz)</label>
                    <input type="range" min="0" max="1" step="0.01" value={binauralAudio.currentVolume} onChange={handleVolumeChange} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              )}
            </div>

            {/* Completion Message */}
            {isCompleted && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-lg bg-primary/10 border border-primary/20">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Todos os Ciclos Concluídos! 🎉</h3>
                <p className="text-muted-foreground mb-4">Você completou {selectedPreset.cycles} ciclos de foco intenso</p>
                <div className="flex items-center justify-center gap-2 text-sm mb-4">
                  <span className="text-primary font-semibold">+{selectedPreset.cycles * selectedPreset.focusTime} minutos de foco</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-primary font-semibold">+{selectedPreset.cycles * 25} pontos</span>
                </div>
                <Button className="gradient-primary" onClick={handleReset}>Iniciar Nova Sessão</Button>
              </motion.div>
            )}
          </Card>

          {/* Active Rest Suggestions */}
          <AnimatePresence>
            {showActiveRest && isBreak && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="p-6 glass">
                  <h3 className="text-xl font-bold mb-4">Sugestões de Descanso Ativo</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {ACTIVE_REST_ACTIVITIES.slice(0, 2).map((activity) => (
                      <div key={activity.id} className="p-4 rounded-lg bg-card/50 border border-border">
                        <h4 className="font-semibold mb-2">{activity.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{activity.instructions[0]}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3 h-3" /><span>{activity.duration}s</span></div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">💡 Dica: {isBreak ? 'Use o descanso para alongar, hidratar ou respirar profundamente' : 'Escolha um som ambiente para melhorar sua concentração'}</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
