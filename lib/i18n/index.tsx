'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import sr from './sr.json'
import en from './en.json'

export type Locale = 'sr' | 'en'

const messages: Record<Locale, Record<string, Record<string, string>>> = { sr, en }

const STORAGE_KEY = 'vf_locale'
const DEFAULT_LOCALE: Locale = 'sr'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function setLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return
  document.cookie = `${STORAGE_KEY}=${locale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

function getSavedLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'sr') return saved
  return DEFAULT_LOCALE
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode
  /** From server cookies — must match first client render to avoid hydration mismatches */
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    const saved = getSavedLocale()
    setLocaleState(saved)
    document.documentElement.lang = saved
    setLocaleCookie(saved)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    setLocaleCookie(newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let value = getNestedValue(messages[locale] as Record<string, unknown>, key)
      if (!value) value = getNestedValue(messages.sr as Record<string, unknown>, key)
      if (!value) return key

      if (vars) {
        for (const [varKey, varValue] of Object.entries(vars)) {
          value = value.replace(`{${varKey}}`, String(varValue))
        }
      }
      return value
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
