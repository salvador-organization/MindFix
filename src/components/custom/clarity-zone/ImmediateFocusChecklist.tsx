'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: '1', text: 'Defina o objetivo da tarefa', checked: false },
  { id: '2', text: 'Remova distrações', checked: false },
  { id: '3', text: 'Escolha o tempo de foco', checked: false }
];

export function ImmediateFocusChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindfix_focus_checklist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(parsed.length > 0 ? parsed : DEFAULT_ITEMS);
      } catch (e) {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('mindfix_focus_checklist', JSON.stringify(items));
    }
  }, [items]);

  const toggleItem = (id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(newItems);

    // Verificar se todos foram marcados
    if (newItems.every(item => item.checked)) {
      toast.success('Pronto para focar! 🎯', {
        description: 'Você completou todos os itens do checklist'
      });
    }
  };

  const addCustomItem = () => {
    if (!newItemText.trim()) {
      toast.error('Digite o texto do item');
      return;
    }

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText,
      checked: false
    };

    setItems([...items, newItem]);
    setNewItemText('');
    setShowAddInput(false);
    toast.success('Item adicionado ao checklist');
  };

  const removeItem = (id: string) => {
    // Não permitir remover se for o último item
    if (items.length === 1) {
      toast.error('Mantenha pelo menos um item no checklist');
      return;
    }

    setItems(items.filter(item => item.id !== id));
    toast.info('Item removido');
  };

  const resetToDefault = () => {
    setItems(DEFAULT_ITEMS);
    toast.info('Checklist resetado para o padrão');
  };

  const allChecked = items.every(item => item.checked);
  const progress = items.length > 0 ? (items.filter(item => item.checked).length / items.length) * 100 : 0;

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Checklist de Foco</h3>
        </div>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={resetToDefault}
          title="Resetar para padrão"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Prepare-se para uma sessão produtiva
      </p>

      {/* Barra de progresso */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {items.filter(item => item.checked).length} de {items.length} completos
        </p>
      </div>

      {/* Lista de itens */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                item.checked
                  ? 'bg-primary/10 border-primary/20'
                  : 'bg-card/50 border-border hover:bg-card/80'
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  item.checked
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30 hover:border-primary'
                }`}
              >
                {item.checked && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
              <span className={`flex-1 text-left ${item.checked ? 'text-muted-foreground' : ''}`}>
                {item.text}
              </span>
              {items.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhum item no checklist. Adicione itens personalizados abaixo.
          </div>
        )}
      </div>

      {/* Adicionar item customizado */}
      <div className="mt-4">
        {showAddInput ? (
          <div className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Novo item do checklist..."
              onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
              autoFocus
            />
            <Button onClick={addCustomItem} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => {
                setShowAddInput(false);
                setNewItemText('');
              }} 
              size="sm" 
              variant="ghost"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowAddInput(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar item personalizado
          </Button>
        )}
      </div>

      {allChecked && items.length > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
          <p className="text-sm font-medium text-primary">
            ✨ Você está pronto para focar!
          </p>
        </div>
      )}
    </Card>
  );
}
