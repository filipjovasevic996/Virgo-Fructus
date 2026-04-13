'use client'

import { useI18n, type Locale } from '@/lib/i18n'

const locales: { value: Locale; label: string; flag: string }[] = [
  { value: 'sr', label: 'SR', flag: '🇷🇸' },
  { value: 'en', label: 'EN', flag: '🇬🇧' },
]

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n()

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {locales.map((loc) => (
        <button
          key={loc.value}
          onClick={() => setLocale(loc.value)}
          className={`cursor-pointer px-2 py-1 text-xs font-sans font-medium rounded transition-colors ${
            locale === loc.value
              ? 'bg-lime/20 text-lime-dark'
              : 'text-text-nav hover:text-text-nav-hover'
          }`}
          aria-label={`Switch to ${loc.label}`}
        >
          <span className="mr-1">{loc.flag}</span>
          {loc.label}
        </button>
      ))}
    </div>
  )
}
