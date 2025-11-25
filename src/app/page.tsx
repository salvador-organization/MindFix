'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Target, Award, TrendingUp, Shield, CheckCircle2, Star, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SUBSCRIPTION_PLANS } from '@/lib/types';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-10" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Transforme sua atenção em superpoder</span>
            </motion.div>
            
            <div className="border-4 border-purple-600 rounded-3xl p-8 shadow-[0_0_40px_rgba(128,0,255,0.5)] mb-8">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 bg-clip-text text-transparent">
                Domine seu foco.<br />
                Conquiste seus objetivos.
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              O app definitivo para quem tem <span className="text-primary font-semibold">TDAH</span>, luta contra distrações ou quer alcançar o <span className="text-accent font-semibold">estado de flow</span> todos os dias.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/cadastro">
                <Button size="lg" className="gradient-primary text-lg px-8 py-6 hover:scale-105 transition-transform">
                  Começar Agora <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#planos">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:bg-card">
                  Ver Planos
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-20 h-20 rounded-full bg-primary/20 blur-xl" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-32 h-32 rounded-full bg-accent/20 blur-xl" />
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Você não está sozinho nessa luta
            </h2>
            <p className="text-xl text-muted-foreground">
              Milhões de pessoas enfrentam os mesmos desafios todos os dias
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Brain, title: "Mente acelerada", desc: "Pensamentos que não param, dificuldade em focar em uma tarefa" },
              { icon: Zap, title: "Procrastinação crônica", desc: "Sabe o que precisa fazer, mas não consegue começar" },
              { icon: Target, title: "Distrações constantes", desc: "Celular, redes sociais, qualquer coisa tira sua atenção" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 glass hover:bg-card/60 transition-all">
                  <item.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              MindFix é a solução científica que você precisa
            </h2>
            <p className="text-xl text-muted-foreground">
              Técnicas comprovadas + Gamificação + Personalização = Resultados reais
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: "Pomodoro Adaptado", desc: "Técnica científica ajustada para TDAH e hiperfoco" },
              { icon: Zap, title: "Sons de Concentração", desc: "Brown noise, white noise e frequências binaurais" },
              { icon: Target, title: "Meditações Guiadas", desc: "Exercícios de 3 a 20 minutos para acalmar a mente" },
              { icon: Award, title: "Gamificação Real", desc: "Pontos, badges, desafios e recompensas motivadoras" },
              { icon: TrendingUp, title: "Protocolo Personalizado", desc: "Quiz inteligente cria sua rotina ideal de foco" },
              { icon: Shield, title: "Progresso Visível", desc: "Estatísticas e gráficos do seu crescimento" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 glass hover:scale-105 transition-all cursor-pointer">
                  <item.icon className="w-10 h-10 text-accent mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-center mb-16"
            >
              A transformação é real
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 bg-destructive/10 border-destructive/20">
                  <h3 className="text-2xl font-bold mb-6 text-destructive">Antes do MindFix</h3>
                  <ul className="space-y-4">
                    {[
                      "Horas perdidas em distrações",
                      "Projetos inacabados acumulando",
                      "Frustração e culpa constantes",
                      "Produtividade inconsistente",
                      "Sensação de estar sempre atrasado"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-destructive mt-1">✗</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 bg-primary/10 border-primary/20">
                  <h3 className="text-2xl font-bold mb-6 text-primary">Depois do MindFix</h3>
                  <ul className="space-y-4">
                    {[
                      "Foco profundo por horas seguidas",
                      "Projetos concluídos com qualidade",
                      "Confiança e controle da sua mente",
                      "Produtividade consistente e previsível",
                      "Sensação de realização diária"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Escolha seu plano de transformação
            </h2>
            <p className="text-xl text-muted-foreground">
              Invista em você. Cancele quando quiser.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`p-8 relative ${plan.popular ? 'border-primary border-2 scale-105' : 'glass'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="gradient-primary px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4" /> Mais Popular
                      </div>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">R$ {plan.price.toFixed(2)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/cadastro">
                    <Button 
                      className={`w-full ${plan.popular ? 'gradient-primary' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      Começar Agora
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted-foreground mt-8"
          >
            Pagamento seguro via Kirvano • Cancele quando quiser • Suporte 24/7
          </motion.p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Junte-se a milhares de pessoas que já transformaram seu foco
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { number: "10.000+", label: "Usuários ativos" },
                { number: "500.000+", label: "Horas de foco" },
                { number: "4.9/5", label: "Avaliação média" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: "Maria S.", text: "Finalmente consigo trabalhar 4h seguidas sem me distrair. Mudou minha vida!" },
                { name: "João P.", text: "Como alguém com TDAH, o MindFix é a única ferramenta que realmente funciona pra mim." }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 glass text-left">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                    <p className="font-semibold">{testimonial.name}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Pronto para dominar seu foco?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Comece sua jornada de transformação hoje mesmo
            </p>
            <Link href="/cadastro">
              <Button size="lg" className="gradient-primary text-xl px-12 py-8 hover:scale-105 transition-transform">
                Começar Agora <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">MindFix</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/termos" className="hover:text-foreground transition-colors">Termos</Link>
              <Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
              <Link href="/contato" className="hover:text-foreground transition-colors">Contato</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MindFix. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
