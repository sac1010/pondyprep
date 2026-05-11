import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/exam', '/tests/random', '/tests/mini']
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password']

const CANONICAL_HOST = 'pondyprep.in'

function isCanonicalHost(host: string | null): boolean {
  if (!host) return false
  return host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host')
  const canonical = isCanonicalHost(host)

  // On non-canonical hosts (vercel preview, localhost, etc.), block crawlers
  // by serving a blocking robots.txt — overrides app/robots.ts for those hosts.
  if (!canonical && pathname === '/robots.txt') {
    return new NextResponse('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isProtected && user && !user.email_confirmed_at) {
    return NextResponse.redirect(new URL('/verify-email', request.url))
  }

  // Tell search engines not to index any non-canonical host.
  if (!canonical) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
