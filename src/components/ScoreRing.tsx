import { useEffect, useRef, useState } from 'react'
import { ecoScoreGrade, ECO_SCORE_MAX } from '../lib/emissions'

const SW = 14

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
  const displayedRef = useRef(0)
  useEffect(() => {
    const from = displayedRef.current
    const start = Date.now()
    let raf: number
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = Math.round(from + (target - from) * eased)
      displayedRef.current = next
      setValue(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

interface ScoreRingProps {
  score: number  // 0–850 eco score
  kg: number     // net monthly kg CO₂ for subtitle
  size?: number
}

export default function ScoreRing({ score, kg, size = 240 }: ScoreRingProps) {
  const displayedScore = useCountUp(score)
  const grade = ecoScoreGrade(score)
  const r = (size - SW) / 2
  const cx = size / 2
  // Higher score = more arc filled (score / max * 360)
  const displayedAngle = Math.min((displayedScore / ECO_SCORE_MAX) * 360, 359.99)

  const gradId = `gauge-grad-${size}`
  const glowId = `gauge-glow-${size}`

  return (
    <svg
      width={size} height={size}
      overflow="visible"
      role="img"
      aria-label={`Eco score: ${score} out of 850 — ${grade.label}`}
    >
      <title>{`Eco score: ${score}/850 — ${grade.label} — ${kg.toFixed(1)} kg CO₂/mo net`}</title>

      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="oklch(0.83 0.105 205)" />
          <stop offset="55%"  stopColor="oklch(0.87 0.185 150)" />
          <stop offset="100%" stopColor="oklch(0.84 0.16 152)"  />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Track */}
      <path
        d={arcPath(cx, cx, r, 0, 359.99)}
        fill="none"
        stroke="oklch(0.3 0.016 170 / 0.5)"
        strokeWidth={SW}
        strokeLinecap="butt"
      />

      {/* Progress arc — higher score = more filled */}
      {displayedAngle > 0 && (
        <path
          d={arcPath(cx, cx, r, 0, displayedAngle)}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={SW}
          strokeLinecap="round"
          style={{ filter: `url(#${glowId}) drop-shadow(0 0 8px oklch(0.87 0.185 150 / 0.5))` }}
        />
      )}

      {/* "ECO SCORE" micro-label above number */}
      <text
        x="50%" y="25%"
        dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.055}
        fill="oklch(0.72 0.018 165)"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        style={{ letterSpacing: '0.08em', textTransform: 'uppercase' } as React.CSSProperties}
      >
        ECO SCORE
      </text>

      {/* Score number */}
      <text
        x="50%" y="40%"
        dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.21} fontWeight="700"
        fill="oklch(0.97 0.01 160)"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}
      >
        {displayedScore}
      </text>

      {/* kg subtitle */}
      <text
        x="50%" y="55%"
        dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.065}
        fill="oklch(0.72 0.018 165)"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        style={{ letterSpacing: '0.02em' }}
      >
        {kg.toFixed(1)} kg CO₂/mo
      </text>

      {/* Grade pill */}
      <rect
        x={cx - 52} y={size * 0.62}
        width={104} height={26}
        rx={13}
        fill={grade.bg}
        stroke={grade.border}
        strokeWidth={1}
      />
      <text
        x="50%" y={size * 0.62 + 13}
        dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.062} fontWeight="600"
        fill={grade.color}
        fontFamily="'Hanken Grotesk', system-ui, sans-serif"
      >
        {grade.label}
      </text>
    </svg>
  )
}
