<<<<<<< HEAD
import { useEffect, useRef } from "react";
import { useSession } from "./useSession";
=======
import { useEffect } from "react";
import { 
  registerCompletedSession, 
  registerIncompleteSession 
} from "@/lib/focus-storage";
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4

interface UseFocusSessionTrackingProps {
  isRunning: boolean;
  timeLeft: number;           // segundos restantes
  totalTime: number;          // segundos totais da sessão
  presetName: string;         // nome da técnica / preset
  onComplete?: () => void;    // função executada quando o timer termina
  onReset?: () => void;       // função executada quando o user reseta o timer
}

export function useFocusSessionTracking({
  isRunning,
  timeLeft,
  totalTime,
  presetName,
  onComplete,
  onReset,
}: UseFocusSessionTrackingProps) {
<<<<<<< HEAD

  const { saveFocusSession } = useSession();
  const sessionStartedRef = useRef<Date | null>(null);
  const sessionSavedRef = useRef(false);

  // Inicia o tracking quando começa a sessão
  useEffect(() => {
    if (isRunning && !sessionStartedRef.current) {
      sessionStartedRef.current = new Date();
      sessionSavedRef.current = false;
    }
  }, [isRunning]);

  // 🔹 Detecta quando a sessão terminou
  useEffect(() => {
    if (timeLeft === 0 && isRunning && sessionStartedRef.current && !sessionSavedRef.current) {
      const totalMinutes = Math.round(totalTime / 60);

      // Salvar no Supabase
      saveFocusSession({
        type: mapPresetToType(presetName),
        duration: totalMinutes,
        completed: true,
        started_at: sessionStartedRef.current.toISOString(),
        completed_at: new Date().toISOString()
      });

      sessionSavedRef.current = true;

      if (onComplete) onComplete();
    }
  }, [timeLeft, isRunning, totalTime, presetName, saveFocusSession, onComplete]);

  // 🔹 Quando o usuário reseta manualmente
  const handleReset = () => {
    const minutesFocused = sessionStartedRef.current
      ? Math.floor((Date.now() - sessionStartedRef.current.getTime()) / (1000 * 60))
      : 0;

    if (minutesFocused > 0 && sessionStartedRef.current && !sessionSavedRef.current) {
      // Salvar sessão incompleta no Supabase
      saveFocusSession({
        type: mapPresetToType(presetName),
        duration: minutesFocused,
        completed: false,
        started_at: sessionStartedRef.current.toISOString()
      });

      sessionSavedRef.current = true;
    }

    // Reset refs
    sessionStartedRef.current = null;
    sessionSavedRef.current = false;

=======
  
  // 🔹 Detecta quando a sessão terminou
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      const totalMinutes = totalTime / 60;
      registerCompletedSession(totalMinutes, presetName);

      if (onComplete) onComplete();
    }
  }, [timeLeft, isRunning]);

  // 🔹 Quando o usuário reseta manualmente
  const handleReset = () => {
    const minutesFocused = Math.floor((totalTime - timeLeft) / 60);

    if (minutesFocused > 0) {
      registerIncompleteSession(minutesFocused, presetName);
    }

>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
    if (onReset) onReset();
  };

  // 🔹 Quando o usuário sai da página
  useEffect(() => {
    return () => {
<<<<<<< HEAD
      const minutesFocused = sessionStartedRef.current
        ? Math.floor((Date.now() - sessionStartedRef.current.getTime()) / (1000 * 60))
        : 0;

      if (minutesFocused > 0 && sessionStartedRef.current && !sessionSavedRef.current) {
        // Salvar sessão incompleta no Supabase
        saveFocusSession({
          type: mapPresetToType(presetName),
          duration: minutesFocused,
          completed: false,
          started_at: sessionStartedRef.current.toISOString()
        });

        sessionSavedRef.current = true;
      }
    };
  }, [presetName, saveFocusSession]);

  return { handleReset };
}

// Helper para mapear nomes de preset para tipos do Supabase
function mapPresetToType(presetName: string): 'pomodoro' | 'hyperfocus' | 'deepflow' | 'meditation' | 'breathing' {
  const mapping: Record<string, 'pomodoro' | 'hyperfocus' | 'deepflow' | 'meditation' | 'breathing'> = {
    'Pomodoro': 'pomodoro',
    'Pomodoro Clássico': 'pomodoro',
    'HyperFocus': 'hyperfocus',
    'HiperFocus Mode': 'hyperfocus',
    'DeepFlow': 'deepflow',
    'DeepFlow Session': 'deepflow',
    'Meditação': 'meditation',
    'Mindfulness': 'meditation',
    'Respiração': 'breathing'
  };

  return mapping[presetName] || 'pomodoro';
}
=======
      const minutesFocused = Math.floor((totalTime - timeLeft) / 60);

      if (minutesFocused > 0) {
        registerIncompleteSession(minutesFocused, presetName);
      }
    };
  }, []);

  return { handleReset };
}
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
