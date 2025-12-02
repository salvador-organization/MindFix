import { useState, useEffect, useRef } from 'react';

export type AmbientSoundType = 
  | 'none'
  | 'light-rain'
  | 'forest'
  | 'ocean-waves'
  | 'busy-cafe'
  | 'ambient-piano'
  | 'white-noise'
  | 'gentle-wind';

interface UseAmbientSoundOptions {
  initialSound?: AmbientSoundType;
  volume?: number;
}

export function useAmbientSound(options: UseAmbientSoundOptions = {}) {
  const { initialSound = 'none', volume = 0.3 } = options;

  const [currentSound, setCurrentSound] = useState<AmbientSoundType>(initialSound);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);

  // Mantém o white-noise WebAudio
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Sons via arquivo MP3
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = currentVolume;
    }

    return () => stop();
  }, []);

  const cleanupWhiteNoise = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      } catch {}
      noiseNodeRef.current = null;
    }
  };

  const cleanupAudioElement = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
      audioElementRef.current = null;
    }
  };

  const createWhiteNoise = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    cleanupWhiteNoise();

    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContextRef.current.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;

    whiteNoise.connect(filter);
    filter.connect(gainNodeRef.current);
    whiteNoise.start();

    noiseNodeRef.current = whiteNoise;
  };

  // Tocar MP3 simples
  const playAudioFile = (path: string) => {
    cleanupAudioElement();
    cleanupWhiteNoise();

    const audio = new Audio(path);
    audio.loop = true;
    audio.volume = currentVolume;
    audio.play();

    audioElementRef.current = audio;
  };

  const play = (sound: AmbientSoundType) => {
    stop();

    if (sound === "none") {
      setCurrentSound("none");
      setIsPlaying(false);
      return;
    }

    setCurrentSound(sound);

    switch (sound) {
      case "white-noise":
        createWhiteNoise();
        break;

      case "light-rain":
        playAudioFile("/sounds/ambient/rain.mp3.m4a");
        break;

      case "forest":
        playAudioFile("/sounds/ambient/forest.mp3.m4a");
        break;

      case "ocean-waves":
        playAudioFile("/sounds/ambient/ocean.mp3.m4a");
        break;

      case "busy-cafe":
        playAudioFile("/sounds/ambient/cafe.mp3.m4a");
        break;

      case "ambient-piano":
        playAudioFile("/sounds/ambient/piano.mp3.m4a");
        break;

      case "gentle-wind":
        playAudioFile("/sounds/ambient/wind.mp3.m4a");
        break;
    }

    setIsPlaying(true);
  };

  const stop = () => {
    cleanupWhiteNoise();
    cleanupAudioElement();
    setIsPlaying(false);
  };

  const setVolume = (newVolume: number) => {
    setCurrentVolume(newVolume);

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }

    if (audioElementRef.current) {
      audioElementRef.current.volume = newVolume;
    }
  };

  const changeSound = (sound: AmbientSoundType) => {
    play(sound);
  };

  return {
    currentSound,
    isPlaying,
    currentVolume,
    play,
    stop,
    setVolume,
    changeSound,
  };
}
