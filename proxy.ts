import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_SESSION_COOKIE = 'vf_admin_session'

const ADMIN_LOGIN_PATH = '/admin/login'

function isAuthApi(pathname: string) {
  return pathname.startsWith('/api/admin/auth')
}

function isProtectedAdminPath(pathname: string) {
  return pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
}

async function verifySessionToken(token?: string) {
  if (!token) return false
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return false

  const [expiresAtRaw, signature] = token.split('.')
  if (!expiresAtRaw || !signature) return false

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(expiresAtRaw))
  const expectedSignature = Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return signature === expectedSignature
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedAdminPath(pathname)) {
    return NextResponse.next()
  }

  const isAuthenticated = await verifySessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  )

  if (pathname === ADMIN_LOGIN_PATH) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  if (isAuthApi(pathname)) {
    return NextResponse.next()
  }

  if (isAuthenticated) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
