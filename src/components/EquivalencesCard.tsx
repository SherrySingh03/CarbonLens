import { memo } from 'react'

interface Anchor {
  emoji: string
  value: number
  unit: string
  label: string
  accentColor: string
  bgColor: string
}

function getAnchors(kg: number): Anchor[] {
  return [
    {
      emoji: '🚗',
      value: Math.round(kg / 0.192),
      unit: 'km',
      label: 'in a petrol car',
      accentColor: 'oklch(0.74 0.16 35)',
      bgColor: 'oklch(0.70 0.18 33 / 0.12)',
    },
    {
      emoji: '🌱',
      value: Math.round(kg / 1.78),
      unit: 'mo',
      label: 'for one tree to absorb it',
      accentColor: 'oklch(0.84 0.16 152)',
      bgColor: 'oklch(0.84 0.16 152 / 0.12)',
    },
    {
      emoji: '🍗',
      value: Math.round(kg / 2.4),
      unit: 'meals',
      label: 'of chicken biryani',
      accentColor: 'oklch(0.85 0.14 90)',
      bgColor: 'oklch(0.85 0.14 90 / 0.12)',
    },
    {
      emoji: '❄️',
      value: Math.round(kg / 1.07),
      unit: 'hrs',
      label: 'of 1.5-ton home AC',
      accentColor: 'oklch(0.83 0.105 205)',
      bgColor: 'oklch(0.83 0.105 205 / 0.12)',
    },
  ]
}

interface EquivalencesCardProps {
  kg: number
  period?: string
}

const EquivalencesCard = memo(function EquivalencesCard({ kg, period = 'this month' }: EquivalencesCardProps) {
  if (kg <= 0) return null
  const anchors = getAnchors(kg)

  return (
    <div className="card p-5">
      <div className="flex items-baseline gap-2 flex-wrap mb-5">
        <span style={{ fontSize: 14, color: 'var(--cl-text-muted)' }}>Your</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: 'oklch(0.87 0.185 150)', letterSpacing: '-0.02em' }}>
          {kg.toFixed(1)} kg CO₂e
        </span>
        <span style={{ fontSize: 14, color: 'var(--cl-text-muted)' }}>{period} is about the same as…</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {anchors.map((a) => (
          <div
            key={a.unit + a.label}
            style={{
              borderRadius: 14,
              background: 'oklch(0.235 0.018 172 / 0.6)',
              border: '1px solid oklch(0.5 0.02 170 / 0.14)',
              padding: '16px 16px 14px',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: a.bgColor,
              display: 'grid', placeItems: 'center',
              marginBottom: 12, fontSize: 18,
            }}>
              {a.emoji}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, lineHeight: 1, color: 'var(--cl-text)' }}>
              {a.value.toLocaleString('en-IN')}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 400, color: 'var(--cl-text-muted)', marginLeft: 5 }}>
                {a.unit}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--cl-text-muted)', marginTop: 5, lineHeight: 1.4 }}>
              {a.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 11, color: 'var(--cl-text-subtle)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/>
        </svg>
        Anchors: DEFRA 2023 · IPCC · India grid avg · FAO food emissions
      </div>
    </div>
  )
})

export default EquivalencesCard
