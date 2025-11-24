import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js';

// Rotas públicas que não precisam de autenticação
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

// Conta vitalícia - sempre tem acesso
const LIFETIME_EMAIL = 'salvador.programs@gmail.com';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se é rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Criar cliente Supabase para validação
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Verificar se há sessão ativa
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.log('Middleware: sessão não encontrada, redirecionando para login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Buscar dados do usuário no Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_lifetime, subscription_status, payment_verified, access_expires_at, email')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      console.log('Middleware: usuário não encontrado, redirecionando para login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 🔒 BYPASS: conta vitalícia sempre tem acesso
    if (user.is_lifetime === true || user.email === LIFETIME_EMAIL) {
      return NextResponse.next();
    }

    // Verificar assinatura ativa
    const now = new Date();
    const expiresAt = user.access_expires_at ? new Date(user.access_expires_at) : null;

    const hasActiveSubscription =
      user.subscription_status === 'active' && user.payment_verified === true;

    const hasValidExpiration = expiresAt && expiresAt > now;

    if (hasActiveSubscription || hasValidExpiration) {
      return NextResponse.next();
    }

    // Sem acesso - redirecionar para subscription
    console.log('Middleware: acesso negado, redirecionando para subscription');
    return NextResponse.redirect(new URL('/subscription?reason=inactive', request.url));

  } catch (error) {
    console.error('Middleware error:', error);
    // Em caso de erro, redirecionar para login
    return NextResponse.redirect(new URL('/login', request.url));
  }
=======

/**
 * MIDDLEWARE MINIMALISTA
 * 
 * Este middleware NÃO faz validação de autenticação ou assinatura.
 * Toda a lógica de proteção de rotas foi movida para o client-side.
 * 
 * O middleware serve apenas para:
 * - Configurações técnicas de headers
 * - Redirecionamentos técnicos (se necessário)
 * - NUNCA bloqueia acesso baseado em autenticação
 */

export async function middleware(request: NextRequest) {
  // Apenas retorna next() - sem validações
  return NextResponse.next();
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
<<<<<<< HEAD
     * - api routes (vamos proteger apenas páginas)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
=======
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
>>>>>>> d39087cde5feec399230e3e6916840f20a10d4e4
  ],
};
