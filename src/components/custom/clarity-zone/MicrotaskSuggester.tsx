'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Microtask {
  id: string;
  text: string;
  completed: boolean;
}

export function MicrotaskSuggester() {
  const [taskInput, setTaskInput] = useState('');
  const [microtasks, setMicrotasks] = useState<Microtask[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Carregar microtarefas salvas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindfix_microtasks');
    if (saved) {
      try {
        setMicrotasks(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar microtarefas:', e);
      }
    }
  }, []);

  // Salvar microtarefas no localStorage
  useEffect(() => {
    if (microtasks.length > 0) {
      localStorage.setItem('mindfix_microtasks', JSON.stringify(microtasks));
    }
  }, [microtasks]);

  // Algoritmo para quebrar tarefa em passos menores
  const generateSuggestions = (task: string): string[] => {
    if (!task.trim()) return [];

    const suggestions: string[] = [];
    
    // Dividir por pontos, vírgulas ou quebras de linha
    const parts = task.split(/[.,;\n]/).map(s => s.trim()).filter(s => s.length > 0);
    
    if (parts.length >= 2) {
      // Se já tem partes claras, usar elas
      return parts.slice(0, 6).map(part => {
        // Limitar a 80 caracteres
        return part.length > 80 ? part.substring(0, 77) + '...' : part;
      });
    }

    // Se for uma tarefa única, sugerir quebra genérica
    const taskLower = task.toLowerCase();
    
    // Identificar verbos de ação
    const hasAction = /\b(fazer|criar|escrever|estudar|ler|revisar|preparar|organizar|planejar|executar|implementar|testar|enviar|responder|analisar|pesquisar|documentar)\b/.test(taskLower);
    
    if (hasAction) {
      suggestions.push(`Preparar: ${task.substring(0, 50)}`);
      suggestions.push('Executar a tarefa principal');
      suggestions.push('Revisar o resultado');
      suggestions.push('Finalizar e organizar');
    } else {
      // Sugestão básica de quebra
      suggestions.push(`Começar: ${task.substring(0, 50)}`);
      suggestions.push('Desenvolver o trabalho');
      suggestions.push('Revisar e ajustar');
      suggestions.push('Concluir');
    }

    return suggestions.slice(0, 5);
  };

  const handleSuggest = () => {
    if (!taskInput.trim()) {
      toast.error('Digite uma tarefa primeiro');
      return;
    }

    const newSuggestions = generateSuggestions(taskInput);
    
    if (newSuggestions.length === 0) {
      toast.error('Não foi possível gerar sugestões para esta tarefa');
      return;
    }

    setSuggestions(newSuggestions);
    toast.success('Passos sugeridos!');
  };

  const handleAcceptSuggestion = (suggestion: string) => {
    const newTask: Microtask = {
      id: Date.now().toString() + Math.random(),
      text: suggestion,
      completed: false
    };
    setMicrotasks([...microtasks, newTask]);
    setSuggestions(suggestions.filter(s => s !== suggestion));
    toast.success('Microtarefa adicionada');
  };

  const handleAcceptAll = () => {
    const newTasks = suggestions.map(s => ({
      id: Date.now().toString() + Math.random(),
      text: s,
      completed: false
    }));
    setMicrotasks([...microtasks, ...newTasks]);
    setSuggestions([]);
    toast.success('Todas as microtarefas adicionadas');
  };

  const handleAddManual = () => {
    if (!taskInput.trim()) {
      toast.error('Digite uma tarefa primeiro');
      return;
    }

    const newTask: Microtask = {
      id: Date.now().toString() + Math.random(),
      text: taskInput,
      completed: false
    };
    setMicrotasks([...microtasks, newTask]);
    setTaskInput('');
    toast.success('Tarefa adicionada');
  };

  const toggleTask = (id: string) => {
    setMicrotasks(microtasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const removeTask = (id: string) => {
    setMicrotasks(microtasks.filter(task => task.id !== id));
    if (microtasks.length === 1) {
      localStorage.removeItem('mindfix_microtasks');
    }
  };

  return (
    <Card className="p-6 glass">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Quebra de Tarefas</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Divida tarefas grandes em passos pequenos e gerenciáveis
      </p>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Descreva uma tarefa grande..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey) {
                handleAddManual();
              } else if (e.key === 'Enter') {
                handleSuggest();
              }
            }}
          />
          <Button onClick={handleSuggest} variant="outline">
            <Lightbulb className="w-4 h-4 mr-2" />
            Sugerir
          </Button>
        </div>

        {/* Sugestões */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Passos sugeridos:</p>
              <Button size="sm" variant="ghost" onClick={handleAcceptAll}>
                Aceitar todos
              </Button>
            </div>
            {suggestions.map((suggestion, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20"
              >
                <span className="text-sm">{suggestion}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAcceptSuggestion(suggestion)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Lista de Microtarefas */}
        {microtasks.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Suas microtarefas:</p>
            {microtasks.map((task) => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground/30 hover:border-primary'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.text}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeTask(task.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhuma microtarefa criada ainda. Digite uma tarefa e clique em "Sugerir" para começar.
          </div>
        )}
      </div>
    </Card>
  );
}
