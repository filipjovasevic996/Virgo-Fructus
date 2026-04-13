import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { compare, hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adminUsersTable } from '@/lib/db/schema'

export const ADMIN_SESSION_COOKIE = 'vf_admin_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 2 // 2 hours
const BCRYPT_ROUNDS = 12

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

export async function verifyAdminCredentials(identifier: string, password: string) {
  const normalizedEmail = identifier.trim().toLowerCase()

  const user = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, normalizedEmail))
    .limit(1)
    .then((rows) => rows[0])

  if (!user) return false

  return compare(password, user.passwordHash)
}

export async function hashPassword(password: string) {
  return hash(password, BCRYPT_ROUNDS)
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
