export type PriceEntryLike = {
  weight?: string
  quantity?: number
  pricingMode?: 'weight' | 'quantity'
}

export function priceEntryLabel(
  entry: PriceEntryLike,
  unitPiecesLabel: string = 'kom',
): string {
  const mode = entry.pricingMode ?? (typeof entry.quantity === 'number' ? 'quantity' : 'weight')
  if (mode === 'quantity') {
    const n = typeof entry.quantity === 'number' && entry.quantity > 0 ? entry.quantity : 1
    return `${n} ${unitPiecesLabel}`
  }
  return entry.weight ?? ''
}

export function priceEntryKey(entry: PriceEntryLike): string {
  const mode = entry.pricingMode ?? (typeof entry.quantity === 'number' ? 'quantity' : 'weight')
  if (mode === 'quantity') {
    const n = typeof entry.quantity === 'number' && entry.quantity > 0 ? entry.quantity : 1
    return `q:${n}`
  }
  return `w:${entry.weight ?? ''}`
}
