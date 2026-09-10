/**
 * Turns stored product image values into absolute URLs for SEO (sitemap, OG, JSON-LD).
 * Supports full URLs and site-relative paths.
 */

export function resolveProductImageUrl(
  src: string,
  siteUrl: string,
): string | undefined {
  const s = src.trim()
  if (!s) return undefined
  const base = siteUrl.replace(/\/+$/, '')
  if (s.startsWith('https://') || s.startsWith('http://')) {
    return s
  }
  if (s.startsWith('/')) return `${base}${s}`
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
