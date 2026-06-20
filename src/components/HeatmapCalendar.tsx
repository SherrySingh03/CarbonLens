import { useState } from 'react'
import type { FootprintLog } from '../types'

const DAYS = 14  // 2 weeks

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
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (DAYS - 1 - i))
    return {
      date: d.toISOString().slice(0, 10),
      dayLabel: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    }
  })
}

export default function HeatmapCalendar({ logs }: { logs: FootprintLog[] }) {
  const [popover, setPopover] = useState<{ date: string; kg: number } | null>(null)
  const logMap = Object.fromEntries(logs.map((l) => [l.date, l.totalKgCO2]))
  const days = buildDays()

  return (
    <div className="relative">
      {/* 7-column grid — cells stretch to fill the full card width */}
      <div
        aria-label="2-week logging activity"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}
      >
        {days.map(({ date, dayLabel }) => {
          const kg = logMap[date]
          const isActive = popover?.date === date
          return (
            <button
              key={date}
              type="button"
              onClick={() => setPopover(kg !== undefined ? (isActive ? null : { date, kg }) : null)}
              className="rounded-md focus-ring transition-opacity hover:opacity-75"
              style={{ ...getCellStyle(kg), aspectRatio: '1', width: '100%' }}
              aria-label={kg !== undefined
                ? `${dayLabel}: ${kg.toFixed(1)} kg CO₂`
                : `${dayLabel}: no log`}
              aria-pressed={kg !== undefined ? isActive : undefined}
            />
          )
        })}
      </div>

      {/* Legend — bright = less CO₂, dim = more CO₂, matching getCellStyle */}
      <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--cl-text-subtle)' }}>
        <span>Less CO₂</span>
        {[1, 0.7, 0.35, 0.15].map((opacity) => (
          <span
            key={opacity}
            aria-hidden="true"
            style={{
              display: 'inline-block', width: 12, height: 12, borderRadius: 3,
              background: `oklch(0.87 0.185 150 / ${opacity})`,
            }}
          />
        ))}
        <span>More CO₂</span>
      </div>

      {/* Day-detail popover */}
      {popover && (
        <div
          role="status"
          aria-live="polite"
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
            aria-label="Dismiss"
          >✕</button>
        </div>
      )}
    </div>
  )
}
