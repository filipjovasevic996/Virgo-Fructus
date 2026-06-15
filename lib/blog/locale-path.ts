import 'server-only'
import type { Locale } from '@/lib/i18n'
import { localizePath, pathnameLocale, stripLocalePath } from '@/lib/i18n/routing'
import { getPostBySlug, getPostSlugInLocale } from '@/lib/blog/strapi'
import type { BlogLocale } from '@/lib/blog/types'

/** Target URL when switching locale on blog index or a blog post. */
export async function resolveBlogLocalePath(
  pathname: string,
  targetLocale: Locale,
): Promise<string> {
  const neutral = stripLocalePath(pathname)
  const blogIndex = localizePath('/blog', targetLocale)

  if (neutral === '/blog') return blogIndex

  const match = neutral.match(/^\/blog\/([^/]+)$/)
  if (!match) return localizePath(neutral, targetLocale)

  const currentLocale = pathnameLocale(pathname) as BlogLocale
  const slug = decodeURIComponent(match[1])
  const post = await getPostBySlug(slug, currentLocale)
  if (!post) return blogIndex

  const targetSlug = await getPostSlugInLocale(
    post.documentId,
    targetLocale as BlogLocale,
  )
  if (!targetSlug) return blogIndex

  return localizePath(`/blog/${targetSlug}`, targetLocale)
}
