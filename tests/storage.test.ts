import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveProfile, getProfile,
  saveDailyLog, getAllLogs,
  clearAllData,
} from '../src/lib/storage'
import type { UserProfile, FootprintLog } from '../src/types/index'

const PROFILE: UserProfile = { name: 'Alice', createdAt: '2026-06-01', monthlyGoalReductionPct: 15 }

function makeLog(date: string, kg: number): FootprintLog {
  return {
    id: date,
    date,
    transport: { carKm: 0, carType: 'none', flightHours: 0, transitKm: 0 },
    homeEnergy: { electricityKwh: 0, gasUnits: 0, energySource: 'grid' },
    diet: { dietType: 'average', mealCount: 3 },
    purchases: { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 },
    totalKgCO2: kg,
  }
}

beforeEach(() => clearAllData())

// ─── Profile round-trip ───────────────────────────────────────────────────────

describe('profile', () => {
  it('saves and retrieves a profile', () => {
    saveProfile(PROFILE)
    expect(getProfile()).toEqual(PROFILE)
  })

  it('returns null when no profile has been saved', () => {
    expect(getProfile()).toBeNull()
  })
})

// ─── saveDailyLog ─────────────────────────────────────────────────────────────

describe('saveDailyLog', () => {
  it('persists a log and retrieves it', () => {
    saveDailyLog(makeLog('2026-06-01', 5.0))
    const logs = getAllLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0].totalKgCO2).toBe(5.0)
  })

  it('upserts on the same date — no duplicate entry', () => {
    saveDailyLog(makeLog('2026-06-01', 5.0))
    saveDailyLog(makeLog('2026-06-01', 8.0))
    const logs = getAllLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0].totalKgCO2).toBe(8.0)
  })

  it('appends a new entry for a different date', () => {
    saveDailyLog(makeLog('2026-06-01', 5.0))
    saveDailyLog(makeLog('2026-06-02', 6.0))
    expect(getAllLogs()).toHaveLength(2)
  })
})

// ─── clearAllData ─────────────────────────────────────────────────────────────

describe('clearAllData', () => {
  it('removes profile and logs', () => {
    saveProfile(PROFILE)
    saveDailyLog(makeLog('2026-06-01', 5.0))
    clearAllData()
    expect(getProfile()).toBeNull()
    expect(getAllLogs()).toHaveLength(0)
  })
})
