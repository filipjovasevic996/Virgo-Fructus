/**
 * Centralized hreflang/alternates generation.
 *
 * Why a helper:
 *   - Every bilingual page used to hardcode the same alternates.languages
 *     block. Drift between files (typos, missing locale, region mismatches)
 *     was only a matter of time.
 *   - Google parses hreflang as language-only BCP 47 codes (`sr`, `en`)
 *     unless the site truly differentiates by region. Region codes
 *     (`sr-RS`, `en-US`) restrict targeting — `en-US` does NOT match
 *     English speakers in Belgrade, the UK, or AU. We use language-only
 *     codes so the EN tree gets credit for every English query worldwide.
 *
 * Always pair the result with a self-canonical pointing at the current
 * locale's URL (canonical = the URL the page itself lives at).
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com'
).replace(/\/+$/, '')

export type LanguageAlternates = {
  sr: string
  en: string
  'x-default': string
}

/**
 * Build absolute hreflang URLs for a route that exists in both locales.
 *
 * @param srPath  Locale-neutral path on the SR tree, e.g. `/`, `/prodavnica`,
 *                `/proizvodi/limeta`. Leading slash required (except `''`).
 * @param enPath  Override the EN URL when it isn't simply `/en + srPath`
 *                (rare). Defaults to `/en` for `/`, otherwise `/en${srPath}`.
 *
 * `x-default` always points at the SR URL — Serbian is the primary market
 * and the canonical fallback for unmatched locales.
 */
export function buildLanguageAlternates(
  srPath: string,
  enPath?: string,
): LanguageAlternates {
  const normalizedSr = srPath === '' || srPath === '/' ? '' : srPath
  const sr = `${SITE_URL}${normalizedSr || '/'}`
  const en = enPath
    ? `${SITE_URL}${enPath}`
    : normalizedSr === ''
      ? `${SITE_URL}/en`
      : `${SITE_URL}/en${normalizedSr}`

  return {
    sr,
    en,
    'x-default': sr,
  }
}
