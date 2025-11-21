'use client';

import { useState, useEffect } from 'react';
import { Heart, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface QuickCommitmentProps {
  onCommitmentSet?: (commitment: string) => void;
}

export function QuickCommitment({ onCommitmentSet }: QuickCommitmentProps) {
  const [commitment, setCommitment] = useState('');
  const [saved, setSaved] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    const savedCommitment = localStorage.getItem('mindfix_commitment');
    if (savedCommitment) {
      setCommitment(savedCommitment);
    }
  }, []);

  const handleSave = () => {
    if (!commitment.trim()) {
      toast.error('Digite seu compromisso primeiro');
      return;
    }

    if (commitment.length > 120) {
      toast.error('Compromisso muito longo (máx. 120 caracteres)');
      return;
    }

    localStorage.setItem('mindfix_commitment', commitment);
    if (onCommitmentSet) {
      onCommitmentSet(commitment);
    }
    setSaved(true);
    toast.success('Compromisso salvo! 💪');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 120) {
      setCommitment(value);
      setSaved(false);
    }
  };

  return (
    <Card className="p-6 glass">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-chart-4" />
        <h3 className="text-lg font-semibold">Compromisso Rápido</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Defina sua intenção antes de começar
      </p>

      <div className="space-y-4">
        <div>
          <Input
            value={commitment}
            onChange={handleChange}
            placeholder="Ex: Vou focar por 25 minutos sem olhar o celular"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {commitment.length}/120 caracteres
          </p>
        </div>

        <Button 
          onClick={handleSave}
          className="w-full"
          variant={saved ? "outline" : "default"}
        >
          {saved ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvo!
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Salvar Compromisso
            </>
          )}
        </Button>

        {commitment && (
          <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
            <p className="text-sm font-medium mb-1">Seu compromisso:</p>
            <p className="text-sm text-muted-foreground italic">
              "{commitment}"
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
