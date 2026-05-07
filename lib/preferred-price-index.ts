import type { Product } from '@/lib/products'
import { parseWeightToGrams } from '@/lib/parse-weight-grams'

/**
 * Index of the price entry to surface as the default selection.
 * Pure function — runs identically on the server (SSR) and the client
 * so initial markup matches first-paint state.
 */
export function preferredPriceIndex(product: Pick<Product, 'prices' | 'pricingMode'>): number {
  if (!product.prices?.length) return 0

  const effectivePrice = (idx: number) => {
    const entry = product.prices[idx]
    if (!entry) return 0
    return typeof entry.salePrice === 'number' && entry.salePrice > 0
      ? entry.salePrice
      : entry.price
  }

  const nonZeroIndices = product.prices
    .map((_, idx) => idx)
    .filter((idx) => effectivePrice(idx) > 0)

  if (nonZeroIndices.length === 0) return 0
  if (product.pricingMode === 'quantity') return nonZeroIndices[0]

  return nonZeroIndices.sort((a, b) => {
    const gramsA = parseWeightToGrams(product.prices[a]?.weight || '') || Number.POSITIVE_INFINITY
    const gramsB = parseWeightToGrams(product.prices[b]?.weight || '') || Number.POSITIVE_INFINITY
    return gramsA - gramsB
  })[0]
}
