'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuizResult } from '@/lib/types';

export default function QuizResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResult = localStorage.getItem('quizResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
      setLoading(false);
    } else {
      router.push('/quiz');
    }
  }, [router]);

  const handleContinue = () => {
    router.push('/planos');
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const protocolIcons: Record<string, string> = {
    HyperFocus: '⚡',
    CalmFix: '🧘',
    DeepFlow: '🎧',
    DopamineBoost: '🚀'
  };

  return (
    <div className="min-h-screen gradient-hero p-4 py-12">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <span className="font-bold text-2xl">MindFix</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Protocolo Personalizado</span>
          </motion.div>
        </motion.div>

        {/* Protocol Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 md:p-12 glass mb-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="text-6xl mb-4"
              >
                {protocolIcons[result.protocol]}
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                {result.protocolName}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {result.description}
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {result.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-6 rounded-lg bg-card/50 border border-border"
              >
                <h3 className="font-semibold mb-2 text-primary">Frequência Ideal</h3>
                <p className="text-muted-foreground">{result.frequency}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="p-6 rounded-lg bg-card/50 border border-border"
              >
                <h3 className="font-semibold mb-2 text-primary">Intensidade</h3>
                <p className="text-muted-foreground">{result.intensity}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="p-6 rounded-lg bg-card/50 border border-border"
              >
                <h3 className="font-semibold mb-2 text-primary">Duração Sugerida</h3>
                <p className="text-muted-foreground">{result.duration}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="p-6 rounded-lg bg-card/50 border border-border"
              >
                <h3 className="font-semibold mb-2 text-primary">Técnicas Recomendadas</h3>
                <p className="text-muted-foreground">{result.techniques.join(', ')}</p>
              </motion.div>
            </div>

            {/* Weekly Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
            >
              <h3 className="font-semibold mb-4 text-lg">Objetivos Semanais</h3>
              <div className="space-y-3">
                {result.weeklyGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{goal}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="gradient-primary px-12"
            onClick={handleContinue}
          >
            Escolher Plano e Começar
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Desbloqueie seu protocolo personalizado com um plano premium
          </p>
        </motion.div>
      </div>
    </div>
  );
}
