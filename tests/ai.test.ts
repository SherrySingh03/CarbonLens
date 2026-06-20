import { describe, it, expect } from 'vitest'
import { isValidTip, hashLog } from '../src/lib/ai'
import type { FootprintLog } from '../src/types/index'

// ─── isValidTip ───────────────────────────────────────────────────────────────

const validTip = {
  id: 'tip-1',
  category: 'transport',
  title: 'Carpool to work',
  description: 'Share your commute and cut emissions.',
  estimatedSavingKgCO2: 4.5,
  difficulty: 'easy',
}

describe('isValidTip', () => {
  it('accepts a well-formed tip', () => {
    expect(isValidTip(validTip)).toBe(true)
  })

  it('rejects null', () => {
    expect(isValidTip(null)).toBe(false)
  })

  it('rejects a non-object (string)', () => {
    expect(isValidTip('tip')).toBe(false)
  })

  it('rejects a tip with missing id', () => {
    expect(isValidTip({ ...validTip, id: undefined })).toBe(false)
  })

  it('rejects a tip where estimatedSavingKgCO2 is a string instead of number', () => {
    expect(isValidTip({ ...validTip, estimatedSavingKgCO2: '4.5' })).toBe(false)
  })

  it('rejects a tip with missing title', () => {
    expect(isValidTip({ ...validTip, title: undefined })).toBe(false)
  })
})

// ─── hashLog ─────────────────────────────────────────────────────────────────

function makeLog(totalKgCO2: number, carKm = 0): FootprintLog {
  return {
    id: '1',
    date: '2026-06-01',
    transport: { carKm, carType: 'petrol', flightHours: 0, transitKm: 0 },
    homeEnergy: { electricityKwh: 0, gasUnits: 0, energySource: 'grid' },
    diet: { dietType: 'average', mealCount: 3 },
    purchases: { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 },
    totalKgCO2,
  }
}

describe('hashLog', () => {
  it('returns the same hash for identical input', () => {
    const log = makeLog(10)
    expect(hashLog(log)).toBe(hashLog(log))
  })

  it('returns a different hash when totalKgCO2 changes', () => {
    expect(hashLog(makeLog(10))).not.toBe(hashLog(makeLog(20)))
  })

  it('returns a different hash when transport data changes', () => {
    expect(hashLog(makeLog(10, 0))).not.toBe(hashLog(makeLog(10, 50)))
  })
})
