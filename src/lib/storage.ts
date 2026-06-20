import type { UserProfile, FootprintLog, InsightTip } from '../types'

const KEYS = {
  PROFILE: 'cl_profile',
  LOGS: 'cl_logs',
  TIPS: 'cl_tips',
} as const

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function saveProfile(profile: UserProfile): void {
  write(KEYS.PROFILE, profile)
}

export function getProfile(): UserProfile | null {
  return read<UserProfile>(KEYS.PROFILE)
}

export function saveDailyLog(log: FootprintLog): void {
  const logs = getAllLogs()
  const idx = logs.findIndex((l) => l.date === log.date)
  if (idx >= 0) logs[idx] = log
  else logs.push(log)
  write(KEYS.LOGS, logs)
}

export function getAllLogs(): FootprintLog[] {
  return read<FootprintLog[]>(KEYS.LOGS) ?? []
}

export function getLogByDate(date: string): FootprintLog | null {
  return getAllLogs().find((l) => l.date === date) ?? null
}

export function saveInsightTips(tips: InsightTip[]): void {
  write(KEYS.TIPS, tips)
}

export function getInsightTips(): InsightTip[] {
  return read<InsightTip[]>(KEYS.TIPS) ?? []
}

export function commitTip(tipId: string): void {
  const tips = getInsightTips().map((t) =>
    t.id === tipId ? { ...t, committed: true } : t
  )
  write(KEYS.TIPS, tips)
}

export function completeTip(tipId: string): void {
  const tips = getInsightTips().map((t) =>
    t.id === tipId
      ? { ...t, committed: true, completed: true, completedAt: new Date().toISOString().slice(0, 10) }
      : t
  )
  write(KEYS.TIPS, tips)
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
