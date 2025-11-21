// Clarity Zone - Persistência Local e Sincronização
export interface BrainDump {
  text: string;
  lastSavedAt: string;
  synced: boolean;
}

export interface Microtask {
  id: string;
  taskTitle: string;
  steps: MicrotaskStep[];
  createdAt: string;
  synced: boolean;
}

export interface MicrotaskStep {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  isDefault: boolean;
}

export interface Commitment {
  text: string;
  createdAt: string;
  synced: boolean;
}

export interface ClarityState {
  brainDump: BrainDump | null;
  microtasks: Microtask[];
  checklist: ChecklistItem[];
  commitment: Commitment | null;
}

// Default checklist items
export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', text: 'Defina o objetivo da tarefa', completed: false, order: 1, isDefault: true },
  { id: '2', text: 'Remova distrações', completed: false, order: 2, isDefault: true },
  { id: '3', text: 'Escolha o tempo de foco', completed: false, order: 3, isDefault: true },
];

// LocalStorage keys
const STORAGE_KEYS = {
  BRAIN_DUMP: 'mindfix_clarity_brain_dump',
  MICROTASKS: 'mindfix_clarity_microtasks',
  CHECKLIST: 'mindfix_clarity_checklist',
  COMMITMENT: 'mindfix_clarity_commitment',
};

// Storage helpers
export const clarityStorage = {
  // Brain Dump
  getBrainDump: (): BrainDump | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.BRAIN_DUMP);
    return data ? JSON.parse(data) : null;
  },

  saveBrainDump: (brainDump: BrainDump): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.BRAIN_DUMP, JSON.stringify(brainDump));
  },

  clearBrainDump: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.BRAIN_DUMP);
  },

  // Microtasks
  getMicrotasks: (): Microtask[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MICROTASKS);
    return data ? JSON.parse(data) : [];
  },

  saveMicrotasks: (microtasks: Microtask[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MICROTASKS, JSON.stringify(microtasks));
  },

  // Checklist
  getChecklist: (): ChecklistItem[] => {
    if (typeof window === 'undefined') return DEFAULT_CHECKLIST;
    const data = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    return data ? JSON.parse(data) : DEFAULT_CHECKLIST;
  },

  saveChecklist: (checklist: ChecklistItem[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist));
  },

  resetChecklist: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(DEFAULT_CHECKLIST));
  },

  // Commitment
  getCommitment: (): Commitment | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.COMMITMENT);
    return data ? JSON.parse(data) : null;
  },

  saveCommitment: (commitment: Commitment): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMMITMENT, JSON.stringify(commitment));
  },

  // Get all state
  getState: (): ClarityState => {
    return {
      brainDump: clarityStorage.getBrainDump(),
      microtasks: clarityStorage.getMicrotasks(),
      checklist: clarityStorage.getChecklist(),
      commitment: clarityStorage.getCommitment(),
    };
  },
};

// Microtask suggestion algorithm - APENAS baseado no input do usuário
export const suggestMicrotasks = (taskDescription: string): string[] => {
  if (!taskDescription.trim()) return [];

  // Split by common separators
  const sentences = taskDescription
    .split(/[.;,\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // If we have clear sentences, use them
  if (sentences.length >= 2) {
    return sentences.slice(0, 6).map(s => {
      // Limit to 80 chars
      return s.length > 80 ? s.substring(0, 77) + '...' : s;
    });
  }

  // Otherwise, try to extract action verbs and create steps
  const actionVerbs = [
    'criar', 'fazer', 'escrever', 'ler', 'estudar', 'revisar', 'preparar',
    'organizar', 'planejar', 'executar', 'implementar', 'testar', 'validar',
    'enviar', 'responder', 'analisar', 'pesquisar', 'documentar'
  ];

  const words = taskDescription.toLowerCase().split(/\s+/);
  const foundVerbs = words.filter(w => actionVerbs.includes(w));

  if (foundVerbs.length > 0) {
    // Create generic steps based on the task
    const steps = [
      `Preparar ambiente para: ${taskDescription.substring(0, 40)}`,
      `Executar tarefa principal`,
      `Revisar resultado`,
      `Finalizar e documentar`,
    ];
    return steps.slice(0, Math.min(foundVerbs.length + 2, 6));
  }

  // Fallback: create generic breakdown
  return [
    `Começar: ${taskDescription.substring(0, 60)}`,
    `Desenvolver a tarefa`,
    `Revisar o trabalho`,
    `Concluir e organizar`,
  ];
};

// Analytics events
export const clarityAnalytics = {
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    // In production, this would send to analytics service
    console.log('[Clarity Analytics]', eventName, properties);
    
    // Store event locally for later sync
    if (typeof window !== 'undefined') {
      const events = JSON.parse(localStorage.getItem('mindfix_clarity_events') || '[]');
      events.push({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      });
      // Keep only last 100 events
      if (events.length > 100) events.shift();
      localStorage.setItem('mindfix_clarity_events', JSON.stringify(events));
    }
  },
};
