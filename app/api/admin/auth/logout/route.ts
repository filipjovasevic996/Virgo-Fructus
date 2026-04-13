import { NextResponse } from 'next/server'
import { clearSessionCookieConfig } from '@/lib/admin-auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(clearSessionCookieConfig())
  return response
}
