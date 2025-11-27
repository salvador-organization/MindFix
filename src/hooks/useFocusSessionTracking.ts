import { useEffect, useRef } from "react";
import { useSession } from "./useSession";

interface UseFocusSessionTrackingProps {
  isRunning: boolean;
  timeLeft: number;           // segundos restantes
  totalTime: number;          // segundos totais da sessão
  presetName: string;         // nome da técnica / preset
  presetId: string;           // ID do preset
  onComplete?: () => void;    // função executada quando o timer termina
  onReset?: () => void;       // função executada quando o user reseta o timer
}

export function useFocusSessionTracking({
  isRunning,
  timeLeft,
  totalTime,
  presetName,
  presetId,
  onComplete,
  onReset,
}: UseFocusSessionTrackingProps) {

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
      if (!saveFocusSession) {
        console.error("saveFocusSession não está disponível");
        return;
      }

      const mappedType = mapPresetToType(presetName, presetId);
      console.log('💾 Salvando sessão completa:', {
        presetName,
        presetId,
        mappedType,
        totalTime,
        minutes: totalMinutes
      });

      saveFocusSession({
        type: mappedType,
        duration: totalMinutes,
        completed: true,
        started_at: sessionStartedRef.current.toISOString(),
        completed_at: new Date().toISOString()
      });

      sessionSavedRef.current = true;

      if (onComplete) onComplete();
    }
  }, [timeLeft, isRunning, totalTime, presetName, presetId, saveFocusSession, onComplete]);

  // 🔹 Quando o usuário reseta manualmente
  const handleReset = () => {
    const minutesFocused = sessionStartedRef.current
      ? Math.floor((Date.now() - sessionStartedRef.current.getTime()) / (1000 * 60))
      : 0;

    if (minutesFocused > 0 && sessionStartedRef.current && !sessionSavedRef.current) {
      // Salvar sessão incompleta no Supabase
      if (!saveFocusSession) {
        console.error("saveFocusSession não está disponível");
        return;
      }

      const mappedType = mapPresetToType(presetName, presetId);
      console.log('💾 Salvando sessão incompleta (reset):', {
        presetName,
        presetId,
        mappedType,
        totalTime,
        minutes: minutesFocused
      });

      saveFocusSession({
        type: mappedType,
        duration: minutesFocused,
        completed: false,
        started_at: sessionStartedRef.current.toISOString()
      });

      // marcar como salvo para evitar gravações duplicadas no cleanup
      sessionSavedRef.current = true;
    }

    // Reset refs (não zera sessionSavedRef — deixamos true quando já salvamos)
    sessionStartedRef.current = null;

    if (onReset) onReset();
  };

  // 🔹 Quando o usuário sai da página
  useEffect(() => {
    return () => {
      const minutesFocused = sessionStartedRef.current
        ? Math.floor((Date.now() - sessionStartedRef.current.getTime()) / (1000 * 60))
        : 0;

      if (minutesFocused > 0 && sessionStartedRef.current && !sessionSavedRef.current) {
        // Salvar sessão incompleta no Supabase
        if (!saveFocusSession) {
          console.error("saveFocusSession não está disponível");
          return;
        }

        const mappedType = mapPresetToType(presetName, presetId);
        console.log('💾 Salvando sessão incompleta (cleanup):', {
          presetName,
          presetId,
          mappedType,
          totalTime,
          minutes: minutesFocused
        });

        saveFocusSession({
          type: mappedType,
          duration: minutesFocused,
          completed: false,
          started_at: sessionStartedRef.current.toISOString()
        });

        sessionSavedRef.current = true;
      }
    };
  }, [presetName, presetId, saveFocusSession]);

  return { handleReset };
}

// Helper para mapear nomes de preset para tipos do Supabase
function mapPresetToType(
  presetName: string,
  presetId: string
): 'pomodoro-standard' | 'pomodoro-custom' | 'hyperfocus' | 'deepflow' | 'meditation' | 'breathing' {
  // O hook deve confiar 100% nos valores recebidos do componente
  // Sem buscar presets em outro arquivo, sem tentar adivinhar o tipo, sem sobrescrever nada

  // 1) Detectar custom apenas por presetId (única fonte confiável)
  if (presetId === 'custom') return 'pomodoro-custom';

  // 2) Para outros tipos, usar mapeamento direto baseado no nome
  const name = (presetName || '').toLowerCase().trim();

  const mapping: Record<string, 'hyperfocus' | 'deepflow' | 'meditation' | 'breathing' | 'pomodoro-standard'> = {
    'hyperfocus': 'hyperfocus',
    'hiperfocus mode': 'hyperfocus',
    'deepflow': 'deepflow',
    'deepflow session': 'deepflow',
    'meditação': 'meditation',
    'meditacao': 'meditation',
    'mindfulness': 'meditation',
    'respiração': 'breathing',
    'respiracao': 'breathing'
  };

  // Retornar o tipo mapeado ou pomodoro-standard como padrão
  return mapping[name] || 'pomodoro-standard';
}
