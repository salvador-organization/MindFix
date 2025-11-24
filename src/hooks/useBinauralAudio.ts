'use client';

import { useEffect, useRef, useState } from 'react';

interface BinauralAudioOptions {
  baseFrequency: number; // Frequência base em Hz
  beatFrequency: number; // Diferença para criar o efeito binaural
  volume?: number; // Volume inicial (0-1)
  fadeInDuration?: number; // Duração do fade-in em segundos
  fadeOutDuration?: number; // Duração do fade-out em segundos
}

export function useBinauralAudio({
  baseFrequency,
  beatFrequency,
  volume = 0.3,
  fadeInDuration = 2,
  fadeOutDuration = 1.5
}: BinauralAudioOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);

  // Inicializar áudio
  const initAudio = () => {
    if (audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // Criar nós de áudio
      const leftOscillator = audioContextRef.current.createOscillator();
      const rightOscillator = audioContextRef.current.createOscillator();
      const leftGain = audioContextRef.current.createGain();
      const rightGain = audioContextRef.current.createGain();
      const merger = audioContextRef.current.createChannelMerger(2);
      const masterGain = audioContextRef.current.createGain();

      // Configurar osciladores
      leftOscillator.type = 'sine';
      rightOscillator.type = 'sine';
      leftOscillator.frequency.value = baseFrequency;
      rightOscillator.frequency.value = baseFrequency + beatFrequency;

      // Conectar nós
      leftOscillator.connect(leftGain);
      rightOscillator.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);
      merger.connect(masterGain);
      masterGain.connect(audioContextRef.current.destination);

      // Configurar ganhos iniciais
      leftGain.gain.value = 0.5;
      rightGain.gain.value = 0.5;
      masterGain.gain.value = 0;

      // Salvar referências
      leftOscillatorRef.current = leftOscillator;
      rightOscillatorRef.current = rightOscillator;
      leftGainRef.current = leftGain;
      rightGainRef.current = rightGain;
      mergerRef.current = merger;
      masterGainRef.current = masterGain;

      // Iniciar osciladores
      leftOscillator.start();
      rightOscillator.start();
    } catch (error) {
      console.error('Erro ao inicializar áudio binaural:', error);
    }
  };

  // Play com fade-in
  const play = () => {
    if (!audioContextRef.current || !masterGainRef.current) {
      initAudio();
    }

    if (audioContextRef.current && masterGainRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      const gain = masterGainRef.current.gain;

      // Fade-in suave
      gain.cancelScheduledValues(currentTime);
      gain.setValueAtTime(gain.value, currentTime);
      gain.linearRampToValueAtTime(currentVolume, currentTime + fadeInDuration);

      setIsPlaying(true);
    }
  };

  // Pause com fade-out
  const pause = () => {
    if (audioContextRef.current && masterGainRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      const gain = masterGainRef.current.gain;

      // Fade-out suave
      gain.cancelScheduledValues(currentTime);
      gain.setValueAtTime(gain.value, currentTime);
      gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

      setTimeout(() => {
        setIsPlaying(false);
      }, fadeOutDuration * 1000);
    }
  };

  // Ajustar volume
  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setCurrentVolume(clampedVolume);

    if (audioContextRef.current && masterGainRef.current && isPlaying) {
      const currentTime = audioContextRef.current.currentTime;
      const gain = masterGainRef.current.gain;
      
      gain.cancelScheduledValues(currentTime);
      gain.setValueAtTime(gain.value, currentTime);
      gain.linearRampToValueAtTime(clampedVolume, currentTime + 0.1);
    }
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        if (leftOscillatorRef.current) {
          leftOscillatorRef.current.stop();
          leftOscillatorRef.current.disconnect();
        }
        if (rightOscillatorRef.current) {
          rightOscillatorRef.current.stop();
          rightOscillatorRef.current.disconnect();
        }
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Auto-play e auto-pause baseado em isPlaying
  useEffect(() => {
    if (isPlaying) {
      play();
    } else {
      pause();
    }
  }, []);

  return {
    play,
    pause,
    setVolume,
    isPlaying,
    currentVolume
  };
}
