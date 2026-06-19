import { useState } from 'react'
import type { FootprintLog } from '../types'

const WEEKS = 12

function getColor(kg: number | undefined): string {
  if (kg === undefined) return 'bg-white/[0.04] hover:bg-white/[0.08]'
  if (kg < 3)  return 'bg-emerald-600 hover:bg-emerald-500'
  if (kg < 6)  return 'bg-emerald-500/80 hover:bg-emerald-400'
  if (kg < 10) return 'bg-emerald-500/40 hover:bg-emerald-500/60'
  return 'bg-emerald-500/15 hover:bg-emerald-500/25'
}

interface DayInfo {
  date: string
  dayLabel: string
}

function buildDays(): DayInfo[] {
  const today = new Date()
  return Array.from({ length: WEEKS * 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (WEEKS * 7 - 1 - i))
    return {
      date: d.toISOString().slice(0, 10),
      dayLabel: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    }
  })
}

export default function HeatmapCalendar({ logs }: { logs: FootprintLog[] }) {
  const [popover, setPopover] = useState<{ date: string; kg: number } | null>(null)
  const logMap = Object.fromEntries(logs.map((l) => [l.date, l.totalKgCO2]))

  const days = buildDays()
  const weeks: DayInfo[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div className="relative">
      <div
        className="flex gap-1 overflow-x-auto pb-1"
        role="img"
        aria-label="12-week activity heatmap showing daily carbon footprint logs"
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map(({ date, dayLabel }) => {
              const kg = logMap[date]
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => kg !== undefined && setPopover({ date, kg })}
                  className={`w-4 h-4 rounded-sm transition-colors focus-ring ${getColor(kg)}`}
                  aria-label={
                    kg !== undefined
                      ? `${dayLabel}: ${kg.toFixed(1)} kg CO₂`
                      : `${dayLabel}: no log`
                  }
                  title={kg !== undefined ? `${dayLabel}: ${kg.toFixed(1)} kg CO₂` : dayLabel}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-600">
        <span>Less CO₂</span>
        {['bg-emerald-600', 'bg-emerald-500/80', 'bg-emerald-500/40', 'bg-emerald-500/15'].map((c) => (
          <span key={c} className={`w-3 h-3 rounded-sm ${c}`} aria-hidden="true" />
        ))}
        <span>More CO₂</span>
      </div>

      {popover && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs rounded-xl px-3 py-2 z-10 whitespace-nowrap shadow-2xl border border-white/10"
          style={{ background: 'rgba(13,21,17,0.96)', backdropFilter: 'blur(12px)', color: '#f8fafc' }}>
          <span className="font-data">{popover.date}: {popover.kg.toFixed(1)} kg CO₂</span>
          <button
            onClick={() => setPopover(null)}
            className="ml-2 opacity-50 hover:opacity-100 focus-ring rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
