export type PriceEntry = {
  weight?: string
  quantity?: number
  price: number
  salePrice?: number
  pricingMode?: 'weight' | 'quantity'
}

export function effectivePrice(entry: PriceEntry | undefined | null): number | null {
  if (!entry) return null
  if (typeof entry.salePrice === 'number' && entry.salePrice > 0) return entry.salePrice
  if (typeof entry.price === 'number' && entry.price > 0) return entry.price
  return null
}

/** Subset of `prices` that has a real, positive effective price. */
export function validPriceEntries<T extends PriceEntry>(prices: T[]): T[] {
  return prices.filter((p) => effectivePrice(p) !== null)
}

/** Lowest effective price across valid entries, or `null` if there are none. */
export function lowestEffectivePrice(prices: PriceEntry[]): number | null {
  const valid = validPriceEntries(prices)
  if (valid.length === 0) return null
  return Math.min(...valid.map((p) => effectivePrice(p) as number))
}
