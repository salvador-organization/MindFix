import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
