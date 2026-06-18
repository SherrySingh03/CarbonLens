import { describe, it, expect } from 'vitest'
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateDietEmissions,
  calculatePurchasesEmissions,
  calculateTotal,
  getCategoryBreakdown,
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
