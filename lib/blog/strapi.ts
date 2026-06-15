import 'server-only'
import { cache } from 'react'
import type { BlogAuthor, BlogCategory, BlogLocale, BlogPost } from './types'

/**
 * Strapi 5 REST client for the `article` collection type.
 *
 * ─── Recommended Strapi setup ───────────────────────────────────────
 *
 * 1. Enable the **Internationalization (i18n)** plugin.
 *    Locales: `sr` (default) and `en`.
 *
 * 2. Create collection type **Article** (`article`) with fields:
 *
 *    | Field         | Type              | Localized | Notes
 *    |---------------|-------------------|-----------|------------------------------
 *    | title         | Text (short)      | ✅        | Required
 *    | slug          | UID (from title)  | ✅        | Required — can differ per locale
 *    | excerpt       | Text (long)       | ✅        | ≤300 chars, meta + cards
 *    | content       | Rich text (Markdown) or Text (long) | ✅ | Markdown body
 *    | author        | Text (short)      | ✅        | Default "Vigor Fructus"
 *    | readingTime   | Integer           | ❌        | Optional minutes override
 *    | category      | Relation → Category | ❌        | `categories` collection
 *    | coverImage    | Media (single)    | ❌        | Optional hero/card image
 *    | publishedAt   | DateTime          | ❌        | Used for sorting (or use createdAt)
 *
 *    Enable **Draft & Publish** on the collection.
 *
 * 3. Settings → Users & Permissions → Public role:
 *    - `article.find` ✅
 *    - `article.findOne` ✅
 *
 * 4. Create a **Read-only API Token** (Settings → API Tokens).
 *
 * 5. Env vars on Next.js (Vercel):
 *      STRAPI_URL=https://your-strapi-host.com
 *      STRAPI_API_TOKEN=...
 *      STRAPI_COLLECTION=articles   # plural REST ID if not `articles`
 *      STRAPI_CATEGORIES_COLLECTION=categories
 *
 * Why localized slug (not shared slug):
 *   `/blog/pet-vocki-za-gin-tonik` vs `/en/blog/five-fruits-for-gin-tonic`
 *   is better for SEO in each language. Strapi links locale versions via
 *   `documentId` + `localizations` — we use that for hreflang alternates.
 *
 * If Strapi is unset or unreachable, all loaders return [] / null and the
 * blog index shows an empty state (no crash).
 */

const STRAPI_URL = (process.env.STRAPI_URL || '').replace(/\/+$/, '')
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ''
/** REST plural API ID, e.g. `articles` or `blog-posts`. */
const STRAPI_COLLECTION = (process.env.STRAPI_COLLECTION || 'articles').replace(
  /^\/+|\/+$/g,
  '',
)
const STRAPI_CATEGORIES_COLLECTION = (
  process.env.STRAPI_CATEGORIES_COLLECTION || 'categories'
).replace(/^\/+|\/+$/g, '')
const REVALIDATE_SECONDS = 60

type StrapiCategoryRaw = {
  documentId: string
  slug: string
  name: string
}

type StrapiAuthorRaw = {
  documentId: string
  name: string
  bio?: string | null
  avatar?: StrapiMedia | null
}

type StrapiImageFormat = {
  url: string
  width?: number
  height?: number
}

type StrapiMedia = {
  url: string
  alternativeText?: string | null
  width?: number
  height?: number
  formats?: {
    large?: StrapiImageFormat
    medium?: StrapiImageFormat
    small?: StrapiImageFormat
  } | null
}

type StrapiLocalization = {
  slug: string
  locale: BlogLocale
}

type StrapiArticleRaw = {
  documentId: string
  title: string
  slug: string
  excerpt?: string | null
  content?: unknown
  author?: StrapiAuthorRaw | string | null
  readingTime?: number | null
  category?: StrapiCategoryRaw | null
  publishedAt?: string | null
  createdAt?: string | null
  locale: BlogLocale
  coverImage?: StrapiMedia | null
  localizations?: StrapiLocalization[]
}

type StrapiListResponse = {
  data: StrapiArticleRaw[]
  meta?: { pagination?: { total: number } }
}

type StrapiCategoriesResponse = {
  data: StrapiCategoryRaw[]
}

function isConfigured() {
  return STRAPI_URL.length > 0
}

function headers(): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (STRAPI_TOKEN) h.Authorization = `Bearer ${STRAPI_TOKEN}`
  return h
}

function absoluteMediaUrl(rawUrl: string) {
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl
  return `${STRAPI_URL}${rawUrl}`
}

