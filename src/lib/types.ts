// Quiz Types
export interface QuizAnswer {
  questionId: number;
  answer: string | string[];
}

export interface QuizResult {
  protocol: 'HyperFocus' | 'CalmFix' | 'DeepFlow' | 'DopamineBoost';
  protocolName: string;
  description: string;
  features: string[];
  techniques: string[];
  frequency: string;
  intensity: string;
  duration: string;
  weeklyGoals: string[];
}

export const questions = [
  {
    id: 1,
    question: 'Qual é a sua maior dificuldade hoje?',
    type: 'multiple',
    options: [
      'Me distraio com qualquer coisa',
      'Começo, mas não termino',
      'Não consigo iniciar tarefas',
      'Fico ansioso(a) e travo',
      'Não consigo manter foco por muito tempo',
      'Minha mente fica acelerada demais',
      'Outro'
    ]
  },
  {
    id: 2,
    question: 'Em qual momento do dia você mais perde o foco?',
    type: 'single',
    options: [
      'Manhã',
      'Tarde',
      'Noite',
      'Todos os horários',
      'Varia muito'
    ]
  },
  {
    id: 3,
    question: 'Onde você geralmente tenta focar?',
    type: 'single',
    options: [
      'No trabalho/escritório',
      'Estudando em casa',
      'No quarto',
      'Em locais movimentados',
      'Biblioteca / coworking',
      'Outro'
    ]
  },
  {
    id: 4,
    question: 'O que mais causa sua distração?',
    type: 'single',
    options: [
      'Celular',
      'Pensamentos aleatórios',
      'Notificações',
      'Ruídos',
      'Falta de energia/motivação',
      'Ansiedade',
      'Redes sociais',
      'Tudo isso'
    ]
  },
  {
    id: 5,
    question: 'Com que frequência você sente que sua mente está \"pulando de uma coisa para outra\"?',
    type: 'single',
    options: [
      'O tempo todo',
      'Muitas vezes',
      'Às vezes',
      'Raramente'
    ]
  },
  {
    id: 6,
    question: 'Quando você tenta focar, o que mais te atrapalha emocionalmente?',
    type: 'single',
    options: [
      'Ansiedade',
      'Tédio',
      'Falta de motivação',
      'Impulsividade',
      'Preguiça mental',
      'Estresse'
    ]
  },
  {
    id: 7,
    question: 'Você prefere técnicas de...',
    type: 'single',
    options: [
      'Som/ambiente',
      'Meditação guiada',
      'Tarefas divididas em partes',
      'Técnicas rápidas',
      'Exercícios cognitivos',
      'Não sei, quero que o app escolha para mim'
    ]
  },
  {
    id: 8,
    question: 'Qual é o seu estilo de aprendizado?',
    type: 'single',
    options: [
      'Visual',
      'Auditivo',
      'Cinestésico (aprendo fazendo)',
      'Leitura e escrita',
      'Não sei'
    ]
  },
  {
    id: 9,
    question: 'Qual é seu principal objetivo usando o MindFix?',
    type: 'single',
    options: [
      'Focar mais no trabalho',
      'Fazer tarefas domésticas',
      'Estudar melhor',
      'Controlar ansiedade',
      'Controlar impulsividade',
      'Parar de procrastinar',
      'Melhorar minha vida como um todo'
    ]
  },
  {
    id: 10,
    question: 'Por quanto tempo você consegue focar hoje?',
    type: 'single',
    options: [
      'Menos de 5 minutos',
      'Entre 5 e 15 minutos',
      '25 minutos (mais ou menos um pomodoro)',
      'Mais de 1 hora',
      'Depende muito'
    ]
  },
  {
    id: 11,
    question: 'Com qual dessas frases você mais se identifica?',
    type: 'single',
    options: [
      'Quero foco rápido agora.',
      'Quero construir disciplina com o tempo.',
      'Quero reduzir ansiedade para conseguir focar.',
      'Quero parar de perder tempo com distrações.',
      'Quero transformar minha rotina.'
    ]
  }
];

