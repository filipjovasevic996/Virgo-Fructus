/**
 * Cloudinary `f_auto` often prefers JPEG for photos — JPEG cannot hold alpha,
 * so transparent PNG/WebP areas become white unless we request transparency preservation.
 *
 * Prepends `fl_preserve_transparency` into the delivery URL transformation chain.
 * Non‑Cloudinary URLs pass through unchanged.
 */
export function cloudinaryProductImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return url
  const lower = url.toLowerCase()
  if (!lower.includes('res.cloudinary.com/image/upload')) return url
  if (/fl_preserve_transparency/i.test(url)) return url

  const marker = '/image/upload/'
  const pos = lower.indexOf(marker)
  if (pos === -1) return url

  const prefix = url.slice(0, pos + marker.length)
  const rest = url.slice(pos + marker.length)

  // upload/v1699…/public_id (only version segment)
  if (/^v\d+\//.test(rest)) {
    return `${prefix}fl_preserve_transparency/${rest}`
  }

  const vSlash = rest.match(/\/(v\d+)\//)
  if (!vSlash || vSlash.index === undefined) {
    return url
  }

  const cut = vSlash.index
  const transforms = rest.slice(0, cut).replace(/^\/+/, '')
  const fromVersion = rest.slice(cut)

  const chain = transforms
    ? `fl_preserve_transparency,${transforms}${fromVersion}`
    : `fl_preserve_transparency${fromVersion}`

  return `${prefix}${chain}`
}
