import { useEffect, useRef, useState } from 'react'

const MAX_KG = 500
const SW = 18 // stroke width

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

function getTheme(kg: number): { color: string; trackHigh: string; label: string; badgeBg: string; badgeText: string } {
  if (kg < 80) return { color: '#16a34a', trackHigh: '#bbf7d0', label: 'Low impact',   badgeBg: '#dcfce7', badgeText: '#15803d' }
  if (kg < 150) return { color: '#d97706', trackHigh: '#fde68a', label: 'Moderate',    badgeBg: '#fef3c7', badgeText: '#b45309' }
  return          { color: '#dc2626', trackHigh: '#fecaca', label: 'High impact', badgeBg: '#fee2e2', badgeText: '#b91c1c' }
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
      width={size}
      height={size}
      role="img"
      aria-label={`Carbon score: ${kg.toFixed(1)} kg CO₂ this month — ${theme.label}`}
    >
      <title>{`Carbon footprint: ${kg.toFixed(1)} kg CO₂ per month — ${theme.label}`}</title>

      {/* Zone track — pale green / amber / red arcs */}
      <path d={arcPath(cx, cx, r, 0,   144)} fill="none" stroke="#bbf7d0" strokeWidth={SW} strokeLinecap="butt" />
      <path d={arcPath(cx, cx, r, 144, 252)} fill="none" stroke="#fde68a" strokeWidth={SW} strokeLinecap="butt" />
      <path d={arcPath(cx, cx, r, 252, 360)} fill="none" stroke="#fecaca" strokeWidth={SW} strokeLinecap="butt" />

      {/* Progress fill */}
      {displayedAngle > 0 && (
        <path
          d={arcPath(cx, cx, r, 0, displayedAngle)}
          fill="none"
          stroke={theme.color}
          strokeWidth={SW}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${theme.color}44)` }}
        />
      )}

      {/* Score number */}
      <text
        x="50%"
        y="42%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.18}
        fontWeight="800"
        fill="#1A2E1A"
        fontFamily="Bricolage Grotesque, system-ui, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {displayed}
      </text>

      <text
        x="50%"
        y="56%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.075}
        fill="#6B7E6B"
        fontFamily="system-ui, sans-serif"
      >
        kg CO₂ / mo
      </text>

      {/* Pill badge */}
      <rect
        x={cx - 52}
        y={size * 0.64}
        width={104}
        height={24}
        rx={12}
        fill={theme.badgeBg}
      />
      <text
        x="50%"
        y={size * 0.64 + 12}
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.065}
        fontWeight="600"
        fill={theme.badgeText}
        fontFamily="system-ui, sans-serif"
      >
        {theme.label}
      </text>
    </svg>
  )
}
