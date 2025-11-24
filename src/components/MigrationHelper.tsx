'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { migrateLocalDataToSupabase } from '@/lib/local-auth';

export function MigrationHelper() {
  const { user } = useUser();
  const { saveFocusSession } = useSession();

  useEffect(() => {
    if (user?.id) {
      // Verificar se já existe progresso no Supabase
      checkAndMigrateData();
    }
  }, [user?.id]);

  const checkAndMigrateData = async () => {
    if (!user?.id) return;

    try {
      // Verificar se já existe progresso
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Se não existe progresso, tentar migrar dados locais
      if (!existingProgress) {
        console.log('🔄 Iniciando migração automática de dados locais...');
        await migrateLocalDataToSupabase();

        // Migrar sessões de foco salvas localmente
        await migrateFocusSessions();
      }
    } catch (error) {
      console.error('Erro durante verificação de migração:', error);
    }
  };

  const migrateFocusSessions = async () => {
    try {
      const focusSessionsData = localStorage.getItem('focus-sessions');
      if (!focusSessionsData) return;

      const sessions = JSON.parse(focusSessionsData);
      console.log(`📊 Migrando ${sessions.length} sessões de foco...`);

      for (const session of sessions) {
        await saveFocusSession({
          type: session.type || 'pomodoro',
          duration: session.duration || 0,
          completed: session.completed || false,
          started_at: session.startTime || new Date().toISOString(),
          completed_at: session.completed ? new Date().toISOString() : undefined,
          points_earned: session.points || 0
        });
      }

      console.log('✅ Sessões migradas com sucesso');
    } catch (error) {
      console.error('Erro ao migrar sessões:', error);
    }
  };

  // Componente invisível - apenas executa lógica de migração
  return null;
}