// Subscription Plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Plano Mensal',
    price: 31.90,
    period: 'mensal',
    description: 'Acesso total ao MindFix por 30 dias',
    benefits: [
      'Todos os modos de foco',
      'Acompanhamento diário',
      'Sons e técnicas premium',
      'Acesso ao modo DeepFlow',
      'Protocolos personalizados'
    ]
  },
  {
    id: 'quarterly',
    name: 'Plano Trimestral',
    price: 25.90,
    period: 'por mês (cobrado trimestral)',
    description: 'Assinatura com melhor custo-benefício',
    popular: true,
    benefits: [
      'Todos os modos de foco',
      'Protocolos avançados',
      'Relatórios detalhados',
      'Descontos exclusivos',
      'Acesso antecipado a novos recursos'
    ]
  },
  {
    id: 'annual',
    name: 'Plano Anual',
    price: 19.90,
    period: 'por mês (cobrado anual)',
    description: 'Plano completo com o menor preço mensal',
    benefits: [
      'Todos os benefícios dos outros planos',
      'DeepFlow ilimitado',
      'Sessões personalizadas ilimitadas',
      'Acompanhamento de progresso avançado',
      'Prioridade no suporte'
    ]
  }
];

export function calculateProtocol(answers: QuizAnswer[]): QuizResult {
  // Análise das respostas para determinar o protocolo
  const answer1 = answers[0]?.answer;
  const answer4 = answers[3]?.answer;
  const answer5 = answers[4]?.answer;
  const answer6 = answers[5]?.answer;
  const answer10 = answers[9]?.answer;
  const answer11 = answers[10]?.answer;

  // HyperFocus Mode: distração rápida + impulsividade + pouco foco
  if (
    (Array.isArray(answer1) && answer1.includes('Me distraio com qualquer coisa')) ||
    answer4 === 'Tudo isso' ||
    answer5 === 'O tempo todo' ||
    answer10 === 'Menos de 5 minutos' ||
    answer10 === 'Entre 5 e 15 minutos'
  ) {
    return {
      protocol: 'HyperFocus',
      protocolName: 'HyperFocus Mode',
      description: 'Perfeito para quem se distrai facilmente e precisa de sessões curtas e intensas',
      features: [
        'Sessões curtas e rápidas',
        'Sons focais específicos',
        'Pomodoro adaptado',
        'Desafios diários gamificados',
        'Modo anti-distração ativado',
        'Técnica de respiração pré-sessão'
      ],
      techniques: ['Pomodoro 15min', 'Brown Noise', 'Bloqueio de apps', 'Micro-recompensas'],
      frequency: '6-8 sessões por dia',
      intensity: 'Alta',
      duration: '15-25 minutos por sessão',
      weeklyGoals: [
        'Completar 30 sessões de foco',
        'Reduzir distrações em 40%',
        'Aumentar tempo de foco gradualmente'
      ]
    };
  }

  // CalmFix: ansiedade + mente acelerada
  if (
    answer6 === 'Ansiedade' ||
    answer6 === 'Estresse' ||
    (Array.isArray(answer1) && answer1.includes('Fico ansioso(a) e travo')) ||
    (Array.isArray(answer1) && answer1.includes('Minha mente fica acelerada demais')) ||
    answer11 === 'Quero reduzir ansiedade para conseguir focar.'
  ) {
    return {
      protocol: 'CalmFix',
      protocolName: 'CalmFix',
      description: 'Ideal para quem precisa acalmar a mente antes de focar',
      features: [
        'Meditação guiada de 3 minutos',
        'Sons calmantes',
        'Técnicas anti-estresse',
        'Blocos de foco mais longos',
        'Notificações de pausa consciente'
      ],
      techniques: ['Respiração 4-7-8', 'Meditação guiada', 'White noise', 'Mindfulness'],
      frequency: '3-4 sessões por dia',
      intensity: 'Moderada',
      duration: '30-45 minutos por sessão',
      weeklyGoals: [
        'Praticar meditação diariamente',
        'Reduzir ansiedade em 50%',
        'Aumentar clareza mental'
      ]
    };
  }

  // DeepFlow: foco longo + ambiente calmo
  if (
    answer10 === 'Mais de 1 hora' ||
    answer11 === 'Quero construir disciplina com o tempo.' ||
    answer6 === 'Preguiça mental'
  ) {
    return {
      protocol: 'DeepFlow',
      protocolName: 'DeepFlow',
      description: 'Para trabalho profundo e sessões prolongadas de alta concentração',
      features: [
        'Sessões maiores (45-60 min)',
        'Sons contínuos',
        'Ancoragem mental',
        'Tarefa profunda personalizada'
      ],
      techniques: ['Deep Work', 'Binaural beats', 'Flow state music', 'Time blocking'],
      frequency: '2-3 sessões por dia',
      intensity: 'Muito alta',
      duration: '60-90 minutos por sessão',
      weeklyGoals: [
        'Completar 10 sessões de deep work',
        'Aumentar produtividade em 60%',
        'Dominar estado de flow'
      ]
    };
  }

  // DopamineBoost: falta de motivação + tédio
  return {
    protocol: 'DopamineBoost',
    protocolName: 'Dopamine Boost Routine',
    description: 'Gamificação e recompensas para manter a motivação alta',
    features: [
      'Microtarefas',
      'Desafios de 2 minutos',
      'Gamificação forte',
      'Músicas estimulantes'
    ],
    techniques: ['Micro-tarefas', 'Recompensas imediatas', 'Música energética', 'Desafios diários'],
    frequency: '8-10 sessões por dia',
    intensity: 'Variável',
    duration: '5-15 minutos por sessão',
    weeklyGoals: [
      'Completar 50 micro-tarefas',
      'Ganhar 1000 pontos',
      'Manter streak de 7 dias'
    ]
  };
}

