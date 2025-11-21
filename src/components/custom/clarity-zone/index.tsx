'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainDumpBox } from './BrainDumpBox';
import { MicrotaskSuggester } from './MicrotaskSuggester';
import { ImmediateFocusChecklist } from './ImmediateFocusChecklist';
import { QuickCommitment } from './QuickCommitment';
import { StartFocusButton } from './StartFocusButton';

export function ClarityZone() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [commitment, setCommitment] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-12"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between mb-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Zona de Clareza</h2>
            <p className="text-sm text-muted-foreground">
              Organize sua mente antes de focar
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Grid de componentes */}
          <div className="grid md:grid-cols-2 gap-6">
            <BrainDumpBox />
            <MicrotaskSuggester />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ImmediateFocusChecklist />
            <QuickCommitment onCommitmentSet={setCommitment} />
          </div>

          {/* Botão de iniciar foco */}
          <Card className="p-6 glass">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h3 className="text-xl font-semibold">
                Pronto para começar?
              </h3>
              <p className="text-sm text-muted-foreground">
                Você organizou sua mente. Agora é hora de focar!
              </p>
              <StartFocusButton commitment={commitment} />
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
