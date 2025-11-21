'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { questions, calculateProtocol, QuizAnswer } from '@/lib/types';
import { toast } from 'sonner';

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleOptionSelect = (option: string) => {
    if (question.type === 'multiple') {
      if (selectedOptions.includes(option)) {
        setSelectedOptions(selectedOptions.filter(o => o !== option));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    } else {
      setSelectedOptions([option]);
    }
  };

  const handleNext = () => {
    if (selectedOptions.length === 0) {
      toast.error('Por favor, selecione uma opção');
      return;
    }

    const answer: QuizAnswer = {
      questionId: question.id,
      answer: question.type === 'multiple' ? selectedOptions : selectedOptions[0]
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOptions([]);
      setOtherText('');
    } else {
      // Quiz completo - calcular resultado e redirecionar
      const result = calculateProtocol(newAnswers);
      localStorage.setItem('quizResult', JSON.stringify(result));
      router.push('/quiz/result');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const previousAnswer = answers[currentQuestion - 1];
      if (previousAnswer) {
        setSelectedOptions(
          Array.isArray(previousAnswer.answer) 
            ? previousAnswer.answer 
            : [previousAnswer.answer]
        );
      }
      setAnswers(answers.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen gradient-hero p-4">
      {/* Header */}
      <div className="container mx-auto max-w-4xl pt-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">MindFix</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} de {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-card rounded-full overflow-hidden mb-12">
          <motion.div
            className="h-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              {question.question}
            </h1>

            <div className="grid gap-4 mb-8">
              {question.options.map((option, index) => {
                const isSelected = selectedOptions.includes(option);
                const isOther = option === 'Outro';

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                        isSelected
                          ? 'border-primary bg-primary/10 glass'
                          : 'glass hover:border-primary/50'
                      }`}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{option}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </motion.div>
                        )}
                      </div>

                      {isOther && isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4"
                        >
                          <input
                            type="text"
                            placeholder="Digite aqui..."
                            className="w-full p-3 rounded-lg bg-background border border-border focus:border-primary outline-none"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {question.type === 'multiple' && (
              <p className="text-center text-sm text-muted-foreground mb-8">
                Você pode selecionar múltiplas opções
              </p>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between max-w-2xl mx-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={selectedOptions.length === 0}
                className="flex-1 gradient-primary"
              >
                {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