// ============================================
// NOVAS FUNCIONALIDADES - MINDFIX EXPANSION
// ============================================

// Task Management Types
export interface Task {
  id: string;
  title: string;
  category: 'estudo' | 'trabalho' | 'projetos' | 'pessoal' | 'leitura';
  completed: boolean;
  timeSpent: number; // minutos
  estimatedTime: number; // minutos
  priority: 'baixa' | 'media' | 'alta';
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskList {
  id: string;
  name: string;
  category: Task['category'];
  tasks: Task[];
}

// Focus Session Types
export interface FocusSession {
  id: string;
  type: 'pomodoro' | 'hyperfocus' | 'deepflow' | 'custom';
  duration: number; // minutos
  breakDuration: number; // minutos
  cycles: number;
  currentCycle: number;
  taskId?: string;
  startedAt: Date;
  completedAt?: Date;
  interrupted: boolean;
}

export interface TimerPreset {
  id: string;
  name: string;
  focusTime: number; // minutos
  breakTime: number; // minutos
  cycles: number;
  isCustom: boolean;
}

export const DEFAULT_TIMER_PRESETS: TimerPreset[] = [
  {
    id: 'pomodoro-classic',
    name: 'Pomodoro Clássico',
    focusTime: 25,
    breakTime: 5,
    cycles: 4,
    isCustom: false
  },
  {
    id: 'short-burst',
    name: 'Rajada Curta',
    focusTime: 20,
    breakTime: 5,
    cycles: 3,
    isCustom: false
  },
  {
    id: 'deep-work',
    name: 'Trabalho Profundo',
    focusTime: 45,
    breakTime: 15,
    cycles: 3,
    isCustom: false
  },
  {
    id: 'ultra-focus',
    name: 'Ultra Foco',
    focusTime: 52,
    breakTime: 17,
    cycles: 2,
    isCustom: false
  }
];

// Gamification Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'foco' | 'streak' | 'tarefas' | 'mindfulness' | 'especial';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'comum' | 'raro' | 'epico' | 'lendario';
  earnedAt?: Date;
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  type: 'foco' | 'tarefas' | 'meditacao' | 'streak';
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
  expiresAt: Date;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

export const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first-session',
    title: 'Primeira Sessão',
    description: 'Complete sua primeira sessão de foco',
    icon: '🎯',
    category: 'foco',
    requirement: 1,
    xpReward: 50
  },
  {
    id: 'focus-master',
    title: 'Mestre do Foco',
    description: 'Complete 100 sessões de foco',
    icon: '🧠',
    category: 'foco',
    requirement: 100,
    xpReward: 500
  },
  {
    id: 'week-streak',
    title: 'Sequência Semanal',
    description: 'Mantenha uma sequência de 7 dias',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    xpReward: 200
  },
  {
    id: 'month-streak',
    title: 'Mês Imparável',
    description: 'Mantenha uma sequência de 30 dias',
    icon: '⚡',
    category: 'streak',
    requirement: 30,
    xpReward: 1000
  },
  {
    id: 'task-warrior',
    title: 'Guerreiro das Tarefas',
    description: 'Complete 50 tarefas',
    icon: '✅',
    category: 'tarefas',
    requirement: 50,
    xpReward: 300
  },
  {
    id: 'zen-master',
    title: 'Mestre Zen',
    description: 'Complete 30 sessões de meditação',
    icon: '🧘',
    category: 'mindfulness',
    requirement: 30,
    xpReward: 400
  },
  {
    id: 'early-bird',
    title: 'Madrugador',
    description: 'Complete 10 sessões antes das 8h',
    icon: '🌅',
    category: 'especial',
    requirement: 10,
    xpReward: 250
  },
  {
    id: 'night-owl',
    title: 'Coruja Noturna',
    description: 'Complete 10 sessões após 22h',
    icon: '🦉',
    category: 'especial',
    requirement: 10,
    xpReward: 250
  }
];

