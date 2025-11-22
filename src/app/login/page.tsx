'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { localSignIn, getLocalCurrentUser } from '@/lib/local-auth';
import { supabase, isConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { saveUser } from '@/utils/saveUser';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await localSignIn(formData.email, formData.password);

      if (error) {
        toast.error(error.message || 'Email ou senha incorretos');
        setLoading(false);
        return;
      }

      if (data?.user) {
        toast.success('Login realizado com sucesso!');

        // Verificar acesso antes de redirecionar
        const localUser = getLocalCurrentUser();
        if (!localUser) {
          router.push('/subscription?reason=error');
          setLoading(false);
          return;
        }

        const email = localUser.email;

        // --- SINCRONIZAÇÃO AUTOMÁTICA:
        // garante que o Supabase tenha o registro e que localStorage possua userEmail
        try {
          if (localUser?.email) {
            await saveUser(localUser.email, {
              updated_at: new Date().toISOString()
            });

            // garante a chave usada pelo checkout
            try { localStorage.setItem('userEmail', localUser.email); } catch(e) {}
          }
        } catch (e) {
          console.error("Erro ao sincronizar usuário após login:", e);
        }
        // -------------------------------------------------------

        try {
          // Fallback para contas locais
          if (!isConfigured() || !supabase) {
            router.push('/dashboard');
            setLoading(false);
            return;
          }

          const { data: user, error: supabaseError } = await supabase
            .from('users')
            .select('is_lifetime, access_expires_at, subscription_status, payment_verified')
            .eq('email', email)
            .single();

          // Conta local sem Supabase
          if (!user || supabaseError) {
            router.push('/dashboard');
            setLoading(false);
            return;
          }

          const now = new Date();
          const expires = user.access_expires_at ? new Date(user.access_expires_at) : null;

          // 1. Usuário vitalício
          if (user.is_lifetime === true) {
            router.push('/dashboard');
            setLoading(false);
            return;
          }

          // 2. Acesso por data
          if (expires && expires > now) {
            router.push('/dashboard');
            setLoading(false);
            return;
          }

          // 3. Assinatura Stripe ativa
          if (user.subscription_status === 'active' && user.payment_verified === true) {
            router.push('/dashboard');
            setLoading(false);
            return;
          }

          // Sem acesso
          router.push('/subscription?reason=inactive');
          setLoading(false);
        } catch (accessError) {
          console.error('Erro na verificação de acesso:', accessError);
          router.push('/subscription?reason=error');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 glass">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-primary" />
              <span className="font-bold text-2xl">MindFix</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">
              Entre para continuar sua jornada
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="seu@email.com" className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password">Senha</Label>
                <Link href="/recuperar-senha" className="text-sm text-primary hover:underline">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Sua senha" className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary" size="lg" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="text-primary hover:underline font-semibold">Criar conta grátis</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
