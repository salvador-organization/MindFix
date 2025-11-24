'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Bell, Coffee, Target, CheckCircle2, Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { addPoints } from '@/lib/points-system';
import { useAmbientSound, type AmbientSoundType } from '@/hooks/useAmbientSound';
import { useFocusSessionTracking } from '@/hooks/useFocusSessionTracking';
import { registerCompletedSession } from '@/lib/focus-storage'; // usaremos para garantir registro único

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

interface PomodoroSettings {
  focusTime: number; // em minutos
  breakTime: number; // em minutos
  cycles: number;
}

interface CycleState {
  currentCycle: number;
  totalCycles: number;
  isBreak: boolean;
  timeRemaining: number; // em segundos
}

export function CustomPomodoro() {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [settings, setSettings] = useState<PomodoroSettings>({
    focusTime: 25,
    breakTime: 5,
    cycles: 4
  });
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);

  const [cycleState, setCycleState] = useState<CycleState>({
    currentCycle: 1,
    totalCycles: 4,
    isBreak: false,
    timeRemaining: 25 * 60
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Usado para garantir que registramos a sessão completa apenas uma vez
  const sessionRegisteredRef = useRef(false);

  // Som ambiente
  const ambientSound = useAmbientSound({
    initialSound: 'none',
    volume: 0.3
  });

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('mindfix_pomodoro_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setTempSettings(parsed);
        setCycleState(prev => ({
          ...prev,
          timeRemaining: parsed.focusTime * 60,
          totalCycles: parsed.cycles,
          currentCycle: 1,
          isBreak: false
        }));
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      }
    } else {
      // inicializa estado com settings atuais
      setCycleState({
        currentCycle: 1,
        totalCycles: settings.cycles,
        isBreak: false,
        timeRemaining: settings.focusTime * 60
      });
    }
  }, []);

  // Atualiza som ambiente conforme estado
  useEffect(() => {
    if (isRunning && !cycleState.isBreak && soundEnabled) {
      if (ambientSound.currentSound !== 'none') {
        ambientSound.play(ambientSound.currentSound);
      }
    } else {
      ambientSound.stop();
    }
  }, [isRunning, cycleState.isBreak, soundEnabled]);

  // Cleanup ao sair do componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ambientSound.stop();
    };
  }, []);

  // -----------------------
  // Helpers para sessão completa (Opção 3)
  // -----------------------
  const PRESET_NAME = 'Pomodoro Personalizado';

  // Total de tempo da sessão completa (inclui todos os breaks)
  const computeTotalSessionSeconds = useCallback(() => {
    return (settings.focusTime + settings.breakTime) * settings.cycles * 60;
  }, [settings]);

  // Tempo restante da sessão completa com base no estado atual do ciclo
  const computeSessionRemainingSeconds = useCallback(() => {
    const focusSec = settings.focusTime * 60;
    const breakSec = settings.breakTime * 60;
    const totalCycles = settings.cycles;
    const curr = cycleState.currentCycle;
    const isBreak = cycleState.isBreak;
    const remainingThisSegment = cycleState.timeRemaining;

    let remaining = 0;

    // For current cycle:
    // if in break -> add remaining break + remaining cycles (focus+break)
    // if in focus -> add remaining focus + that cycle's break + remaining cycles
    if (isBreak) {
      remaining += remainingThisSegment; // remaining of current break
      // add subsequent cycles
      for (let c = curr + 1; c <= totalCycles; c++) {
        remaining += focusSec + breakSec;
      }
    } else {
      // in focus
      remaining += remainingThisSegment; // remaining of current focus
      // add current cycle's break (even if last cycle, we include break as per Option 3)
      remaining += breakSec;
      // add subsequent cycles
      for (let c = curr + 1; c <= totalCycles; c++) {
        remaining += focusSec + breakSec;
      }
    }

    return remaining;
  }, [settings, cycleState]);

  // Guard to avoid duplicate registration + awarding points
  const awardPointsAndRegister = useCallback(() => {
    if (sessionRegisteredRef.current) return;
    sessionRegisteredRef.current = true;

    // award points
    const pointsEarned = addPoints('pomodoro-custom'); // retorna quantidade (assumindo sua implementação)
    toast.success(`🎉 Parabéns! Você completou todos os ciclos e ganhou +${pointsEarned} pontos!`, {
      duration: 5000
    });

    // register completed session in minutes (total session minutes)
    const totalMinutes = Math.floor(computeTotalSessionSeconds() / 60);
    try {
      registerCompletedSession(totalMinutes, PRESET_NAME);
    } catch (e) {
      console.warn('Não foi possível registrar sessão completa:', e);
    }

    // dispatch event for dashboard updates (mantive seu comportamento anterior)
    window.dispatchEvent(new Event('pointsUpdated'));
  }, [computeTotalSessionSeconds]);

  // -----------------------
  // Integração do hook useFocusSessionTracking
  // - Passamos isRunning, timeLeft = sessionRemaining, totalTime = total session seconds
  // - onComplete: quando o hook detectar que sessionRemaining == 0 e isRunning true,
  //   executamos awardPointsAndRegister (proteção para não duplicar)
  // - onReset: quando o usuário der reset manual, chamamos handleLocalReset que NÃO registra sessão completa
  // -----------------------
  const sessionRemaining = computeSessionRemainingSeconds();
  const sessionTotal = computeTotalSessionSeconds();

  const { handleReset: hookHandleReset } = useFocusSessionTracking({
    isRunning,
    timeLeft: sessionRemaining,
    totalTime: sessionTotal,
    presetName: PRESET_NAME,
    onComplete: () => {
      // O hook pode detectar o fim da sessão completa (quando sessionRemaining === 0 enquanto isRunning)
      // Garante que só executamos a rotina uma vez
      awardPointsAndRegister();

      // também para compatibilidade com a lógica local: parar tudo
      setIsRunning(false);
      setCycleState(prev => ({
        ...prev,
        // garante que o UI mostre 0
        timeRemaining: 0
      }));
    },
    onReset: () => {
      // Quando o usuário resetar manualmente, não registramos sessão completa — apenas reset visual/estado.
      // A lógica do hook irá, por padrão, registrar INCOMPLETO se houver minutos focados (comportamento do hook).
      // Como você escolheu Opção C (registrar apenas no final), aqui mantemos a interface limpa.
      // Vamos apenas resetar visualmente.
      sessionRegisteredRef.current = false; // limpamos flag caso o usuário reinicie a sessão
      // NOTE: não chama awardPointsAndRegister aqui.
    }
  });

  // -----------------------
  // Timer principal do componente (controle de segmentos)
  // -----------------------
  useEffect(() => {
    if (isRunning && cycleState.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setCycleState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (isRunning && cycleState.timeRemaining <= 0) {
      // quando o segmento atual zera, tratamos completamento do segmento
      handleSegmentComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, cycleState.timeRemaining]); // note: dependências intencionais

  const handleSegmentComplete = useCallback(() => {
    playNotificationSound();

    // Se estivermos em break
    if (cycleState.isBreak) {
      // Terminou o descanso -> se ainda não terminou todos os ciclos, vai para o próximo foco
      if (cycleState.currentCycle < cycleState.totalCycles) {
        toast.success('Descanso concluído! Hora de focar novamente.', {
          icon: '🎯',
          duration: 5000
        });
        setCycleState(prev => ({
          currentCycle: prev.currentCycle + 1,
          totalCycles: prev.totalCycles,
          isBreak: false,
          timeRemaining: settings.focusTime * 60
        }));
      } else {
        // TODOS os ciclos completos (fim da sessão completa) -> registrar e premiar
        // Garante que não ocorram duplicações
        awardPointsAndRegister();

        // Parar timer e resetar para estado final
        setIsRunning(false);
        setCycleState(prev => ({
          ...prev,
          timeRemaining: 0
        }));
      }
    } else {
      // Terminou o foco, passa para break (mesmo que seja o último ciclo, seguimos Option 3 incluindo break)
      toast.success('Ciclo de foco concluído! Hora de descansar.', {
        icon: '☕',
        duration: 5000
      });
      setCycleState(prev => ({
        ...prev,
        isBreak: true,
        timeRemaining: settings.breakTime * 60
      }));
    }
  }, [cycleState, settings, awardPointsAndRegister]);

  const playNotificationSound = () => {
    try {
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
    } catch (e) {
      console.log('Áudio não disponível:', e);
    }
  };

  // Controls
  const handleStart = () => {
    // garantir que sessionRegisteredRef esteja resetado caso recomece
    sessionRegisteredRef.current = false;
    setIsRunning(true);
    toast.info(cycleState.isBreak ? 'Descanso iniciado' : 'Foco iniciado', {
      icon: cycleState.isBreak ? '☕' : '🎯'
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    toast.info('Timer pausado');
  };

  // Reset local: reseta ciclo e estado. Também chama hookHandleReset para que o hook registre sessão incompleta caso deseje.
  const handleReset = () => {
    setIsRunning(false);
    setCycleState({
      currentCycle: 1,
      totalCycles: settings.cycles,
      isBreak: false,
      timeRemaining: settings.focusTime * 60
    });
    sessionRegisteredRef.current = false;

    // Usar handleReset do hook pra que ele registre INCOMPLETO conforme implementação do hook (se aplicável).
    // Observação: você escolheu Opção C (registrar somente quando todos os ciclos terminarem),
    // => portanto incondicionalmente NÃO chamaremos awardPointsAndRegister aqui.
    try {
      hookHandleReset();
    } catch (e) {
      // caso o hook não exponha handleReset (por segurança)
      console.warn('Hook reset não disponível:', e);
    }

    toast.info('Timer resetado');
  };

  const handleSaveSettings = () => {
    if (tempSettings.focusTime < 1 || tempSettings.breakTime < 1 || tempSettings.cycles < 1) {
      toast.error('Todos os valores devem ser maiores que zero');
      return;
    }

    setSettings(tempSettings);
    localStorage.setItem('mindfix_pomodoro_settings', JSON.stringify(tempSettings));

    setCycleState({
      currentCycle: 1,
      totalCycles: tempSettings.cycles,
      isBreak: false,
      timeRemaining: tempSettings.focusTime * 60
    });

    setIsConfiguring(false);
    setIsRunning(false);
    sessionRegisteredRef.current = false;
    toast.success('Configurações salvas com sucesso!');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = cycleState.isBreak
    ? ((settings.breakTime * 60 - cycleState.timeRemaining) / (settings.breakTime * 60)) * 100
    : ((settings.focusTime * 60 - cycleState.timeRemaining) / (settings.focusTime * 60)) * 100;

  // UI
  return (
    <Card className="p-8 glass relative overflow-hidden">
      {/* Background gradient animado */}
      <div className={`absolute inset-0 opacity-5 transition-all duration-1000 ${
        cycleState.isBreak 
          ? 'bg-gradient-to-br from-green-500 to-blue-500' 
          : 'bg-gradient-to-br from-primary to-accent'
      }`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${cycleState.isBreak ? 'bg-green-500/20' : 'bg-primary/20'}`}>
              {cycleState.isBreak ? (
                <Coffee className="w-6 h-6 text-green-500" />
              ) : (
                <Target className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {cycleState.isBreak ? 'Descanso' : 'Foco'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Ciclo {cycleState.currentCycle} de {cycleState.totalCycles}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsConfiguring(!isConfiguring)}
            disabled={isRunning}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Configurações */}
        <AnimatePresence>
          {isConfiguring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <Card className="p-6 bg-card/50 border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações do Pomodoro
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="focusTime">Tempo de Foco (min)</Label>
                    <Input
                      id="focusTime"
                      type="number"
                      min="1"
                      max="120"
                      value={tempSettings.focusTime}
                      onChange={(e) => setTempSettings({
                        ...tempSettings,
                        focusTime: parseInt(e.target.value) || 1
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="breakTime">Tempo de Descanso (min)</Label>
                    <Input
                      id="breakTime"
                      type="number"
                      min="1"
                      max="60"
                      value={tempSettings.breakTime}
                      onChange={(e) => setTempSettings({
                        ...tempSettings,
                        breakTime: parseInt(e.target.value) || 1
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cycles">Quantidade de Ciclos</Label>
                    <Input
                      id="cycles"
                      type="number"
                      min="1"
                      max="12"
                      value={tempSettings.cycles}
                      onChange={(e) => setTempSettings({
                        ...tempSettings,
                        cycles: parseInt(e.target.value) || 1
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSettings} className="gradient-primary">
                    Salvar Configurações
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setTempSettings(settings);
                    setIsConfiguring(false);
                  }}>
                    Cancelar
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <motion.div
            key={cycleState.timeRemaining}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1 }}
            className="text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            {formatTime(cycleState.timeRemaining)}
          </motion.div>

          {/* Barra de Progresso */}
          <div className="w-full h-3 bg-card/50 rounded-full overflow-hidden mb-6">
            <motion.div
              className={`h-full ${
                cycleState.isBreak 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                  : 'bg-gradient-to-r from-primary to-accent'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Indicadores de Ciclos */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: cycleState.totalCycles }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < cycleState.currentCycle - 1
                    ? 'bg-primary'
                    : i === cycleState.currentCycle - 1
                    ? cycleState.isBreak
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-primary animate-pulse'
                    : 'bg-card/50'
                }`}
              />
            ))}
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {!isRunning ? (
              <Button
                size="lg"
                onClick={handleStart}
                className="gradient-primary px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Iniciar
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handlePause}
                variant="outline"
                className="px-8"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pausar
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleReset}
              variant="outline"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Resetar
            </Button>
          </div>

          {/* Audio Controls */}
          <div className="space-y-4 mb-6">
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

            {/* Ambient Sound Selector */}
            {soundEnabled && !cycleState.isBreak && (
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
                      onClick={() => {
                        ambientSound.changeSound(sound.id);
                        if (isRunning && !cycleState.isBreak && soundEnabled && sound.id !== 'none') {
                          setTimeout(() => ambientSound.play(sound.id), 100);
                        }
                      }}
                      className={`text-xs h-auto min-h-[2.5rem] py-2 px-3 flex flex-col items-center justify-center gap-1 ${ambientSound.currentSound === sound.id ? 'gradient-primary' : ''}`}
                    >
                      <span className="text-base">{sound.icon}</span>
                      <span className="text-[10px] leading-tight text-center">{sound.name}</span>
                    </Button>
                  ))}
                </div>

                {/* Ambient Volume Slider */}
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
                      onChange={(e) => ambientSound.setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sequência de Ciclos */}
        <div className="mt-8 p-4 rounded-lg bg-card/30 border border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Sequência Completa
          </h3>
          <div className="space-y-2">
            {Array.from({ length: settings.cycles }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-2 rounded ${
                  i === cycleState.currentCycle - 1
                    ? 'bg-primary/10 border border-primary/20'
                    : i < cycleState.currentCycle - 1
                    ? 'opacity-50'
                    : ''
                }`}
              >
                {i < cycleState.currentCycle - 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    i === cycleState.currentCycle - 1 ? 'border-primary' : 'border-muted'
                  }`} />
                )}
                <span className="text-sm">
                  Ciclo {i + 1}: {settings.focusTime}min foco + {settings.breakTime}min descanso
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

