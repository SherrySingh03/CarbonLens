import { describe, it, expect } from 'vitest'
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateDietEmissions,
  calculatePurchasesEmissions,
  calculateTotal,
  getCategoryBreakdown,
  aggregateLogTotals,
  dailyAvgOrFallback,
  INDIA_AVERAGE_KG_CO2_PER_MONTH,
  GLOBAL_AVERAGE_KG_CO2_PER_MONTH,
} from '../src/lib/emissions'
import type { FootprintLog } from '../src/types'

describe('calculateTransportEmissions', () => {
  it('returns 0 for no car and no flights', () => {
    expect(calculateTransportEmissions({ carKm: 0, carType: 'none', flightHours: 0, transitKm: 0 })).toBe(0)
  })

  it('calculates petrol car at 100km correctly', () => {
    expect(calculateTransportEmissions({ carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 0 })).toBeCloseTo(19.2)
  })

  it('calculates flight emissions at 2 hours (800km/h)', () => {
    const result = calculateTransportEmissions({ carKm: 0, carType: 'none', flightHours: 2, transitKm: 0 })
    expect(result).toBeCloseTo(2 * 800 * 0.255)
  })

  it('electric car has lower emissions than petrol at same distance', () => {
    const petrol = calculateTransportEmissions({ carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 0 })
    const electric = calculateTransportEmissions({ carKm: 100, carType: 'electric', flightHours: 0, transitKm: 0 })
    expect(electric).toBeLessThan(petrol)
  })

  it('includes transit emissions', () => {
    const result = calculateTransportEmissions({ carKm: 0, carType: 'none', flightHours: 0, transitKm: 100 })
    expect(result).toBeCloseTo(8.9)
  })
})

describe('calculateEnergyEmissions', () => {
  it('calculates grid electricity correctly', () => {
    const result = calculateEnergyEmissions({ electricityKwh: 100, gasUnits: 0, energySource: 'grid' })
    expect(result).toBeCloseTo(71.6)
  })

  it('renewable source produces much less than grid', () => {
    const grid = calculateEnergyEmissions({ electricityKwh: 100, gasUnits: 0, energySource: 'grid' })
    const renewable = calculateEnergyEmissions({ electricityKwh: 100, gasUnits: 0, energySource: 'renewable' })
    expect(renewable).toBeLessThan(grid)
  })

  it('accepts gridOverride and uses it instead of energySource factor', () => {
    const withOverride = calculateEnergyEmissions(
      { electricityKwh: 100, gasUnits: 0, energySource: 'grid' },
      0.5
    )
    expect(withOverride).toBeCloseTo(50)
  })

  it('adds gas emissions correctly', () => {
    const result = calculateEnergyEmissions({ electricityKwh: 0, gasUnits: 10, energySource: 'grid' })
    expect(result).toBeCloseTo(20.4)
  })
})

describe('calculateDietEmissions', () => {
  it('vegan produces less than meat-heavy at same meal count', () => {
    const meatHeavy = calculateDietEmissions({ dietType: 'meat-heavy', mealCount: 3 })
    const vegan = calculateDietEmissions({ dietType: 'vegan', mealCount: 3 })
    expect(vegan).toBeLessThan(meatHeavy)
  })

  it('emissions scale with mealCount relative to 3-meal baseline', () => {
    const base = calculateDietEmissions({ dietType: 'average', mealCount: 3 })
    const double = calculateDietEmissions({ dietType: 'average', mealCount: 6 })
    expect(double).toBeCloseTo(base * 2)
  })

  it('meat-heavy at 3 meals equals factor value', () => {
    const result = calculateDietEmissions({ dietType: 'meat-heavy', mealCount: 3 })
    expect(result).toBeCloseTo(7.19)
  })
})

describe('calculatePurchasesEmissions', () => {
  it('returns 0 for all-zero inputs', () => {
    expect(calculatePurchasesEmissions({ onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 })).toBe(0)
  })

  it('calculates online orders correctly', () => {
    const result = calculatePurchasesEmissions({ onlineOrdersCount: 4, newClothingItems: 0, electronicsItems: 0 })
    expect(result).toBeCloseTo(2.0)
  })

  it('calculates clothing correctly', () => {
    const result = calculatePurchasesEmissions({ onlineOrdersCount: 0, newClothingItems: 2, electronicsItems: 0 })
    expect(result).toBeCloseTo(20.0)
  })

  it('calculates electronics correctly', () => {
    const result = calculatePurchasesEmissions({ onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 1 })
    expect(result).toBeCloseTo(70.0)
  })
})

describe('calculateTotal', () => {
  it('returns 0 for all-zero inputs', () => {
    const result = calculateTotal({
      transport: { carKm: 0, carType: 'none', flightHours: 0, transitKm: 0 },
      homeEnergy: { electricityKwh: 0, gasUnits: 0, energySource: 'grid' },
      diet: { dietType: 'vegan', mealCount: 0 },
      purchases: { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 },
    })
    expect(result).toBe(0)
  })

  it('sums all four category totals correctly', () => {
    const result = calculateTotal({
      transport: { carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 0 },
      homeEnergy: { electricityKwh: 100, gasUnits: 0, energySource: 'grid' },
      diet: { dietType: 'average', mealCount: 3 },
      purchases: { onlineOrdersCount: 2, newClothingItems: 0, electronicsItems: 0 },
    })
    expect(result).toBeCloseTo(19.2 + 71.6 + 5.63 + 1.0)
  })
})

