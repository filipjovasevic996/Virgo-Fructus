import { type NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

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
