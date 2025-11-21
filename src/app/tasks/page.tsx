'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, X, Plus, CheckCircle2, Circle, Clock, 
  Briefcase, BookOpen, FolderKanban, User, Book,
  Trash2, Play, Filter
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Task } from '@/lib/types';

const CATEGORIES = [
  { id: 'estudo', label: 'Estudo', icon: BookOpen, color: 'text-chart-1' },
  { id: 'trabalho', label: 'Trabalho', icon: Briefcase, color: 'text-chart-2' },
  { id: 'projetos', label: 'Projetos', icon: FolderKanban, color: 'text-chart-3' },
  { id: 'pessoal', label: 'Pessoal', icon: User, color: 'text-chart-4' },
  { id: 'leitura', label: 'Leitura', icon: Book, color: 'text-chart-5' }
] as const;

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Task['category']>('trabalho');
  const [filterCategory, setFilterCategory] = useState<Task['category'] | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Digite um título para a tarefa');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: selectedCategory,
      completed: false,
      timeSpent: 0,
      estimatedTime: 25,
      priority: 'media',
      createdAt: new Date()
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    toast.success('Tarefa adicionada!');
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const completed = !task.completed;
        if (completed) {
          toast.success('Tarefa concluída! +20 pontos');
        }
        return {
          ...task,
          completed,
          completedAt: completed ? new Date() : undefined
        };
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success('Tarefa removida');
  };

  const startFocusSession = (task: Task) => {
    toast.success(`Iniciando sessão de foco para: ${task.title}`);
    router.push(`/pomodoro?taskId=${task.id}`);
  };

  const filteredTasks = tasks.filter(task => {
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (!showCompleted && task.completed) return false;
    return true;
  });

  const completedToday = tasks.filter(t => 
    t.completed && 
    t.completedAt && 
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;

  const totalTimeToday = tasks
    .filter(t => t.completed && t.completedAt && 
      new Date(t.completedAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.timeSpent, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">MindFix</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Tarefas & Foco</h1>
            <p className="text-muted-foreground">
              Organize suas tarefas e vincule-as às sessões de foco
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 glass">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Concluídas Hoje</p>
                  <p className="text-2xl font-bold">{completedToday}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="p-4 glass">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tempo Investido</p>
                  <p className="text-2xl font-bold">{totalTimeToday}m</p>
                </div>
                <Clock className="w-8 h-8 text-accent" />
              </div>
            </Card>
            <Card className="p-4 glass">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Tarefas</p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
                <FolderKanban className="w-8 h-8 text-chart-3" />
              </div>
            </Card>
          </div>

          {/* Add Task */}
          <Card className="p-6 glass mb-6">
            <h2 className="text-xl font-bold mb-4">Nova Tarefa</h2>
            <div className="space-y-4">
              <Input
                placeholder="Digite o título da tarefa..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="text-lg"
              />
              
              {/* Category Selection */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id as Task['category'])}
                      className={selectedCategory === cat.id ? 'gradient-primary' : ''}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {cat.label}
                    </Button>
                  );
                })}
              </div>

              <Button 
                onClick={addTask} 
                className="w-full gradient-primary"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Tarefa
              </Button>
            </div>
          </Card>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showCompleted ? 'Ocultar' : 'Mostrar'} Concluídas
            </Button>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('all')}
                className={filterCategory === 'all' ? 'gradient-primary' : ''}
              >
                Todas
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={filterCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory(cat.id as Task['category'])}
                  className={filterCategory === cat.id ? 'gradient-primary' : ''}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="p-12 glass text-center">
                <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-muted-foreground">
                  {tasks.length === 0 
                    ? 'Adicione sua primeira tarefa acima'
                    : 'Ajuste os filtros para ver suas tarefas'}
                </p>
              </Card>
            ) : (
              filteredTasks.map((task, index) => {
                const categoryInfo = CATEGORIES.find(c => c.id === task.category);
                const Icon = categoryInfo?.icon || FolderKanban;
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`p-4 glass hover:bg-card/60 transition-all ${
                      task.completed ? 'opacity-60' : ''
                    }`}>
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>

                        {/* Category Icon */}
                        <Icon className={`w-5 h-5 ${categoryInfo?.color} flex-shrink-0`} />

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.timeSpent}m / {task.estimatedTime}m
                            </span>
                            <span className="capitalize">{task.category}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!task.completed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startFocusSession(task)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Focar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
