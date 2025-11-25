// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Rotas públicas que não exigem login
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/planos',
  '/plans',
  '/subscription',
  '/api/stripe/webhook',
  '/api/stripe/create-checkout-session',
];

// Conta vitalícia — sempre tem acesso
const LIFETIME_EMAIL = 'salvador.programs@gmail.com';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Criar cliente Supabase compatível com SSR (LE OS COOKIES CORRETAMENTE)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  try {
    // Obter sessão do usuário (AGORA FUNCIONA)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log('Middleware: sem sessão, redirecionando para login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Buscar informações do usuário na tabela
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(
        'is_lifetime, subscription_status, payment_verified, access_expires_at, email'
      )
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      console.log('Middleware: usuário não encontrado');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Conta vitalícia → acesso liberado
    if (user.is_lifetime === true || user.email === LIFETIME_EMAIL) {
      return NextResponse.next();
    }

    // Validar assinatura
    const now = new Date();
    const expiresAt = user.access_expires_at
      ? new Date(user.access_expires_at)
      : null;

    const hasActiveSubscription =
      user.subscription_status === 'active' &&
      user.payment_verified === true;

    const hasValidExpiration = expiresAt && expiresAt > now;

    if (hasActiveSubscription || hasValidExpiration) {
      return NextResponse.next();
    }

    // Acesso negado → assinatura inativa → mandar pra página de planos
    console.log('Middleware: assinatura inativa → redirect /subscription');
    return NextResponse.redirect(
      new URL('/subscription?reason=inactive', request.url)
    );
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    // Protege todas as rotas, exceto assets, APIs e arquivos públicos
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
