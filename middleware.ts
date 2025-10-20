import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

export function middleware(request: NextRequest) {
  // Vérification simple sans JWT pour éviter les erreurs Edge
  const authHeader = request.headers.get('authorization')

  if (!authHeader && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}
