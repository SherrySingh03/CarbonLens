import { useState } from 'react'
import type { FootprintLog } from '../types'

const WEEKS = 12

function getColor(kg: number | undefined): string {
  if (kg === undefined) return 'bg-gray-100 hover:bg-gray-200'
  if (kg < 3) return 'bg-green-700 hover:bg-green-800'
  if (kg < 6) return 'bg-green-500 hover:bg-green-600'
  if (kg < 10) return 'bg-green-300 hover:bg-green-400'
  return 'bg-green-100 hover:bg-green-200'
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
                  className={`w-4 h-4 rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-green-600 ${getColor(kg)}`}
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

      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
        <span>Less CO₂</span>
        {['bg-green-700', 'bg-green-500', 'bg-green-300', 'bg-green-100'].map((c) => (
          <span key={c} className={`w-3 h-3 rounded-sm ${c}`} aria-hidden="true" />
        ))}
        <span>More CO₂</span>
      </div>

      {popover && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-10 whitespace-nowrap shadow-lg">
          {popover.date}: {popover.kg.toFixed(1)} kg CO₂
          <button
            onClick={() => setPopover(null)}
            className="ml-2 opacity-60 hover:opacity-100 focus-visible:ring-1 focus-visible:ring-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
