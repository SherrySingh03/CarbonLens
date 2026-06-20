import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { UserProfile, FootprintLog, InsightTip } from '../types'
import * as storage from '../lib/storage'
import { extrapolateMonthly, calcEcoScore } from '../lib/emissions'
import { fetchGridIntensity, type GridIntensityResult } from '../lib/gridIntensity'

interface AppContextValue {
  profile: UserProfile | null
  todayLog: FootprintLog | null
  allLogs: FootprintLog[]
  monthLogs: FootprintLog[]
  monthlyEquivalent: number        // raw extrapolated monthly kg
  adjustedSavingKgCO2: number      // total saving from committed + completed tips
  netMonthlyKg: number             // monthlyEquivalent − adjustedSavingKgCO2
  ecoScore: number                 // 0–850 derived from netMonthlyKg
  completedSavingKgCO2: number     // saving from completed-only tips
  tips: InsightTip[]
  gridStatus: GridIntensityResult | null
  logSheetOpen: boolean
  setLogSheetOpen(v: boolean): void
  saveProfile(p: UserProfile): void
  saveDailyLog(log: FootprintLog): void
  commitTip(tipId: string): void
  completeTip(tipId: string): void
  saveInsightTips(tips: InsightTip[]): void
  clearAllData(): void
}

const AppContext = createContext<AppContextValue | null>(null)

const todayDate = () => new Date().toISOString().slice(0, 10)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(() => storage.getProfile())
  const [allLogs, setAllLogs] = useState<FootprintLog[]>(() => storage.getAllLogs())
  const [tips, setTips] = useState<InsightTip[]>(() => storage.getInsightTips())
  const [logSheetOpen, setLogSheetOpen] = useState(false)
  const [gridStatus, setGridStatus] = useState<GridIntensityResult | null>(null)

  useEffect(() => {
    fetchGridIntensity().then(setGridStatus)
  }, [])

  const todayLog = useMemo(() => {
    const today = todayDate()
    return allLogs.find((l) => l.date === today) ?? null
  }, [allLogs])

  const monthLogs = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return allLogs.filter((l) => l.date.startsWith(currentMonth))
  }, [allLogs])

  const monthlyEquivalent = useMemo(() => extrapolateMonthly(monthLogs), [monthLogs])

  // Committed OR completed tips both reduce your effective CO₂
  const adjustedSavingKgCO2 = useMemo(
    () => tips.filter((t) => t.committed).reduce((s, t) => s + t.estimatedSavingKgCO2, 0),
    [tips]
  )
  const completedSavingKgCO2 = useMemo(
    () => tips.filter((t) => t.completed).reduce((s, t) => s + t.estimatedSavingKgCO2, 0),
    [tips]
  )
  const netMonthlyKg = useMemo(
    () => Math.max(0, monthlyEquivalent - adjustedSavingKgCO2),
    [monthlyEquivalent, adjustedSavingKgCO2]
  )
  const ecoScore = useMemo(() => calcEcoScore(netMonthlyKg), [netMonthlyKg])

  const saveProfile = useCallback((p: UserProfile) => {
    storage.saveProfile(p)
    setProfile(p)
  }, [])

  const saveDailyLog = useCallback((log: FootprintLog) => {
    storage.saveDailyLog(log)
    setAllLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === log.date)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = log
        return next
      }
      return [...prev, log]
    })
  }, [])

  const commitTip = useCallback((tipId: string) => {
    storage.commitTip(tipId)
    setTips((prev) => prev.map((t) => (t.id === tipId ? { ...t, committed: true } : t)))
  }, [])

  const completeTip = useCallback((tipId: string) => {
    storage.completeTip(tipId)
    setTips((prev) => prev.map((t) =>
      t.id === tipId
        ? { ...t, committed: true, completed: true, completedAt: new Date().toISOString().slice(0, 10) }
        : t
    ))
  }, [])

  const saveInsightTips = useCallback((newTips: InsightTip[]) => {
    storage.saveInsightTips(newTips)
    setTips(newTips)
  }, [])

  const clearAllData = useCallback(() => {
    storage.clearAllData()
    setProfile(null)
    setAllLogs([])
    setTips([])
  }, [])

  return (
    <AppContext.Provider
      value={{
        profile, todayLog, allLogs, monthLogs,
        monthlyEquivalent, adjustedSavingKgCO2, netMonthlyKg, ecoScore,
        completedSavingKgCO2, tips, gridStatus,
        logSheetOpen, setLogSheetOpen,
        saveProfile, saveDailyLog, commitTip, completeTip, saveInsightTips, clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
