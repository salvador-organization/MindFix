'use client';

import { useState } from 'react';
import { Play, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StartFocusButtonProps {
  commitment?: string;
  onStart?: () => void;
}

export function StartFocusButton({ commitment, onStart }: StartFocusButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleStartFocus = (mode: 'pomodoro' | 'hyperfocus' | 'deepflow') => {
    // Salvar compromisso na sessão
    if (commitment) {
      sessionStorage.setItem('mindfix_session_commitment', commitment);
    }

    // Salvar timestamp de início
    sessionStorage.setItem('mindfix_session_start', new Date().toISOString());

    // Callback opcional
    if (onStart) {
      onStart();
    }

    // Redirecionar para o modo escolhido
    const routes = {
      pomodoro: '/pomodoro',
      hyperfocus: '/hyperfocus',
      deepflow: '/deepflow'
    };

    toast.success('Iniciando sessão de foco! 🎯');
    router.push(routes[mode]);
  };

  return (
    <>
      <Button 
        size="lg"
        className="w-full gradient-primary text-lg py-6 hover:scale-105 transition-transform"
        onClick={() => setShowModal(true)}
      >
        <Play className="w-5 h-5 mr-2" />
        Iniciar Foco Agora
      </Button>

      {/* Modal de seleção de modo */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-2">Escolha seu modo de foco</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Selecione a técnica ideal para sua sessão
            </p>

            <div className="space-y-3">
              <Button
                className="w-full justify-start h-auto py-4 px-6"
                variant="outline"
                onClick={() => handleStartFocus('pomodoro')}
              >
                <div className="flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Pomodoro (25 min)</p>
                    <p className="text-xs text-muted-foreground">
                      Foco intenso com pausas regulares
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                className="w-full justify-start h-auto py-4 px-6"
                variant="outline"
                onClick={() => handleStartFocus('hyperfocus')}
              >
                <div className="flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">HyperFocus (50 min)</p>
                    <p className="text-xs text-muted-foreground">
                      Sessão prolongada de concentração
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                className="w-full justify-start h-auto py-4 px-6"
                variant="outline"
                onClick={() => handleStartFocus('deepflow')}
              >
                <div className="flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">DeepFlow (90 min)</p>
                    <p className="text-xs text-muted-foreground">
                      Estado de flow profundo
                    </p>
                  </div>
                </div>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
