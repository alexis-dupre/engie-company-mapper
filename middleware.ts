/**
 * Middleware Next.js - Protection des routes admin
 * Redirige vers /admin/login si non authentifié
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes admin à protéger (sauf /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_session')?.value;

    // Vérifier le token
    if (!token || !verifySessionToken(token)) {
      // Rediriger vers la page de login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Si déjà connecté et on tente d'accéder à /admin/login, rediriger vers dashboard
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin_session')?.value;

    if (token && verifySessionToken(token)) {
      const redirectUrl = request.nextUrl.searchParams.get('redirect');
      const dashboardUrl = new URL(redirectUrl || '/admin/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Configuration des routes à surveiller
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - api (API routes)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
