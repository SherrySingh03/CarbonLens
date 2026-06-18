import { useEffect, useRef } from 'react'

interface ScoreRingProps {
  kg: number
  size?: number
}

function getColor(kg: number): string {
  if (kg < 80) return '#16a34a'
  if (kg <= 150) return '#d97706'
  return '#dc2626'
}

function getLabel(kg: number): string {
  if (kg < 80) return 'Low impact'
  if (kg <= 150) return 'Moderate'
  return 'High impact'
}

export default function ScoreRing({ kg, size = 200 }: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const maxKg = 500
  const fillPct = Math.min(kg / maxKg, 1)
  const color = getColor(kg)
  const label = getLabel(kg)

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.strokeDashoffset = String(circumference)
    const id = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 800ms ease-out'
      el.style.strokeDashoffset = String(circumference * (1 - fillPct))
    })
    return () => cancelAnimationFrame(id)
  }, [circumference, fillPct])

  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`Carbon score: ${kg.toFixed(1)} kg CO₂ this month — ${label}`}
    >
      <title>{`Carbon footprint: ${kg.toFixed(1)} kg CO₂ per month — ${label}`}</title>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={16}
      />
      <circle
        ref={circleRef}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={16}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="42%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.155}
        fontWeight="bold"
        fill="#111827"
      >
        {kg.toFixed(0)}
      </text>
      <text
        x="50%"
        y="57%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.072}
        fill="#6b7280"
      >
        kg CO₂/mo
      </text>
      <text
        x="50%"
        y="70%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.065}
        fontWeight="600"
        fill={color}
      >
        {label}
      </text>
    </svg>
  )
}
