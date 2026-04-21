/** Parse product price row weight label (e.g. "250g", "1kg") into grams */
export function parseWeightToGrams(weight: string): number | null {
  const value = Number(weight.replace(',', '.').replace(/[^\d.]/g, ''))
  if (!Number.isFinite(value) || value <= 0) return null
  if (/kg/i.test(weight)) return Math.round(value * 1000)
  if (/g/i.test(weight)) return Math.round(value)
  return null
}
