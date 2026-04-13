import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'vf_admin_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8 // 8 hours

function getAdminSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET environment variable')
  }
  return secret
}

function signPayload(payload: string) {
  return createHmac('sha256', getAdminSecret()).update(payload).digest('hex')
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function createSessionToken() {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const payload = `${expiresAt}`
  const signature = signPayload(payload)
  return `${payload}.${signature}`
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false

  const [expiresAtRaw, signature] = token.split('.')
  if (!expiresAtRaw || !signature) return false

  const expectedSignature = signPayload(expiresAtRaw)
  if (!safeCompare(signature, expectedSignature)) return false

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt)) return false
  if (Date.now() > expiresAt) return false

  return true
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

export function verifyAdminCredentials(identifier: string, password: string) {
  const adminLogin = process.env.ADMIN_LOGIN
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword || (!adminLogin && !adminEmail)) {
    throw new Error(
      'Missing admin credentials env vars. Set ADMIN_PASSWORD and ADMIN_LOGIN or ADMIN_EMAIL.'
    )
  }

  const normalizedIdentifier = identifier.trim().toLowerCase()
  const allowedIdentifiers = [adminLogin, adminEmail]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toLowerCase())

  const validIdentifier = allowedIdentifiers.some((value) =>
    safeCompare(value, normalizedIdentifier)
  )

  const validPassword = safeCompare(adminPassword, password)
  return validIdentifier && validPassword
}

export function sessionCookieConfig() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  }
}

export function clearSessionCookieConfig() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}
