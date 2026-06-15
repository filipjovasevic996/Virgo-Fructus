import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Strapi webhook target — call after publish/unpublish to refresh blog
 * pages without waiting for ISR (60s).
 *
 * Strapi → Settings → Webhooks → Create:
 *   URL: https://www.vigorfructus.com/api/revalidate?secret=YOUR_SECRET
 *   Events: entry.create, entry.update, entry.delete, entry.publish, entry.unpublish
 *   Headers: (optional) none — secret in query string is enough
 *
 * Env: REVALIDATE_SECRET=long-random-string
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidateTag('blog')
  revalidateTag('strapi')
  revalidatePath('/blog')
  revalidatePath('/en/blog')

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() })
}
