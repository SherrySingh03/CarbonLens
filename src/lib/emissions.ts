import type { TransportData, HomeEnergyData, DietData, PurchasesData, FootprintLog } from '../types'

const FACTORS = {
  car: { petrol: 0.192, diesel: 0.171, electric: 0.053, none: 0 },
  flight: 0.255,
  transit: 0.089,
  electricity: { grid: 0.716, renewable: 0.041, mixed: 0.400 },
  gas: 2.04,
  // Monthly diet factors — divide by 30 for daily
  diet: { 'meat-heavy': 7.19, average: 5.63, vegetarian: 3.81, vegan: 2.89 },
  onlineOrder: 0.5,
  clothing: 10.0,
  electronics: 70.0,
} as const

export const INDIA_AVERAGE_KG_CO2_PER_MONTH = 125
export const GLOBAL_AVERAGE_KG_CO2_PER_MONTH = 375

// ─── Eco Score ───────────────────────────────────────────────────────────────
// A 0–850 metric derived from net monthly CO₂ (raw minus committed tip savings).
// 0 kg → 850 (perfect), 350 kg → 0 (off-the-charts, above global avg).
export const ECO_SCORE_MAX = 850
export const ECO_SCORE_CEIL_KG = 350  // zero-score ceiling

export function calcEcoScore(netMonthlyKg: number): number {
  const clamped = Math.max(0, Math.min(netMonthlyKg, ECO_SCORE_CEIL_KG))
  return Math.round(ECO_SCORE_MAX * (1 - clamped / ECO_SCORE_CEIL_KG))
}

export function ecoScoreGrade(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 750) return { label: 'Exceptional', color: 'oklch(0.84 0.16 152)',  bg: 'oklch(0.84 0.16 152 / 0.12)',   border: 'oklch(0.84 0.16 152 / 0.3)'  }
  if (score >= 600) return { label: 'Very Good',   color: 'oklch(0.87 0.185 150)', bg: 'oklch(0.87 0.185 150 / 0.12)',  border: 'oklch(0.87 0.185 150 / 0.3)' }
  if (score >= 450) return { label: 'Good',         color: 'oklch(0.85 0.14 90)',   bg: 'oklch(0.85 0.14 90 / 0.12)',   border: 'oklch(0.85 0.14 90 / 0.3)'   }
  if (score >= 300) return { label: 'Fair',          color: 'oklch(0.82 0.12 60)',   bg: 'oklch(0.82 0.12 60 / 0.12)',   border: 'oklch(0.82 0.12 60 / 0.3)'   }
  if (score >= 150) return { label: 'Poor',          color: 'oklch(0.74 0.16 35)',   bg: 'oklch(0.70 0.18 33 / 0.12)',  border: 'oklch(0.70 0.18 33 / 0.3)'   }
  return                    { label: 'Critical',     color: 'oklch(0.65 0.2 25)',    bg: 'oklch(0.65 0.2 25 / 0.12)',    border: 'oklch(0.65 0.2 25 / 0.3)'    }
}

export function calculateTransportEmissions(data: TransportData): number {
  const car = data.carType === 'none' ? 0 : data.carKm * FACTORS.car[data.carType]
  const flight = data.flightHours * 800 * FACTORS.flight
  const transit = data.transitKm * FACTORS.transit
  return car + flight + transit
}

export function calculateEnergyEmissions(data: HomeEnergyData, gridOverride?: number): number {
  const gridFactor = gridOverride ?? FACTORS.electricity[data.energySource]
  return data.electricityKwh * gridFactor + data.gasUnits * FACTORS.gas
}

// When daily=true, diet emission is per-day (monthly factor ÷ 30)
export function calculateDietEmissions(data: DietData, daily = false): number {
  const factor = daily ? FACTORS.diet[data.dietType] / 30 : FACTORS.diet[data.dietType]
  return factor * (data.mealCount / 3)
}

export function calculatePurchasesEmissions(data: PurchasesData): number {
  return (
    data.onlineOrdersCount * FACTORS.onlineOrder +
    data.newClothingItems * FACTORS.clothing +
    data.electronicsItems * FACTORS.electronics
  )
}

export function calculateTotal(
  log: Omit<FootprintLog, 'id' | 'date' | 'totalKgCO2'>,
  daily = false
): number {
  return (
    calculateTransportEmissions(log.transport) +
    calculateEnergyEmissions(log.homeEnergy) +
    calculateDietEmissions(log.diet, daily) +
    calculatePurchasesEmissions(log.purchases)
  )
}

export function getCategoryBreakdown(log: FootprintLog, daily = false): Record<string, number> {
  return {
    transport: calculateTransportEmissions(log.transport),
    energy: calculateEnergyEmissions(log.homeEnergy),
    diet: calculateDietEmissions(log.diet, daily),
    purchases: calculatePurchasesEmissions(log.purchases),
  }
}

// Aggregate multiple daily logs into a monthly summary
export function getMonthlyBreakdown(logs: FootprintLog[]): Record<string, number> {
  const acc = { transport: 0, energy: 0, diet: 0, purchases: 0 }
  for (const log of logs) {
    acc.transport += calculateTransportEmissions(log.transport)
    acc.energy += calculateEnergyEmissions(log.homeEnergy)
    acc.diet += calculateDietEmissions(log.diet, true)
    acc.purchases += calculatePurchasesEmissions(log.purchases)
  }
  return acc
}

// Build an extrapolated monthly total from daily logs
// Uses average daily × 30 to normalise for partial months
export function extrapolateMonthly(logs: FootprintLog[]): number {
  if (logs.length === 0) return 0
  const sum = logs.reduce((s, l) => s + l.totalKgCO2, 0)
  return (sum / logs.length) * 30
}
