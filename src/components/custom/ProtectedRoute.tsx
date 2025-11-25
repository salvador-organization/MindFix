'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getLocalCurrentUser } from '@/lib/local-auth';
import { supabase, isConfigured } from '@/lib/supabase';

// DEPRECATED: ProtectedRoute será removido após migração completa
// Proteção de rotas movida para middleware
console.warn('DEPRECATED: ProtectedRoute será removido. Proteção movida para middleware.');

// Rotas públicas que NÃO precisam de proteção (mantido para compatibilidade)
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
  const { status, loading, hasAccess } = useSubscription();

  useEffect(() => {
    // Verificar se é rota pública
    const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    if (isPublic) {
      return; // Permitir acesso
    }

    // Se não está carregando e não tem acesso, redirecionar
    if (!loading && !hasAccess) {
      router.push('/subscription?reason=inactive');
    }
  }, [pathname, loading, hasAccess, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando acesso...
      </div>
    );
  }

  if (!hasAccess) return null;
  return <>{children}</>;
}