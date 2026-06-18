import type { FootprintLog, UserProfile, InsightTip } from '../types'
import { fetchGridIntensity } from './gridIntensity'
import { getCategoryBreakdown } from './emissions'

const CACHE_KEY = 'cl_tips_cache'

function hashLog(log: FootprintLog): string {
  const breakdown = getCategoryBreakdown(log)
  const parts = Object.values(breakdown).map((v) => v.toFixed(1))
  return `${log.totalKgCO2.toFixed(1)}_${parts.join('_')}`
}

function getCached(hash: string): InsightTip[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { savedHash, tips } = JSON.parse(raw) as { savedHash: string; tips: InsightTip[] }
    return savedHash === hash ? tips : null
  } catch {
    return null
  }
}

function setCached(hash: string, tips: InsightTip[]): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ savedHash: hash, tips }))
}

function hasChangedSignificantly(newHash: string): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return true
    const { savedHash } = JSON.parse(raw) as { savedHash: string }
    const oldTotal = parseFloat(savedHash.split('_')[0])
    const newTotal = parseFloat(newHash.split('_')[0])
    if (!oldTotal) return true
    return Math.abs(newTotal - oldTotal) / oldTotal > 0.05
  } catch {
    return true
  }
}

export async function fetchInsights(
  log: FootprintLog,
  profile: UserProfile,
  committedTipIds: string[]
): Promise<InsightTip[]> {
  const gridFactor = await fetchGridIntensity()
  const hash = hashLog(log)
  const cached = getCached(hash)
  if (cached && !hasChangedSignificantly(hash)) return cached

  const res = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ footprintLog: { ...log, gridFactor }, profile, committedTipIds }),
  })

  if (!res.ok) throw new Error(`Insights fetch failed: ${res.status}`)
  const tips = await res.json() as InsightTip[]
  setCached(hash, tips)
  return tips
}