// Analytics & Reports Types
export interface FocusStats {
  today: number; // minutos
  week: number; // minutos
  month: number; // minutos
  totalSessions: number;
  averageSessionDuration: number;
  longestStreak: number;
  currentStreak: number;
}

export interface CategoryDistribution {
  category: Task['category'];
  minutes: number;
  percentage: number;
}

export interface HourlyFocusData {
  hour: number;
  minutes: number;
  sessions: number;
}

export interface WeeklyProgress {
  weekNumber: number;
  totalMinutes: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  averageFocusScore: number;
}

// Mindfulness Expansion Types
export interface MeditationSession {
  id: string;
  type: 'body-scan' | 'breathing' | 'mindfulness' | 'micro' | 'guided';
  duration: number; // segundos
  completedAt: Date;
  rating?: number; // 1-5
  notes?: string;
}

export interface DistractionLog {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: 'pensamento' | 'ruido' | 'notificacao' | 'outro';
  description: string;
  handled: boolean;
}

export interface MentalExercise {
  id: string;
  name: string;
  type: 'auditivo' | 'visual' | 'cognitivo';
  duration: number; // segundos
  difficulty: 'facil' | 'medio' | 'dificil';
  description: string;
}

export const MENTAL_EXERCISES: MentalExercise[] = [
  {
    id: 'sound-focus',
    name: 'Foco Auditivo',
    type: 'auditivo',
    duration: 60,
    difficulty: 'facil',
    description: 'Identifique e conte diferentes sons ao seu redor'
  },
  {
    id: 'visual-tracking',
    name: 'Rastreamento Visual',
    type: 'visual',
    duration: 90,
    difficulty: 'medio',
    description: 'Siga um objeto em movimento com os olhos'
  },
  {
    id: 'memory-challenge',
    name: 'Desafio de Memória',
    type: 'cognitivo',
    duration: 120,
    difficulty: 'dificil',
    description: 'Memorize e repita sequências de números'
  }
];

// Active Rest Types
export interface ActiveRestActivity {
  id: string;
  name: string;
  type: 'alongamento' | 'respiracao' | 'hidratacao' | 'movimento';
  duration: number; // segundos
  instructions: string[];
  benefits: string[];
}

export const ACTIVE_REST_ACTIVITIES: ActiveRestActivity[] = [
  {
    id: 'neck-stretch',
    name: 'Alongamento de Pescoço',
    type: 'alongamento',
    duration: 30,
    instructions: [
      'Incline a cabeça para a direita',
      'Segure por 10 segundos',
      'Repita para o lado esquerdo',
      'Incline para frente e para trás'
    ],
    benefits: ['Reduz tensão', 'Melhora postura', 'Alivia dor']
  },
  {
    id: 'box-breathing',
    name: 'Respiração Quadrada',
    type: 'respiracao',
    duration: 60,
    instructions: [
      'Inspire por 4 segundos',
      'Segure por 4 segundos',
      'Expire por 4 segundos',
      'Segure por 4 segundos',
      'Repita 3 vezes'
    ],
    benefits: ['Reduz ansiedade', 'Aumenta foco', 'Acalma mente']
  },
  {
    id: 'hydration-reminder',
    name: 'Lembrete de Hidratação',
    type: 'hidratacao',
    duration: 15,
    instructions: [
      'Pegue sua garrafa de água',
      'Beba pelo menos 200ml',
      'Respire fundo',
      'Volte ao trabalho hidratado'
    ],
    benefits: ['Mantém energia', 'Melhora concentração', 'Saúde geral']
  },
  {
    id: 'desk-movement',
    name: 'Movimento na Mesa',
    type: 'movimento',
    duration: 45,
    instructions: [
      'Levante-se da cadeira',
      'Faça 10 agachamentos leves',
      'Estique os braços acima da cabeça',
      'Gire os ombros 5 vezes',
      'Sente-se novamente'
    ],
    benefits: ['Ativa circulação', 'Reduz fadiga', 'Aumenta energia']
  }
];
