import { useEffect } from "react";
import { 
  registerCompletedSession, 
  registerIncompleteSession 
} from "@/lib/focus-storage";

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

    if (onReset) onReset();
  };

  // 🔹 Quando o usuário sai da página
  useEffect(() => {
    return () => {
      const minutesFocused = Math.floor((totalTime - timeLeft) / 60);

      if (minutesFocused > 0) {
        registerIncompleteSession(minutesFocused, presetName);
      }
    };
  }, []);

  return { handleReset };
}
