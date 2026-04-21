import { cloudinaryProductImageUrl } from '@/lib/cloudinary-delivery-url'

/**
 * Turns stored product image values into absolute URLs for SEO (sitemap, OG, JSON-LD).
 * Supports full URLs, site-relative paths, and bare Cloudinary public IDs (folder paths).
 */

function cloudinaryCloudName(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    undefined
  )
}

function looksLikeCloudinaryPublicId(s: string): boolean {
  if (s.length < 2 || s.length > 512) return false
  if (/\s/.test(s)) return false
  if (s.includes('://')) return false
  if (s.startsWith('/')) return false
  return /^[a-zA-Z0-9_\-/.]+$/.test(s)
}

export function resolveProductImageUrl(
  src: string,
  siteUrl: string,
): string | undefined {
  const s = src.trim()
  if (!s) return undefined
  const base = siteUrl.replace(/\/+$/, '')
  if (s.startsWith('https://') || s.startsWith('http://')) {
    return cloudinaryProductImageUrl(s)
  }
  if (s.startsWith('/')) return `${base}${s}`
  const cloud = cloudinaryCloudName()
  if (cloud && looksLikeCloudinaryPublicId(s)) {
    return cloudinaryProductImageUrl(
      `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/${s}`,
    )
  }
  return undefined
}

export function firstResolvedProductImage(
  images: unknown,
  fallbackSingle: string | null | undefined,
  siteUrl: string,
): string | undefined {
  if (Array.isArray(images)) {
    for (const img of images) {
      if (typeof img !== 'string') continue
      const url = resolveProductImageUrl(img, siteUrl)
      if (url) return url
    }
  }
  if (fallbackSingle) {
    return resolveProductImageUrl(fallbackSingle, siteUrl)
  }
  return undefined
}

export function allResolvedProductImageUrls(
  images: unknown,
  fallbackSingle: string | null | undefined,
  siteUrl: string,
): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const push = (raw: string) => {
    const u = resolveProductImageUrl(raw, siteUrl)
    if (u && !seen.has(u)) {
      seen.add(u)
      out.push(u)
    }
  }
  if (Array.isArray(images)) {
    for (const img of images) {
      if (typeof img === 'string') push(img)
    }
  }
  if (fallbackSingle) push(fallbackSingle)
  return out
}
