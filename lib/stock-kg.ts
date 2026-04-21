/** Inventory is stored as kg with up to 4 decimal places (numeric in DB). */

/** Round **up** to exactly 4 decimal places (e.g. 1.23451 → 1.2346). */
export function roundKgUp4(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.ceil(value * 10000) / 10000
}

/** Parse Drizzle/pg numeric string or number to finite kg. */
export function parseStockKg(raw: unknown): number {
  if (raw === null || raw === undefined) return 0
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw))
  return Number.isFinite(n) ? n : 0
}


/**
 * Physical mass comparisons use 0.1 g resolution (matches 4 decimal kg).
 * 1 kg → 10_000 decigrams (1 dg = 0.1 g).
 */
export function kgToDecigrams(stockKg: number): number {
  const kg = parseStockKg(stockKg)
  return Math.floor(kg * 10000 + 1e-9)
}

/** Display kg with exactly 4 decimal places (e.g. inventory labels). */
export function formatKgFixed4(kg: number): string {
  const n = parseStockKg(kg)
  return n.toFixed(4)
}
