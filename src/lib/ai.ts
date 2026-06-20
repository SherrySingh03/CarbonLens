import type { FootprintLog, UserProfile, InsightTip } from '../types'
import { fetchGridIntensity } from './gridIntensity'
import { getCategoryBreakdown } from './emissions'

const CACHE_KEY = 'cl_tips_cache'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

interface TipsCache {
  savedHash: string
  tips: InsightTip[]
  savedAt: number
}

export function hashLog(log: FootprintLog): string {
  const breakdown = getCategoryBreakdown(log)
  const parts = Object.values(breakdown).map((v) => v.toFixed(1))
  return `${log.totalKgCO2.toFixed(1)}_${parts.join('_')}`
}

function getCached(hash: string): InsightTip[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { savedHash, tips, savedAt } = JSON.parse(raw) as TipsCache
    if (savedHash !== hash) return null
    if (Date.now() - savedAt > CACHE_TTL_MS) return null
    return tips
  } catch {
    return null
  }
}

function setCached(hash: string, tips: InsightTip[]): void {
  const entry: TipsCache = { savedHash: hash, tips, savedAt: Date.now() }
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
}

export function isValidTip(t: unknown): t is InsightTip {
  if (!t || typeof t !== 'object') return false
  const tip = t as Record<string, unknown>
  return (
    typeof tip.id === 'string' &&
    typeof tip.category === 'string' &&
    typeof tip.title === 'string' &&
    typeof tip.description === 'string' &&
    typeof tip.estimatedSavingKgCO2 === 'number' &&
    typeof tip.difficulty === 'string'
  )
}

export function clearInsightsCache(): void {
  localStorage.removeItem(CACHE_KEY)
}

export async function fetchInsights(
  log: FootprintLog,
  profile: UserProfile,
  excludedTipIds: string[],
  skipCache = false
): Promise<InsightTip[]> {
  const hash = hashLog(log)
  const cached = skipCache ? null : getCached(hash)
  if (cached) return cached

  const grid = await fetchGridIntensity()

  const res = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ footprintLog: { ...log, gridFactor: grid.kgPerKwh }, profile, committedTipIds: excludedTipIds }),
  })

  if (!res.ok) throw new Error(`Insights fetch failed: ${res.status}`)
  const raw: unknown = await res.json()
  if (!Array.isArray(raw)) throw new Error('AI returned unexpected response shape')
  const tips = raw.filter(isValidTip)
  if (tips.length === 0) throw new Error('AI returned no usable tips')
  setCached(hash, tips)
  return tips
}
