'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface BrainDumpBoxProps {
  onSave?: (content: string) => void;
}

export function BrainDumpBox({ onSave }: BrainDumpBoxProps) {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Carregar do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem('mindfix_brain_dump');
    if (saved) {
      setContent(saved);
    }
  }, []);

  // Auto-save com debounce
  const autoSave = useCallback((text: string) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    setSaveStatus('saving');
    const timeout = setTimeout(() => {
      localStorage.setItem('mindfix_brain_dump', text);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);

    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    autoSave(newContent);
  };

  const handleSave = () => {
    localStorage.setItem('mindfix_brain_dump', content);
    if (onSave) {
      onSave(content);
    }
    setSaveStatus('saved');
    toast.success('Brain Dump salvo com sucesso!');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleClear = () => {
    setContent('');
    localStorage.removeItem('mindfix_brain_dump');
    toast.info('Brain Dump limpo');
  };

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Brain Dump</h3>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="text-xs text-muted-foreground">Salvando...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Check className="w-3 h-3" /> Salvo
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Esvazie sua mente — escreva tudo que está te roubando atenção
      </p>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Escreva seus pensamentos, preocupações, ideias soltas..."
        className="w-full min-h-[200px] p-4 rounded-lg border border-input bg-background/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
      />

      <div className="flex gap-3 mt-4">
        <Button 
          onClick={handleSave}
          className="flex-1"
          variant="outline"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button 
          onClick={handleClear}
          variant="outline"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </div>
    </Card>
  );
}
