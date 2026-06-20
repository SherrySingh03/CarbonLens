import { useState } from 'react'
import type { FootprintLog } from '../types'

const WEEKS = 12

function getCellStyle(kg: number | undefined): React.CSSProperties {
  if (kg === undefined) return { background: 'oklch(0.3 0.016 170 / 0.25)' }
  if (kg < 3)  return { background: 'oklch(0.87 0.185 150)',      boxShadow: '0 0 4px oklch(0.87 0.185 150 / 0.4)' }
  if (kg < 6)  return { background: 'oklch(0.87 0.185 150 / 0.7)' }
  if (kg < 10) return { background: 'oklch(0.87 0.185 150 / 0.35)' }
  return              { background: 'oklch(0.87 0.185 150 / 0.15)' }
}

interface DayInfo { date: string; dayLabel: string }

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
      <div className="flex gap-1 overflow-x-auto pb-1" role="img" aria-label="12-week activity heatmap">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map(({ date, dayLabel }) => {
              const kg = logMap[date]
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => kg !== undefined && setPopover({ date, kg })}
                  className="w-4 h-4 rounded-sm focus-ring transition-opacity hover:opacity-70"
                  style={getCellStyle(kg)}
                  aria-label={kg !== undefined ? `${dayLabel}: ${kg.toFixed(1)} kg CO₂` : `${dayLabel}: no log`}
                  title={kg !== undefined ? `${dayLabel}: ${kg.toFixed(1)} kg CO₂` : dayLabel}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: 'var(--cl-text-subtle)' }}>
        <span>Less CO₂</span>
        {[0.15, 0.35, 0.7, 1].map((opacity) => (
          <span key={opacity} className="w-3 h-3 rounded-sm" aria-hidden="true"
            style={{ background: `oklch(0.87 0.185 150 / ${opacity})` }} />
        ))}
        <span>More CO₂</span>
      </div>

      {popover && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 text-xs rounded-xl px-3 py-2 z-10 whitespace-nowrap"
          style={{
            background: 'oklch(0.17 0.015 170)',
            border: '1px solid oklch(0.5 0.02 170 / 0.22)',
            boxShadow: '0 8px 32px oklch(0 0 0 / 0.5)',
            color: 'var(--cl-text)',
          }}
        >
          <span className="font-data">{popover.date}: {popover.kg.toFixed(1)} kg CO₂</span>
          <button
            onClick={() => setPopover(null)}
            className="ml-2 focus-ring rounded"
            style={{ opacity: 0.5 }}
            aria-label="Close"
          >✕</button>
        </div>
      )}
    </div>
  )
}
