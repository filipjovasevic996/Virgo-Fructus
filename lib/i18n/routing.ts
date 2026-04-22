import type { Locale } from '@/lib/i18n'

/** Path-based locale: Serbian at site root, English under `/en`. */
export function pathnameLocale(pathname: string): Locale {
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en'
  return 'sr'
}

/**
 * `path` is a locale-neutral path (e.g. `/`, `/prodavnica`, `/proizvodi/foo`).
 * Home is `/` for Serbian and `/en` for English.
 */
export function localizePath(path: string, locale: Locale): string {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`

  if (locale === 'en') {
    if (normalized === '/') return '/en'
    return `/en${normalized}`
  }

  if (normalized === '/en') return '/'
  if (normalized.startsWith('/en/')) return normalized.slice(3) || '/'
  return normalized
}

/** Current URL as a locale-neutral path (e.g. `/prodavnica`, `/`) for switching languages. */
export function stripLocalePath(pathname: string): string {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/'
  return pathname
}
