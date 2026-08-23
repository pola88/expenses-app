import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createRateLimiter } from '@/lib/rate-limit'

const isRateLimited = createRateLimiter(60_000, 10)

const RATE_LIMITED_PATHS = ['/api/auth/register', '/api/auth/signin']

export default auth((req) => {
  if (RATE_LIMITED_PATHS.includes(req.nextUrl.pathname)) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intentá de nuevo en un minuto.' },
        { status: 429 },
      )
    }
  }

  const isLoggedIn = !!req.auth
  const isAuthRoute =
    req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')

  if (isApiRoute) return NextResponse.next()
  if (!isLoggedIn && !isAuthRoute) return NextResponse.redirect(new URL('/login', req.url))
  if (isLoggedIn && isAuthRoute) return NextResponse.redirect(new URL('/', req.url))

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
