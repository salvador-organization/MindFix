'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, X, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export default function BrownNoisePage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [duration, setDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      stopNoise();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (duration && timeLeft !== null && timeLeft > 0 && isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            stopNoise();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, timeLeft, isPlaying]);

  const generateBrownNoise = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    return buffer;
  };

  const startNoise = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;

    // Create nodes
    noiseNodeRef.current = ctx.createBufferSource();
    gainNodeRef.current = ctx.createGain();

    // Generate and set buffer
    noiseNodeRef.current.buffer = generateBrownNoise();
    noiseNodeRef.current.loop = true;

    // Set volume
    gainNodeRef.current.gain.value = volume[0] / 100;

    // Connect nodes
    noiseNodeRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(ctx.destination);

    // Start
    noiseNodeRef.current.start();
    setIsPlaying(true);
  };

  const stopNoise = () => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopNoise();
    } else {
      startNoise();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = value[0] / 100;
    }
  };

  const setTimer = (minutes: number) => {
    setDuration(minutes);
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Brown Noise</h1>
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Visualizer */}
          <div className="relative mb-12 h-64 flex items-center justify-center">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 mx-1 bg-gradient-to-t from-primary to-accent rounded-full"
                animate={
                  isPlaying
                    ? {
                        height: [
                          Math.random() * 100 + 50,
                          Math.random() * 150 + 50,
                          Math.random() * 100 + 50,
                        ],
                      }
                    : { height: 20 }
                }
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Timer Display */}
          {timeLeft !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <p className="text-5xl font-bold">{formatTime(timeLeft)}</p>
              <p className="text-sm text-muted-foreground mt-2">Tempo restante</p>
            </motion.div>
          )}

          {/* Play/Pause Button */}
          <div className="flex items-center justify-center mb-12">
            <Button
              size="icon"
              className="w-24 h-24 rounded-full gradient-primary"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-10 h-10" />
              ) : (
                <Play className="w-10 h-10 ml-1" />
              )}
            </Button>
          </div>

          {/* Volume Control */}
          <Card className="p-6 glass mb-8">
            <div className="flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm font-semibold w-12 text-right">{volume[0]}%</span>
            </div>
          </Card>

          {/* Timer Presets */}
          <Card className="p-6 glass mb-8">
            <h3 className="font-semibold mb-4">Definir Timer</h3>
            <div className="grid grid-cols-4 gap-3">
              {[15, 30, 45, 60].map((mins) => (
                <Button
                  key={mins}
                  variant={duration === mins ? 'default' : 'outline'}
                  onClick={() => setTimer(mins)}
                  className={duration === mins ? 'gradient-primary' : ''}
                >
                  {mins}m
                </Button>
              ))}
            </div>
            {duration && (
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => {
                  setDuration(null);
                  setTimeLeft(null);
                }}
              >
                Remover Timer
              </Button>
            )}
          </Card>

          {/* Info */}
          <Card className="p-6 glass">
            <h3 className="font-semibold mb-3">🎧 Sobre o Brown Noise</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O Brown Noise é um som de baixa frequência que ajuda a bloquear distrações
              externas e promove concentração profunda. É especialmente eficaz para pessoas
              com TDAH.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Melhora o foco e concentração</p>
              <p>✓ Reduz ansiedade e estresse</p>
              <p>✓ Bloqueia ruídos externos</p>
              <p>✓ Promove estado de flow</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
