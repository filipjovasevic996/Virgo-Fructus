import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET() {
  try {
    const authenticated = await isAdminAuthenticated()
    return NextResponse.json({ authenticated })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
