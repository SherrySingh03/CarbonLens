import { useEffect, useRef, useState } from 'react'

const MAX_KG = 500
const SW = 16

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  if (to - from >= 360) to = from + 359.99
  const s = polarToCartesian(cx, cy, r, from)
  const e = polarToCartesian(cx, cy, r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)
  useEffect(() => {
    const from = fromRef.current
    const start = Date.now()
    let raf: number
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) { raf = requestAnimationFrame(tick) }
      else { fromRef.current = target }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function getTheme(kg: number) {
  if (kg < 80) return {
    color: '#10b981', glow: 'rgba(16,185,129,0.5)',
    label: 'Low impact', badgeBg: 'rgba(16,185,129,0.12)', badgeText: '#34d399',
    zone0: 'rgba(16,185,129,0.18)', zone1: 'rgba(245,158,11,0.10)', zone2: 'rgba(239,68,68,0.08)',
  }
  if (kg < 150) return {
    color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',
    label: 'Moderate', badgeBg: 'rgba(245,158,11,0.12)', badgeText: '#fbbf24',
    zone0: 'rgba(16,185,129,0.12)', zone1: 'rgba(245,158,11,0.20)', zone2: 'rgba(239,68,68,0.08)',
  }
  return {
    color: '#ef4444', glow: 'rgba(239,68,68,0.5)',
    label: 'High impact', badgeBg: 'rgba(239,68,68,0.12)', badgeText: '#f87171',
    zone0: 'rgba(16,185,129,0.08)', zone1: 'rgba(245,158,11,0.10)', zone2: 'rgba(239,68,68,0.22)',
  }
}

interface ScoreRingProps {
  kg: number
  size?: number
}

export default function ScoreRing({ kg, size = 240 }: ScoreRingProps) {
  const displayed = useCountUp(kg)
  const theme = getTheme(kg)
  const r = (size - SW) / 2
  const cx = size / 2
  const displayedAngle = Math.min((displayed / MAX_KG) * 360, 359.99)

  return (
    <svg
      width={size} height={size}
      role="img"
      aria-label={`Carbon score: ${kg.toFixed(1)} kg CO₂ this month — ${theme.label}`}
    >
      <title>{`Carbon footprint: ${kg.toFixed(1)} kg CO₂ per month — ${theme.label}`}</title>

      <defs>
        <filter id="score-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* zone tracks — subtle dark tinted arcs */}
      <path d={arcPath(cx, cx, r, 0,   144)} fill="none" stroke={theme.zone0} strokeWidth={SW} strokeLinecap="butt" />
      <path d={arcPath(cx, cx, r, 144, 252)} fill="none" stroke={theme.zone1} strokeWidth={SW} strokeLinecap="butt" />
      <path d={arcPath(cx, cx, r, 252, 360)} fill="none" stroke={theme.zone2} strokeWidth={SW} strokeLinecap="butt" />

      {/* progress fill with glow */}
      {displayedAngle > 0 && (
        <path
          d={arcPath(cx, cx, r, 0, displayedAngle)}
          fill="none"
          stroke={theme.color}
          strokeWidth={SW}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
        />
      )}

      {/* score number */}
      <text x="50%" y="42%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.18} fontWeight="800" fill="#f8fafc"
        fontFamily="Bricolage Grotesque, system-ui, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}>
        {displayed}
      </text>

      <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.072} fill="rgba(255,255,255,0.35)"
        fontFamily="JetBrains Mono, ui-monospace, monospace">
        kg CO₂ / mo
      </text>

      {/* pill badge */}
      <rect x={cx - 52} y={size * 0.645} width={104} height={24} rx={12} fill={theme.badgeBg} />
      <text x="50%" y={size * 0.645 + 12} dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.062} fontWeight="600" fill={theme.badgeText}
        fontFamily="system-ui, sans-serif">
        {theme.label}
      </text>
    </svg>
  )
}
