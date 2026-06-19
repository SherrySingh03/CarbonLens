import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ScoreRing from '../components/ScoreRing'
import CategoryBar from '../components/CategoryBar'
import {
  getCategoryBreakdown,
  INDIA_AVERAGE_KG_CO2_PER_MONTH,
  GLOBAL_AVERAGE_KG_CO2_PER_MONTH,
} from '../lib/emissions'
import type { FootprintLog, UserProfile } from '../types'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function StatusLine({ log }: { log: FootprintLog }) {
  const total = log.totalKgCO2
  const diff = total - INDIA_AVERAGE_KG_CO2_PER_MONTH
  const pct = Math.abs((diff / INDIA_AVERAGE_KG_CO2_PER_MONTH) * 100).toFixed(0)

  if (diff < -5) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-green-700 mt-1">
        <TrendingDown size={14} />
        {pct}% below the India average this month
      </p>
    )
  }
  if (diff > 5) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 mt-1">
        <TrendingUp size={14} />
        {pct}% above the India average this month
      </p>
    )
  }
  return (
    <p className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 mt-1">
      <Minus size={14} />
      Right at the India average
    </p>
  )
}

function HeroBand({ profile, todayLog }: { profile: UserProfile | null; todayLog: FootprintLog | null }) {
  return (
    <div className="mb-6 pb-5 border-b border-[#D4E4CC]">
      <p className="text-xs font-medium text-leaf-500 tracking-wide uppercase">{formatDate()}</p>
      <h1 className="font-display text-2xl font-bold text-[#1A2E1A] mt-0.5">
        {greeting()}, {profile?.name ?? 'there'}
      </h1>
      {todayLog ? (
        <StatusLine log={todayLog} />
      ) : (
        <p className="text-sm text-muted mt-1">Log your footprint to see how you compare.</p>
      )}
    </div>
  )
}

function AverageRow() {
  return (
    <div className="flex gap-3 mt-5">
      {[
        { label: 'India avg', value: INDIA_AVERAGE_KG_CO2_PER_MONTH, color: 'text-amber-700', bg: 'bg-amber-50' },
        { label: 'Global avg', value: GLOBAL_AVERAGE_KG_CO2_PER_MONTH, color: 'text-red-700', bg: 'bg-red-50' },
      ].map(({ label, value, color, bg }) => (
        <div key={label} className={`flex-1 ${bg} rounded-2xl px-4 py-3 text-center`}>
          <p className="font-data text-lg font-semibold text-zinc-800">{value}</p>
          <p className={`text-xs font-medium ${color}`}>{label}</p>
          <p className="text-[10px] text-muted">kg CO₂ / mo</p>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { profile, todayLog } = useApp()

  return (
    <section aria-label="Carbon footprint dashboard" className="animate-slide-up">
      <HeroBand profile={profile} todayLog={todayLog} />

      {!todayLog ? (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-leaf-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingDown size={24} className="text-leaf-600" />
          </div>
          <p className="font-display font-semibold text-[#1A2E1A]">No log for today yet</p>
          <p className="text-sm text-muted mt-1">
            Tap <strong>Log</strong> in the navigation to record your footprint.
          </p>
        </div>
      ) : (
        <>
          {/* Score card */}
          <div className="card p-7 flex flex-col items-center">
            <ScoreRing kg={todayLog.totalKgCO2} size={240} />
            <AverageRow />
            <p className="text-[11px] text-muted mt-3">
              Factors: CEA India 2023 · IPCC · DEFRA 2023
            </p>
          </div>

          {/* Breakdown */}
          <div className="card p-6 mt-4">
            <h2 className="font-display text-base font-semibold text-[#1A2E1A] mb-4">
              Emissions breakdown
            </h2>
            <div className="space-y-2.5">
              {Object.entries(getCategoryBreakdown(todayLog)).map(([cat, kg]) => (
                <CategoryBar key={cat} category={cat} kg={kg} total={todayLog.totalKgCO2} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
