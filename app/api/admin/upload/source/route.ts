import { type NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, isR2Configured } from '@/lib/r2'

/**
 * Vraća bajtove postojeće slike sa R2 sa istog domena kao admin panel.
 * Potrebno za ponovno sečenje: browser ne dozvoljava čitanje piksela sa
 * canvas-a za slike sa drugog domena (R2 javni URL nema CORS zaglavlja).
 * Ruta je zaštićena admin sesijom kroz proxy.ts (/api/admin/*).
 */
export async function GET(request: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({ error: 'R2 is not configured' }, { status: 500 })
    }

    const url = request.nextUrl.searchParams.get('url')
    if (!url || !url.startsWith(`${R2_PUBLIC_URL}/`)) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    const key = url.slice(R2_PUBLIC_URL.length).replace(/^\/+/, '')
    if (!key || key.includes('..')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    const object = await r2Client.send(
      new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
    )
    if (!object.Body) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const bytes = await object.Body.transformToByteArray()
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': object.ContentType ?? 'application/octet-stream',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('Image source error:', error)
    return NextResponse.json({ error: 'Could not load image' }, { status: 500 })
  }
}
