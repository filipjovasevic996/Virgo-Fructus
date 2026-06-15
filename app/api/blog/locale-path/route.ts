import { NextResponse } from 'next/server'
import { resolveBlogLocalePath } from '@/lib/blog/locale-path'
import type { Locale } from '@/lib/i18n'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const locale = searchParams.get('locale')

  if (!path || (locale !== 'sr' && locale !== 'en')) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const resolved = await resolveBlogLocalePath(path, locale as Locale)
  return NextResponse.json({ path: resolved })
}