function pickImage(media: StrapiMedia) {
  const fmt = media.formats
  const chosen = fmt?.large ?? fmt?.medium ?? fmt?.small
  if (chosen) {
    return {
      url: absoluteMediaUrl(chosen.url),
      width: chosen.width,
      height: chosen.height,
    }
  }
  return {
    url: absoluteMediaUrl(media.url),
    width: media.width,
    height: media.height,
  }
}

/** Coerce Strapi rich text / blocks / plain string into Markdown for the renderer. */
function normalizeContent(raw: unknown): string {
  if (typeof raw === 'string') return raw
  if (!Array.isArray(raw)) return ''

  const segments: string[] = []
  let imageLines: string[] = []

  const flushImages = () => {
    if (imageLines.length) {
      segments.push(imageLines.join('\n'))
      imageLines = []
    }
  }

  for (const block of raw) {
    if (!block || typeof block !== 'object') continue
    const b = block as Record<string, unknown>

    if (b.type === 'image' && b.image && typeof b.image === 'object') {
      const img = b.image as { url?: string; alternativeText?: string | null }
      if (typeof img.url === 'string') {
        const alt = img.alternativeText?.trim() || ''
        imageLines.push(`![${alt}](${absoluteMediaUrl(img.url)})`)
        continue
      }
    }

    flushImages()

    if (b.type === 'paragraph' && Array.isArray(b.children)) {
      const text = (b.children as Array<{ text?: string }>)
        .map((c) => c.text ?? '')
        .join('')
      if (text) segments.push(text)
      continue
    }
    if (b.type === 'list' && Array.isArray(b.children)) {
      const ordered = b.format === 'ordered'
      const items = (b.children as Array<{ type?: string; children?: Array<{ text?: string }> }>)
        .filter((child) => child.type === 'list-item')
        .map((child) => (child.children ?? []).map((c) => c.text ?? '').join(''))
        .filter(Boolean)
      if (items.length) {
        segments.push(
          items.map((item, i) => (ordered ? `${i + 1}. ${item}` : `- ${item}`)).join('\n'),
        )
      }
      continue
    }
    if (typeof b.text === 'string' && b.text) {
      segments.push(b.text)
    }
  }

  flushImages()
  return segments.join('\n\n')
}

function normalizeCategory(raw: StrapiCategoryRaw | null | undefined): BlogCategory | null {
  if (!raw?.documentId || !raw.slug || !raw.name) return null
  return {
    documentId: raw.documentId,
    slug: raw.slug,
    name: raw.name,
  }
}

function normalizeAuthor(
  raw: StrapiAuthorRaw | string | null | undefined,
): BlogAuthor | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    const name = raw.trim()
    return name ? { documentId: '', name } : null
  }
  if (!raw.name?.trim()) return null

  const avatarMedia = raw.avatar
  let avatar: BlogAuthor['avatar']
  if (avatarMedia) {
    const thumb = avatarMedia.formats?.thumbnail ?? avatarMedia.formats?.small
    avatar = {
      url: absoluteMediaUrl(thumb?.url ?? avatarMedia.url),
      alt: avatarMedia.alternativeText?.trim() || raw.name,
    }
  }

  return {
    documentId: raw.documentId,
    name: raw.name.trim(),
    bio: raw.bio?.trim() || undefined,
    avatar,
  }
}

function alternateSlug(article: StrapiArticleRaw, locale: BlogLocale): string {
  const otherLocale: BlogLocale = locale === 'sr' ? 'en' : 'sr'
  const match = article.localizations?.find((l) => l.locale === otherLocale)
  return match?.slug ?? article.slug
}

function normalizeArticle(article: StrapiArticleRaw, locale: BlogLocale): BlogPost {
  const cover = article.coverImage
  const picked = cover ? pickImage(cover) : null
  const publishedAt =
    article.publishedAt ?? article.createdAt ?? new Date(0).toISOString()

  return {
    documentId: article.documentId,
    slug: article.slug,
    alternateSlug: alternateSlug(article, locale),
    locale,
    title: article.title,
    excerpt: article.excerpt ?? '',
    content: normalizeContent(article.content),
    category: normalizeCategory(article.category),
    author: normalizeAuthor(article.author),
    publishedAt,
    readingTimeMinutes: article.readingTime ?? undefined,
    coverImage: picked
      ? {
          url: picked.url,
          alt: cover?.alternativeText?.trim() || article.title,
          width: picked.width,
          height: picked.height,
        }
      : undefined,
  }
}

