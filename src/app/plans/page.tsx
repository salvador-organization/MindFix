'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const router = useRouter();

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$ 97',
      period: '/mês',
      description: 'Ideal para começar sua jornada',
      features: [
        'Acesso a conteúdos básicos',
        'Suporte por email',
        'Atualizações mensais',
        'Comunidade exclusiva',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 'R$ 197',
      period: '/mês',
      description: 'Para quem busca resultados sérios',
      features: [
        'Tudo do plano Básico',
        'Acesso a conteúdos avançados',
        'Suporte prioritário',
        'Mentorias em grupo',
        'Certificado de conclusão',
      ],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 397',
      period: '/mês',
      description: 'Experiência completa e exclusiva',
      features: [
        'Tudo do plano Profissional',
        'Mentoria individual 1:1',
        'Acesso vitalício',
        'Suporte 24/7',
        'Networking exclusivo',
        'Eventos presenciais',
      ],
      popular: false,
    },
  ];

  const handleSubscribe = (planId: string) => {
    router.push(`/checkout?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha Seu Plano
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Invista no seu desenvolvimento e alcance seus objetivos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-card rounded-2xl p-8 border-2 transition-all hover:shadow-2xl ${
                plan.popular
                  ? 'border-primary shadow-xl scale-105'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${plan.popular ? 'gradient-primary' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
                onClick={() => handleSubscribe(plan.id)}
              >
                Assinar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Todos os planos incluem garantia de 7 dias. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  );
}
