import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { UserProfile, FootprintLog, InsightTip } from '../types'
import * as storage from '../lib/storage'

interface AppContextValue {
  profile: UserProfile | null
  todayLog: FootprintLog | null
  allLogs: FootprintLog[]
  tips: InsightTip[]
  saveProfile(p: UserProfile): void
  saveDailyLog(log: FootprintLog): void
  commitTip(tipId: string): void
  saveInsightTips(tips: InsightTip[]): void
  clearAllData(): void
}

const AppContext = createContext<AppContextValue | null>(null)

const todayDate = () => new Date().toISOString().slice(0, 10)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(() => storage.getProfile())
  const [allLogs, setAllLogs] = useState<FootprintLog[]>(() => storage.getAllLogs())
  const [tips, setTips] = useState<InsightTip[]>(() => storage.getInsightTips())

  const todayLog = allLogs.find((l) => l.date === todayDate()) ?? null

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
      value={{ profile, todayLog, allLogs, tips, saveProfile, saveDailyLog, commitTip, saveInsightTips, clearAllData }}
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