function listQuery(locale: BlogLocale, extra?: Record<string, string>) {
  return new URLSearchParams({
    locale,
    status: 'published',
    'sort[0]': 'publishedAt:desc',
    'pagination[pageSize]': '100',
    'populate[coverImage]': 'true',
    'populate[category][fields][0]': 'documentId',
    'populate[category][fields][1]': 'slug',
    'populate[category][fields][2]': 'name',
    'populate[author][fields][0]': 'documentId',
    'populate[author][fields][1]': 'name',
    'populate[author][fields][2]': 'bio',
    'populate[author][populate][avatar][fields][0]': 'url',
    'populate[author][populate][avatar][fields][1]': 'alternativeText',
    'populate[author][populate][avatar][fields][2]': 'formats',
    'populate[localizations][fields][0]': 'slug',
    'populate[localizations][fields][1]': 'locale',
    ...extra,
  }).toString()
}

async function strapiFetch<T>(path: string): Promise<T | null> {
  if (!isConfigured()) return null
  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      headers: headers(),
      next: { revalidate: REVALIDATE_SECONDS, tags: ['blog', 'strapi'] },
    })
    if (!res.ok) {
      console.warn(`[blog/strapi] ${path} → HTTP ${res.status}`)
      return null
    }
    return (await res.json()) as T
  } catch (error) {
    console.warn('[blog/strapi] fetch failed', error)
    return null
  }
}

export const getAllCategories = cache(async function getAllCategories(
  locale: BlogLocale,
): Promise<BlogCategory[]> {
  const query = new URLSearchParams({
    locale,
    status: 'published',
    'sort[0]': 'name:asc',
    'pagination[pageSize]': '100',
    'fields[0]': 'documentId',
    'fields[1]': 'slug',
    'fields[2]': 'name',
  }).toString()

  const response = await strapiFetch<StrapiCategoriesResponse>(
    `/api/${STRAPI_CATEGORIES_COLLECTION}?${query}`,
  )
  if (!response?.data?.length) return []
  return response.data
    .map((row) => normalizeCategory(row))
    .filter((c): c is BlogCategory => c !== null)
})

export const getAllPosts = cache(async function getAllPosts(
  locale: BlogLocale,
): Promise<BlogPost[]> {
  const response = await strapiFetch<StrapiListResponse>(
    `/api/${STRAPI_COLLECTION}?${listQuery(locale)}`,
  )
  if (!response?.data?.length) return []
  return response.data.map((row) => normalizeArticle(row, locale))
})

export const getPostBySlug = cache(async function getPostBySlug(
  slug: string,
  locale: BlogLocale,
): Promise<BlogPost | null> {
  const query = listQuery(locale, {
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': '1',
  })
  const response = await strapiFetch<StrapiListResponse>(
    `/api/${STRAPI_COLLECTION}?${query}`,
  )
  const row = response?.data?.[0]
  return row ? normalizeArticle(row, locale) : null
})

/** Slug of the same Strapi document in another locale (via documentId). */
export const getPostSlugInLocale = cache(async function getPostSlugInLocale(
  documentId: string,
  locale: BlogLocale,
): Promise<string | null> {
  const query = new URLSearchParams({
    locale,
    status: 'published',
    'filters[documentId][$eq]': documentId,
    'fields[0]': 'slug',
    'pagination[pageSize]': '1',
  }).toString()
  const response = await strapiFetch<StrapiListResponse>(
    `/api/${STRAPI_COLLECTION}?${query}`,
  )
  return response?.data?.[0]?.slug ?? null
})

export async function getAllPostSlugs(locale: BlogLocale): Promise<string[]> {
  const posts = await getAllPosts(locale)
  return posts.map((p) => p.slug)
}

export async function getRelatedPosts(
  documentId: string,
  locale: BlogLocale,
): Promise<BlogPost[]> {
  const all = await getAllPosts(locale)
  const self = all.find((p) => p.documentId === documentId)
  if (!self) return []
  const sameCategory = all.filter(
    (p) =>
      p.documentId !== documentId &&
      self.category &&
      p.category?.documentId === self.category.documentId,
  )
  const others = all.filter(
    (p) =>
      p.documentId !== documentId &&
      (!self.category || p.category?.documentId !== self.category.documentId),
  )
  return [...sameCategory, ...others].slice(0, 3)
}

/** SR/EN slug pairs for sitemap hreflang (via Strapi localizations). */
export async function getAllBilingualSlugPairs(): Promise<
  { sr: string; en: string; publishedAt: string }[]
> {
  const srPosts = await getAllPosts('sr')
  return srPosts.map((p) => ({
    sr: p.slug,
    en: p.alternateSlug,
    publishedAt: p.publishedAt,
  }))
}

export function isStrapiConfigured() {
  return isConfigured()
}