describe('getCategoryBreakdown', () => {
  it('returns an object with four category keys', () => {
    const log: FootprintLog = {
      id: '1',
      date: '2026-06-19',
      transport: { carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 0 },
      homeEnergy: { electricityKwh: 100, gasUnits: 0, energySource: 'grid' },
      diet: { dietType: 'average', mealCount: 3 },
      purchases: { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 },
      totalKgCO2: 96.43,
    }
    const breakdown = getCategoryBreakdown(log)
    expect(breakdown).toHaveProperty('transport')
    expect(breakdown).toHaveProperty('energy')
    expect(breakdown).toHaveProperty('diet')
    expect(breakdown).toHaveProperty('purchases')
  })
})

describe('constants', () => {
  it('INDIA_AVERAGE_KG_CO2_PER_MONTH is 125', () => {
    expect(INDIA_AVERAGE_KG_CO2_PER_MONTH).toBe(125)
  })
  it('GLOBAL_AVERAGE_KG_CO2_PER_MONTH is 375', () => {
    expect(GLOBAL_AVERAGE_KG_CO2_PER_MONTH).toBe(375)
  })
})

describe('aggregateLogTotals', () => {
  const logs: FootprintLog[] = [
    {
      id: 'a', date: '2026-06-01',
      transport:  { carKm: 20,  carType: 'petrol', flightHours: 1,   transitKm: 5  },
      homeEnergy: { electricityKwh: 8, gasUnits: 0.5, energySource: 'grid' },
      diet:       { dietType: 'average', mealCount: 3 },
      purchases:  { onlineOrdersCount: 2, newClothingItems: 1, electronicsItems: 0 },
      totalKgCO2: 0,
    },
    {
      id: 'b', date: '2026-06-02',
      transport:  { carKm: 40,  carType: 'petrol', flightHours: 0,   transitKm: 10 },
      homeEnergy: { electricityKwh: 6, gasUnits: 0.3, energySource: 'grid' },
      diet:       { dietType: 'average', mealCount: 3 },
      purchases:  { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 1 },
      totalKgCO2: 0,
    },
    {
      id: 'c', date: '2026-06-03',
      transport:  { carKm: 0,   carType: 'none',   flightHours: 0.5, transitKm: 20 },
      homeEnergy: { electricityKwh: 4, gasUnits: 0.2, energySource: 'renewable' },
      diet:       { dietType: 'vegan', mealCount: 2 },
      purchases:  { onlineOrdersCount: 3, newClothingItems: 0, electronicsItems: 0 },
      totalKgCO2: 0,
    },
  ]

  it('single-pass totals match 9 independent reduce passes (equivalence)', () => {
    const result = aggregateLogTotals(logs)

    // 9-pass reference values computed independently
    expect(result.carKm).toBeCloseTo(logs.reduce((s, l) => s + l.transport.carKm, 0))
    expect(result.flightH).toBeCloseTo(logs.reduce((s, l) => s + l.transport.flightHours, 0))
    expect(result.transitKm).toBeCloseTo(logs.reduce((s, l) => s + l.transport.transitKm, 0))
    expect(result.kwh).toBeCloseTo(logs.reduce((s, l) => s + l.homeEnergy.electricityKwh, 0))
    expect(result.gas).toBeCloseTo(logs.reduce((s, l) => s + l.homeEnergy.gasUnits, 0))
    expect(result.orders).toBeCloseTo(logs.reduce((s, l) => s + l.purchases.onlineOrdersCount, 0))
    expect(result.clothing).toBeCloseTo(logs.reduce((s, l) => s + l.purchases.newClothingItems, 0))
    expect(result.elec).toBeCloseTo(logs.reduce((s, l) => s + l.purchases.electronicsItems, 0))
  })

  it('exact values for known input', () => {
    const r = aggregateLogTotals(logs)
    expect(r.carKm).toBe(60)
    expect(r.flightH).toBeCloseTo(1.5)
    expect(r.transitKm).toBe(35)
    expect(r.kwh).toBeCloseTo(18)
    expect(r.gas).toBeCloseTo(1.0)
    expect(r.orders).toBe(5)
    expect(r.clothing).toBe(1)
    expect(r.elec).toBe(1)
  })

  it('returns all zeros for empty log array', () => {
    const r = aggregateLogTotals([])
    expect(r.carKm).toBe(0)
    expect(r.kwh).toBe(0)
    expect(r.orders).toBe(0)
  })
})

describe('dailyAvgOrFallback', () => {
  const makeLog = (kg: number): FootprintLog => ({
    id: '1', date: '2026-06-01',
    transport: { carKm: 0, carType: 'none', flightHours: 0, transitKm: 0 },
    homeEnergy: { electricityKwh: 0, gasUnits: 0, energySource: 'grid' },
    diet: { dietType: 'average', mealCount: 3 },
    purchases: { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 },
    totalKgCO2: kg,
  })

  it('returns daily-scale India average when no logs (not monthly)', () => {
    const result = dailyAvgOrFallback([])
    expect(result).toBeCloseTo(INDIA_AVERAGE_KG_CO2_PER_MONTH / 30)
    expect(result).not.toBe(INDIA_AVERAGE_KG_CO2_PER_MONTH)
  })

  it('fallback is ≈ 4.17 kg/day, not 125 kg/month', () => {
    expect(dailyAvgOrFallback([])).toBeCloseTo(125 / 30)
  })

  it('returns mean of log totals when logs are present', () => {
    expect(dailyAvgOrFallback([makeLog(3), makeLog(5), makeLog(4)])).toBeCloseTo(4)
  })

  it('daily avg from logs is independent of India avg fallback', () => {
    const withLogs = dailyAvgOrFallback([makeLog(2)])
    expect(withLogs).toBe(2)
    expect(withLogs).not.toBeCloseTo(INDIA_AVERAGE_KG_CO2_PER_MONTH / 30)
  })
})
