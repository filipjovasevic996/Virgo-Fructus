import sr from './sr.json'
import en from './en.json'
import type { Locale } from './index'

const messages: Record<Locale, Record<string, unknown>> = {
  sr: sr as Record<string, unknown>,
  en: en as Record<string, unknown>,
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

/** Server-safe translator. Mirrors `useI18n().t` but works inside Server Components. */
export function getTranslator(locale: Locale) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    let value = getNestedValue(messages[locale], key)
    if (!value) value = getNestedValue(messages.sr, key)
    if (!value) return key

    if (vars) {
      for (const [varKey, varValue] of Object.entries(vars)) {
        value = value.replace(`{${varKey}}`, String(varValue))
      }
    }
    return value
  }
}
