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
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);
  const isCleaningRef = useRef(false);

  useEffect(() => {
    // Inicializar AudioContext
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = currentVolume;
    }

    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const cleanup = () => {
    if (isCleaningRef.current) return;
    isCleaningRef.current = true;

    // Limpar todos os intervalos
    intervalRefs.current.forEach(interval => {
      clearTimeout(interval);
      clearInterval(interval);
    });
    intervalRefs.current = [];

    // Limpar osciladores
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignorar erros de cleanup
      }
    });
    oscillatorsRef.current = [];

    // Limpar noise node
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      } catch (e) {
        // Ignorar erros de cleanup
      }
      noiseNodeRef.current = null;
    }

    isCleaningRef.current = false;
  };

  const createWhiteNoise = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

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
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    whiteNoise.connect(filter);
    filter.connect(gainNodeRef.current);
    whiteNoise.start();

    noiseNodeRef.current = whiteNoise;
  };

  const createRainSound = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    // Criar ruído filtrado para simular chuva leve realista
    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Ruído rosa para chuva mais natural
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const rain = audioContextRef.current.createBufferSource();
    rain.buffer = noiseBuffer;
    rain.loop = true;

    // Filtro para simular gotas de chuva leve
    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    const rainGain = audioContextRef.current.createGain();
    rainGain.gain.value = 0.7;

    rain.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(gainNodeRef.current);
    rain.start();

    noiseNodeRef.current = rain;
  };

  const createForestSound = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    // Vento de fundo
    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const wind = audioContextRef.current.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    const windFilter = audioContextRef.current.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400;

    const windGain = audioContextRef.current.createGain();
    windGain.gain.value = 0.3;

    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(gainNodeRef.current);
    wind.start();

    noiseNodeRef.current = wind;

    // Pássaros ocasionais
    const createBirdChirp = () => {
      if (!audioContextRef.current || !gainNodeRef.current || currentSound !== 'forest') return;

      const osc = audioContextRef.current.createOscillator();
      const oscGain = audioContextRef.current.createGain();

      osc.frequency.value = 2000 + Math.random() * 1000;
      osc.type = 'sine';

      oscGain.gain.value = 0;
      oscGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.05);
      oscGain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.2);

      osc.connect(oscGain);
      oscGain.connect(gainNodeRef.current);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 0.2);

      const timeout = setTimeout(createBirdChirp, 3000 + Math.random() * 5000);
      intervalRefs.current.push(timeout);
    };

    createBirdChirp();
  };

  const createOceanWaves = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const oscillators: OscillatorNode[] = [];

    // Onda de fundo
    const wave1 = audioContextRef.current.createOscillator();
    wave1.type = 'sine';
    wave1.frequency.value = 0.2;

    const wave1Gain = audioContextRef.current.createGain();
    wave1Gain.gain.value = 0.5;

    wave1.connect(wave1Gain);
    wave1Gain.connect(gainNodeRef.current);
    wave1.start();
    oscillators.push(wave1);

    // Ruído de água
    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const water = audioContextRef.current.createBufferSource();
    water.buffer = noiseBuffer;
    water.loop = true;

    const waterFilter = audioContextRef.current.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.value = 600;

    const waterGain = audioContextRef.current.createGain();
    waterGain.gain.value = 0.4;

    water.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(gainNodeRef.current);
    water.start();

    noiseNodeRef.current = water;
    oscillatorsRef.current = oscillators;
  };

  const createCafeSound = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    // Murmúrio de fundo (café movimentado) - som mais realista
    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Ruído rosa para vozes humanas
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const chatter = audioContextRef.current.createBufferSource();
    chatter.buffer = noiseBuffer;
    chatter.loop = true;

    // Filtro para simular conversas de café
    const chatterFilter = audioContextRef.current.createBiquadFilter();
    chatterFilter.type = 'bandpass';
    chatterFilter.frequency.value = 1000;
    chatterFilter.Q.value = 1.2;

    const chatterGain = audioContextRef.current.createGain();
    chatterGain.gain.value = 0.6;

    chatter.connect(chatterFilter);
    chatterFilter.connect(chatterGain);
    chatterGain.connect(gainNodeRef.current);
    chatter.start();

    noiseNodeRef.current = chatter;

    // Sons ocasionais de xícaras e pratos
    const createCupSound = () => {
      if (!audioContextRef.current || !gainNodeRef.current || currentSound !== 'busy-cafe') return;

      const osc = audioContextRef.current.createOscillator();
      const oscGain = audioContextRef.current.createGain();

      osc.frequency.value = 800 + Math.random() * 400;
      osc.type = 'triangle';

      oscGain.gain.value = 0;
      oscGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.08, audioContextRef.current.currentTime + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.15);

      osc.connect(oscGain);
      oscGain.connect(gainNodeRef.current);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 0.15);

      const timeout = setTimeout(createCupSound, 4000 + Math.random() * 6000);
      intervalRefs.current.push(timeout);
    };

    createCupSound();
  };

  const createPianoAmbient = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    // Notas de piano ambiente suaves (Dó maior pentatônico)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C, D, E, G, A, C

    const playNote = () => {
      if (!audioContextRef.current || !gainNodeRef.current || currentSound !== 'ambient-piano') return;

      const note = notes[Math.floor(Math.random() * notes.length)];
      const osc = audioContextRef.current.createOscillator();
      const oscGain = audioContextRef.current.createGain();

      osc.frequency.value = note;
      osc.type = 'sine';

      // Envelope suave para piano ambiente
      oscGain.gain.value = 0;
      oscGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.12, audioContextRef.current.currentTime + 0.15);
      oscGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 2.5);

      osc.connect(oscGain);
      oscGain.connect(gainNodeRef.current);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 2.5);

      const timeout = setTimeout(playNote, 2500 + Math.random() * 3500);
      intervalRefs.current.push(timeout);
    };

    playNote();
  };

  const createGentleWind = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const wind = audioContextRef.current.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    const windFilter = audioContextRef.current.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 300;

    const windGain = audioContextRef.current.createGain();
    windGain.gain.value = 0.5;

    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(gainNodeRef.current);
    wind.start();

    noiseNodeRef.current = wind;
  };

  const play = (sound: AmbientSoundType) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    // Limpar completamente antes de tocar novo som
    cleanup();

    if (sound === 'none') {
      setIsPlaying(false);
      setCurrentSound('none');
      return;
    }

    setCurrentSound(sound);

    // Pequeno delay para garantir que cleanup foi concluído
    setTimeout(() => {
      switch (sound) {
        case 'light-rain':
          createRainSound();
          break;
        case 'forest':
          createForestSound();
          break;
        case 'ocean-waves':
          createOceanWaves();
          break;
        case 'busy-cafe':
          createCafeSound();
          break;
        case 'ambient-piano':
          createPianoAmbient();
          break;
        case 'white-noise':
          createWhiteNoise();
          break;
        case 'gentle-wind':
          createGentleWind();
          break;
      }

      setIsPlaying(true);
    }, 50);
  };

  const stop = () => {
    cleanup();
    setIsPlaying(false);
    setCurrentSound('none');
  };

  const setVolume = (newVolume: number) => {
    setCurrentVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const changeSound = (sound: AmbientSoundType) => {
    // Sempre limpar completamente antes de trocar
    cleanup();
    
    setCurrentSound(sound);
    setIsPlaying(false);
    
    if (sound === 'none') {
      return;
    }
    
    // Tocar novo som após cleanup
    setTimeout(() => {
      play(sound);
    }, 100);
  };

  return {
    currentSound,
    isPlaying,
    currentVolume,
    play,
    stop,
    setVolume,
    changeSound
  };
}
