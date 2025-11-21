'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getLocalCurrentUser } from '@/lib/local-auth';
import { supabase, isConfigured } from '@/lib/supabase';

// Rotas públicas que NÃO precisam de proteção
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/planos',
  '/plans',
  '/subscription',
];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const checkAccess = async () => {
    try {
      // 1) Rota pública → liberar
      const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
      if (isPublic) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // 2) Verificar login local (localStorage)
      const currentUser = getLocalCurrentUser();
      if (!currentUser) {
        router.push(`/login?redirect=${pathname}`);
        setIsChecking(false);
        return;
      }

      const email = currentUser.email;
      if (!email) {
        router.push(`/login?redirect=${pathname}`);
        setIsChecking(false);
        return;
      }

      // 3) Se Supabase NÃO estiver configurado → modo dev: liberar
      if (!isConfigured() || !supabase) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // 4) Buscar usuário no Supabase (APENAS campos novos)
      const { data: user, error } = await supabase
        .from('users')
        .select('is_lifetime, access_expires_at, subscription_status, payment_verified')
        .eq('email', email)
        .single();

      // Se houve erro ao buscar (p. ex. network / anon key incorreta) → REDIRECIONAR para /subscription?reason=error
      if (error) {
        console.error('Erro ao buscar usuário no Supabase:', error);
        router.push('/subscription?reason=error');
        setIsChecking(false);
        return;
      }

      // Se não existe usuário no Supabase → NÃO bloquear (pode ser conta local)
      if (!user) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // 5) Regras de autorização (ordem importante)

      // A) Conta vitalícia
      if (user.is_lifetime === true) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // B) Acesso por data (access_expires_at) — se houver e ainda for futuro
      if (user.access_expires_at) {
        const expires = new Date(user.access_expires_at);
        if (expires.getTime() > Date.now()) {
          setHasAccess(true);
          setIsChecking(false);
          return;
        }
      }

      // C) Assinatura Stripe ativa + pagamento verificado
      if (user.subscription_status === 'active' && user.payment_verified === true) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Senão → bloquear
      router.push('/subscription?reason=inactive');
      setIsChecking(false);
      return;
    } catch (err) {
      console.error('Erro no ProtectedRoute:', err);
      router.push('/subscription?reason=error');
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando acesso...
      </div>
    );
  }

  if (!hasAccess) return null;
  return <>{children}</>;
}