'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Play, Pause, X, Volume2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

// 🔥 IMPORTAÇÃO DO HOOK DE TRACKING
import { useFocusSessionTracking } from '@/hooks/useFocusSessionTracking';

export default function BrownNoisePage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // TOTAL TIME (para o hook)
  const totalTime = selectedTimer ? selectedTimer * 60 : null;

  // 🔥 INTEGRAÇÃO COM HOOK DE TRACKING
  const { handleComplete, handleReset } = useFocusSessionTracking({
    isRunning: isPlaying,
    timeLeft: timeLeft ?? 0,
    totalTime: totalTime ?? 0,
    presetName: "Brown Noise",

    onComplete: () => {
      toast.success('Sessão concluída!');
    },

    onReset: () => {
      toast('Audição encerrada');
    }
  });

  // Cleanup inicial
  useEffect(() => {
    return () => {
      stopNoise();
      if (intervalRef.current) clearInterval(intervalRef.current);
      handleReset(); // 🔥 se sair da página durante reprodução, registrar
    };
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            stopNoise();
            toast.success('Timer concluído!');
            handleComplete(); // 🔥 registra sessão completa
            return null;
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
  }, [timeLeft, isPlaying]);

  // Gerar Brown Noise
  const generateBrownNoise = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    return { audioContext, buffer };
  };

  const playNoise = () => {
    if (!audioContextRef.current) {
      const { audioContext, buffer } = generateBrownNoise();
      audioContextRef.current = audioContext;

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);

      noiseNodeRef.current = source;
      gainNodeRef.current = gainNode;
    }

    setIsPlaying(true);
  };

  const stopNoise = () => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopNoise();
      handleReset(); // 🔥 registrar sessão incompleta
    } else {
      playNoise();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const setTimer = (minutes: number) => {
    setSelectedTimer(minutes);
    setTimeLeft(minutes * 60);
    if (!isPlaying) {
      playNoise();
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
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Brown Noise</h1>
            <p className="text-muted-foreground">
              Som de concentração profunda em loop infinito
            </p>
          </div>

          {/* Player Card */}
          <Card className="p-12 glass text-center">
            {/* Waveform Visualization */}
            <div className="relative w-full h-32 mb-8 flex items-center justify-center gap-1">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={
                    isPlaying
                      ? {
                          height: [
                            Math.random() * 60 + 20,
                            Math.random() * 80 + 40,
                            Math.random() * 60 + 20
                          ]
                        }
                      : { height: 20 }
                  }
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-1 bg-gradient-to-t from-primary to-accent rounded-full"
                />
              ))}
            </div>

            {/* Timer Display */}
            {timeLeft !== null && (
              <div className="text-4xl font-bold mb-6 text-primary">
                {formatTime(timeLeft)}
              </div>
            )}

            {/* Play/Pause Button */}
            <Button
              size="lg"
              onClick={togglePlay}
              className="gradient-primary w-40 h-40 rounded-full mb-8"
            >
              {isPlaying ? (
                <Pause className="w-16 h-16" />
              ) : (
                <Play className="w-16 h-16 ml-2" />
              )}
            </Button>

            {/* Volume Control */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Volume</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full max-w-xs accent-primary"
              />
              <div className="text-sm text-muted-foreground mt-1">
                {Math.round(volume * 100)}%
              </div>
            </div>

            {/* Timer Options */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Timer</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                {[15, 30, 60].map((minutes) => (
                  <Button
                    key={minutes}
                    variant={selectedTimer === minutes ? 'default' : 'outline'}
                    onClick={() => setTimer(minutes)}
                    className={selectedTimer === minutes ? 'gradient-primary' : ''}
                  >
                    {minutes} min
                  </Button>
                ))}
                <Button
                  variant={selectedTimer === null ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedTimer(null);
                    setTimeLeft(null);
                    handleReset();
                  }}
                  className={selectedTimer === null ? 'gradient-primary' : ''}
                >
                  ∞
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="text-sm text-muted-foreground">
              {isPlaying ? (
                <span className="text-primary">● Reproduzindo</span>
              ) : (
                <span>Pausado</span>
              )}
            </div>
          </Card>

          {/* Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Brown noise ajuda a bloquear distrações e manter foco profundo
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
