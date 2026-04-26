import { parseWeightToGrams } from '@/lib/parse-weight-grams'
import { kgToDecigrams } from '@/lib/stock-kg'

export type CartLineRef = Pick<{ id: string; weight: string; quantity: number }, 'id' | 'weight' | 'quantity'>

/**
 * Maximum packages of (`productId`, `weight`) allowed given `stockKg`
 * and other cart lines for the same product (shared pool, 0.1 g resolution).
 */
export function maxQuantityForCartLine(
  productId: string,
  weight: string,
  stockKg: number,
  cartItems: CartLineRef[],
  pricingMode: 'weight' | 'quantity' = 'weight',
): number {
  if (pricingMode === 'quantity') {
    const stockUnits = Math.max(0, Math.floor(stockKg))
    const totalUnitsInCart = cartItems
      .filter((item) => item.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
    const currentLineUnits =
      cartItems.find((i) => i.id === productId && i.weight === weight)?.quantity ?? 0
    const remainingUnits = stockUnits - (totalUnitsInCart - currentLineUnits)
    return Math.max(0, remainingUnits)
  }

  const stockDg = kgToDecigrams(stockKg)
  const unitG = parseWeightToGrams(weight)
  if (!stockDg || !unitG) return 0

  const unitDg = unitG * 10

  let totalDg = 0
  for (const item of cartItems) {
    if (item.id !== productId) continue
    const ug = parseWeightToGrams(item.weight)
    if (!ug) continue
    totalDg += ug * 10 * item.quantity
  }

  const line = cartItems.find((i) => i.id === productId && i.weight === weight)
  const currentLineDg = line ? unitG * 10 * line.quantity : 0
  const othersDg = totalDg - currentLineDg
  const remainingDg = stockDg - othersDg

  return Math.max(0, Math.floor(remainingDg / unitDg))
}
