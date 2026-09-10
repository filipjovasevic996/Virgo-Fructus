import { type NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, isR2Configured } from '@/lib/r2'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export async function POST(request: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({ error: 'R2 is not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const key = `vigor-fructus/products/${crypto.randomUUID()}.${EXTENSION_BY_TYPE[file.type]}`

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(bytes),
        ContentType: file.type,
        // Ključ je UUID i nikad se ne menja/prepisuje — bezbedno za trajno keširanje na CDN-u,
        // što drži Class B read-ove ka R2-u na minimumu.
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )

    return NextResponse.json({
      url: `${R2_PUBLIC_URL}/${key}`,
      publicId: key,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({ error: 'R2 is not configured' }, { status: 500 })
    }

    const { url } = await request.json()

    if (!url || typeof url !== 'string' || !url.startsWith(R2_PUBLIC_URL)) {
      return NextResponse.json({ error: 'Could not determine object key' }, { status: 400 })
    }

    const key = url.slice(R2_PUBLIC_URL.length).replace(/^\/+/, '')
    if (!key) {
      return NextResponse.json({ error: 'Could not determine object key' }, { status: 400 })
    }

    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
