'use client'

import { useRouter } from 'next/navigation'
import { useI18n, type Locale } from '@/lib/i18n'
import { localizePath, stripLocalePath, isBlogPath } from '@/lib/i18n/routing'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'

const locales: { value: Locale; label: string; flag: string }[] = [
  { value: 'sr', label: 'SR', flag: '🇷🇸' },
  { value: 'en', label: 'EN', flag: '🇬🇧' },
]

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { pathname } = useLocalizedPath()
  const { locale } = useI18n()
  const router = useRouter()

  const switchTo = async (target: Locale) => {
    if (target === locale) return

    const currentPath = pathname ?? '/'

    if (isBlogPath(currentPath)) {
      try {
        const res = await fetch(
          `/api/blog/locale-path?path=${encodeURIComponent(currentPath)}&locale=${target}`,
        )
        if (res.ok) {
          const data = (await res.json()) as { path: string }
          router.push(data.path)
          return
        }
      } catch {
        // fall through to default path swap
      }
    }

    router.push(localizePath(stripLocalePath(currentPath), target))
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {locales.map((loc) => (
        <button
          key={loc.value}
          type="button"
          onClick={() => switchTo(loc.value)}
          className={`cursor-pointer px-2 py-1 text-xs font-sans font-medium rounded transition-colors ${
            locale === loc.value
              ? 'bg-lime/20 text-lime-dark'
              : 'text-text-nav hover:text-text-nav-hover'
          }`}
          aria-label={`Switch to ${loc.label}`}
        >
          <span className="mr-0 sm:mr-1">{loc.flag}</span>
          <span className="hidden sm:inline">{loc.label}</span>
        </button>
      ))}
    </div>
  )
}
