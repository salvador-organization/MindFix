'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getLocalCurrentUser } from '@/lib/local-auth';

function SubscriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const user = getLocalCurrentUser();
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  const getMessage = () => {
    switch (reason) {
      case 'inactive':
        return {
          title: 'Assinatura Inativa',
          description: 'Sua assinatura está inativa ou expirou. Assine novamente para continuar aproveitando todos os recursos do MindFix.',
          icon: AlertCircle,
          color: 'text-yellow-500',
        };
      case 'no_subscription':
        return {
          title: 'Assinatura Necessária',
          description: 'Você precisa de uma assinatura ativa para acessar este recurso. Escolha um plano e comece agora!',
          icon: CreditCard,
          color: 'text-blue-500',
        };
      case 'error':
        return {
          title: 'Erro ao Verificar Assinatura',
          description: 'Não conseguimos verificar sua assinatura. Por favor, tente novamente ou entre em contato com o suporte.',
          icon: AlertCircle,
          color: 'text-red-500',
        };
      default:
        return {
          title: 'Assinatura Necessária',
          description: 'Para acessar todos os recursos do MindFix, você precisa de uma assinatura ativa.',
          icon: CheckCircle,
          color: 'text-primary',
        };
    }
  };

  const message = getMessage();
  const Icon = message.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 glass">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6`}>
              <Icon className={`w-10 h-10 ${message.color}`} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {message.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              {message.description}
            </p>

            {userEmail && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground mb-8">
                <span>Conta:</span>
                <span className="font-medium">{userEmail}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full gradient-primary text-lg h-14"
              onClick={() => router.push('/planos')}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Ver Planos e Assinar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg h-14"
              onClick={() => router.push('/')}
            >
              Voltar para Início
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-semibold mb-4 text-center">
              O que você ganha com a assinatura:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Acesso ilimitado a todas as técnicas',
                'Pomodoro personalizado',
                'Relatórios detalhados de progresso',
                'Sistema de gamificação completo',
                'Meditações guiadas',
                'Suporte prioritário',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Problemas com sua assinatura?{' '}
          <a href="mailto:suporte@mindfix.com" className="text-primary hover:underline">
            Entre em contato
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionPageContent />
    </Suspense>
  );
}
