import { memo, useState } from 'react'
import { Car, Zap, UtensilsCrossed, ShoppingBag, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CategoryMeta {
  label: string
  Icon: LucideIcon
  iconColor: string
  barGrad: string
  valColor: string
  rowStyle: React.CSSProperties
}

const CATEGORY: Record<string, CategoryMeta> = {
  transport: {
    label: 'Transport', Icon: Car,
    iconColor: 'oklch(0.74 0.16 35)',
    barGrad:   'linear-gradient(90deg, oklch(0.85 0.14 90), oklch(0.70 0.18 33))',
    valColor:  'oklch(0.74 0.16 35)',
    rowStyle:  { background: 'oklch(0.70 0.18 33 / 0.06)', border: '1px solid oklch(0.70 0.18 33 / 0.18)' },
  },
  energy: {
    label: 'Energy', Icon: Zap,
    iconColor: 'oklch(0.85 0.14 90)',
    barGrad:   'linear-gradient(90deg, oklch(0.87 0.185 150), oklch(0.85 0.14 90))',
    valColor:  'oklch(0.85 0.14 90)',
    rowStyle:  { background: 'oklch(0.85 0.14 90 / 0.06)', border: '1px solid oklch(0.85 0.14 90 / 0.18)' },
  },
  diet: {
    label: 'Diet', Icon: UtensilsCrossed,
    iconColor: 'oklch(0.87 0.185 150)',
    barGrad:   'linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150))',
    valColor:  'oklch(0.84 0.16 152)',
    rowStyle:  { background: 'oklch(0.87 0.185 150 / 0.06)', border: '1px solid oklch(0.87 0.185 150 / 0.18)' },
  },
  purchases: {
    label: 'Purchases', Icon: ShoppingBag,
    iconColor: 'oklch(0.72 0.09 300)',
    barGrad:   'linear-gradient(90deg, oklch(0.72 0.09 300), oklch(0.65 0.12 320))',
    valColor:  'oklch(0.72 0.09 300)',
    rowStyle:  { background: 'oklch(0.72 0.09 300 / 0.06)', border: '1px solid oklch(0.72 0.09 300 / 0.18)' },
  },
}

export interface ExplainRow {
  label: string
  factor: string
  kg: number
}

export interface ExplainData {
  rows: ExplainRow[]
  source: string
}

interface CategoryBarProps {
  category: string
  kg: number
  total: number
  explain?: ExplainData
}

const CategoryBar = memo(function CategoryBar({ category, kg, total, explain }: CategoryBarProps) {
  const meta = CATEGORY[category]
  if (!meta) return null
  const { label, Icon, iconColor, barGrad, valColor, rowStyle } = meta
  const pct = total > 0 ? (kg / total) * 100 : 0
  const [open, setOpen] = useState(false)

  return (
    <div style={{ ...rowStyle, borderRadius: '1rem', overflow: 'hidden' }}>
      {/* Main row — always visible */}
      <div
        className={`flex items-center gap-3 px-4 py-3 ${explain ? 'cursor-pointer select-none' : ''}`}
        onClick={explain ? () => setOpen((o) => !o) : undefined}
        onKeyDown={explain ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o) } } : undefined}
        role={explain ? 'button' : undefined}
        tabIndex={explain ? 0 : undefined}
        aria-expanded={explain ? open : undefined}
      >
        <div style={{ color: iconColor, flexShrink: 0 }}>
          <Icon size={17} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--cl-text-muted)' }}>{label}</span>
            <div className="flex items-baseline gap-2">
              <span className="font-data text-sm font-semibold" style={{ color: valColor }}>{kg.toFixed(1)} kg</span>
              <span className="text-xs" style={{ color: 'var(--cl-text-subtle)' }}>{pct.toFixed(0)}%</span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barGrad }}
              role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
              aria-label={`${label}: ${pct.toFixed(0)}% of total`}
            />
          </div>
        </div>
        {explain && (
          <ChevronDown
            size={15}
            style={{
              color: 'var(--cl-text-subtle)', flexShrink: 0, marginLeft: 4,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.22s ease',
            }}
          />
        )}
      </div>

      {/* Explain drawer */}
      {explain && open && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ height: 1, background: 'oklch(0.5 0.02 170 / 0.14)', marginBottom: 14 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {explain.rows.map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: 'var(--cl-text-muted)' }}>
                  {row.label}{' '}
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--cl-text-subtle)' }}>{row.factor}</span>
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: valColor, flexShrink: 0, marginLeft: 12 }}>
                  {row.kg >= 0 ? '+' : ''}{row.kg.toFixed(2)} kg
                </span>
              </div>
            ))}
            <div style={{ height: 1, background: 'oklch(0.5 0.02 170 / 0.1)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
              <span style={{ color: 'var(--cl-text)' }}>{label} total</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: valColor }}>{kg.toFixed(2)} kg</span>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
            padding: '8px 10px', borderRadius: 10,
            background: 'oklch(0.235 0.018 172 / 0.6)',
            fontSize: 11, color: 'var(--cl-text-subtle)', lineHeight: 1.45,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/>
            </svg>
            {explain.source}
          </div>
        </div>
      )}
    </div>
  )
})

export default CategoryBar
