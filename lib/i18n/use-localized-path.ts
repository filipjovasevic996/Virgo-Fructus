'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { localizePath, pathnameLocale } from '@/lib/i18n/routing'
import type { Locale } from '@/lib/i18n'

/** Current locale from URL and helper to prefix internal links. */
export function useLocalizedPath() {
  const pathname = usePathname() ?? '/'
  const locale = useMemo(() => pathnameLocale(pathname), [pathname])

  const withLocale = useCallback(
    (path: string) => localizePath(path, locale),
    [locale],
  )

  return { locale, withLocale, pathname }
}

/** Opposite locale for language switch (same path, other language version). */
export function useAlternateLocalePath(): Locale {
  const pathname = usePathname() ?? '/'
  const locale = pathnameLocale(pathname)
  return locale === 'sr' ? 'en' : 'sr'
}
