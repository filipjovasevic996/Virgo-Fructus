/**
 * Delivery pricing rules:
 *   - Subtotal ≥ 4000 RSD: free delivery anywhere in Serbia.
 *   - Subtotal < 4000 RSD:
 *       • Belgrade territory → 450 RSD (included in checkout total)
 *       • Rest of Serbia → Post Express rates (not included in total)
 */

export const FREE_DELIVERY_THRESHOLD = 4000
export const BELGRADE_DELIVERY_FEE = 450

export type DeliveryKind = 'free' | 'belgrade' | 'postexpress'

export type DeliveryQuote = {
  kind: DeliveryKind
  /** Amount added to the order total. Always 0 for postexpress. */
  fee: number
  /** False when shipping is billed separately (Post Express). */
  includedInTotal: boolean
  isBelgrade: boolean
}

/** Strip diacritics and lowercase for fuzzy city matching. */
export function normalizeCityInput(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

/**
 * Belgrade city + all urban municipalities (customers often enter "Zemun"
 * or "Novi Beograd" without writing "Beograd").
 */
const BELGRADE_CITY_NAMES = new Set([
  'beograd',
  'belgrade',
  'barajevo',
  'vozdovac',
  'vracar',
  'grocka',
  'zvezdara',
  'zemun',
  'lazarevac',
  'mladenovac',
  'novi beograd',
  'obrenovac',
  'palilula',
  'rakovica',
  'savski venac',
  'sopot',
  'stari grad',
  'surcin',
  'cukarica',
])

export function isBelgradeTerritory(city: string): boolean {
  const normalized = normalizeCityInput(city)
  if (!normalized) return false
  if (BELGRADE_CITY_NAMES.has(normalized)) return true
  // "Beograd, Zemun" or similar compound entries
  if (normalized.includes('beograd') || normalized.includes('belgrade')) return true
  return false
}

export function getDeliveryQuote(
  subtotal: number,
  city: string | null | undefined,
): DeliveryQuote {
  const trimmedCity = city?.trim() ?? ''
  const isBelgrade = trimmedCity ? isBelgradeTerritory(trimmedCity) : true

  // Free shipping applies nationwide once the threshold is met.
  if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    return {
      kind: 'free',
      fee: 0,
      includedInTotal: true,
      isBelgrade: trimmedCity ? isBelgrade : true,
    }
  }

  // Below threshold — before city is known, show Belgrade estimate in cart.
  if (!trimmedCity) {
    return {
      kind: 'belgrade',
      fee: BELGRADE_DELIVERY_FEE,
      includedInTotal: true,
      isBelgrade: true,
    }
  }

  if (!isBelgrade) {
    return {
      kind: 'postexpress',
      fee: 0,
      includedInTotal: false,
      isBelgrade: false,
    }
  }

  return {
    kind: 'belgrade',
    fee: BELGRADE_DELIVERY_FEE,
    includedInTotal: true,
    isBelgrade: true,
  }
}
