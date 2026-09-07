import { type NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import cloudinary from '@/lib/cloudinary'
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

    // Novi upload-i idu na R2 čim su kredencijali podešeni u env-u (vidi lib/r2.ts).
    // Dok R2 nije konfigurisan, ponašanje ostaje identično kao pre — sve ide na Cloudinary.
    // FORCE_CLOUDINARY_UPLOADS=true privremeno zaobilazi R2 (npr. dok se čeka DNS propagacija) —
    // obrišite tu env promenljivu da se vratite na R2 bez ikakve druge izmene.
    if (isR2Configured() && process.env.FORCE_CLOUDINARY_UPLOADS !== 'true') {
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
    }

    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

    // Nemoj raditi fetch_format/auto na uploadu — može PNG/WebP alfu pretvoriti u JPEG (bela pozadina).
    // Kvalitet i format pri prikazu zadajemo u delivery URL-u (vidi lib/cloudinary-delivery-url.ts).
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'vigor-fructus/products',
    })

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    // Stare slike (pre migracije) su na Cloudinary-ju, nove na R2 — briši sa odgovarajućeg izvora.
    if (isR2Configured() && R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
      const key = url.slice(R2_PUBLIC_URL.length).replace(/^\/+/, '')
      if (!key) {
        return NextResponse.json({ error: 'Could not determine object key' }, { status: 400 })
      }

      await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }))

      return NextResponse.json({ success: true })
    }

    const publicId = extractPublicId(url)
    if (!publicId) {
      return NextResponse.json({ error: 'Could not determine public ID' }, { status: 400 })
    }

    await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}
