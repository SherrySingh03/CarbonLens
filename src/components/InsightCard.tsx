import { memo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { InsightTip } from '../types'

const CATEGORY_STYLE: Record<string, { border: string; bg: string }> = {
  transport: { border: 'oklch(0.74 0.16 35 / 0.55)',   bg: 'oklch(0.70 0.18 33 / 0.05)'   },
  energy:    { border: 'oklch(0.85 0.14 90 / 0.55)',   bg: 'oklch(0.85 0.14 90 / 0.05)'   },
  diet:      { border: 'oklch(0.87 0.185 150 / 0.55)', bg: 'oklch(0.87 0.185 150 / 0.05)' },
  purchases: { border: 'oklch(0.72 0.09 300 / 0.55)',  bg: 'oklch(0.72 0.09 300 / 0.05)'  },
}

const DIFFICULTY_STYLE: Record<string, { color: string; bg: string }> = {
  easy:   { color: 'oklch(0.84 0.16 152)', bg: 'oklch(0.84 0.16 152 / 0.12)' },
  medium: { color: 'oklch(0.85 0.14 90)',  bg: 'oklch(0.85 0.14 90 / 0.12)'  },
  hard:   { color: 'oklch(0.74 0.16 35)',  bg: 'oklch(0.70 0.18 33 / 0.12)'  },
}

interface InsightCardProps {
  tip: InsightTip
  onCommit: (id: string) => void
  onComplete: (id: string) => void
}

const InsightCard = memo(function InsightCard({ tip, onCommit, onComplete }: InsightCardProps) {
  const cs = CATEGORY_STYLE[tip.category] ?? { border: 'oklch(0.5 0.02 170 / 0.3)', bg: 'var(--cl-surface)' }
  const ds = DIFFICULTY_STYLE[tip.difficulty] ?? { color: 'var(--cl-text-muted)', bg: 'oklch(0.3 0.016 170 / 0.3)' }

  return (
    <article
      style={{
        borderRadius: '1.25rem',
        border: `1px solid var(--cl-border)`,
        borderLeftWidth: 4,
        borderLeftColor: tip.completed ? 'oklch(0.84 0.16 152 / 0.7)' : cs.border,
        background: tip.completed ? 'oklch(0.84 0.16 152 / 0.05)' : cs.bg,
        padding: '1.25rem',
        opacity: tip.completed ? 0.8 : 1,
      }}
      aria-label={tip.title}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-semibold leading-snug" style={{ color: 'var(--cl-text)' }}>
          {tip.title}
        </h3>
        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: ds.color, background: ds.bg }}>
          {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
        </span>
      </div>

      <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--cl-text-muted)' }}>
        {tip.description}
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ color: 'oklch(0.84 0.16 152)', background: 'oklch(0.84 0.16 152 / 0.12)', border: '1px solid oklch(0.84 0.16 152 / 0.28)' }}>
          Saves ~{tip.estimatedSavingKgCO2.toFixed(1)} kg CO₂/mo
        </span>

        {tip.completed ? (
          <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'oklch(0.84 0.16 152)' }}>
            <CheckCircle2 size={15} /> Done {tip.completedAt ? `· ${tip.completedAt}` : ''}
          </span>
        ) : tip.committed ? (
          /* Committed but not done — show Mark Done */
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'oklch(0.87 0.185 150)' }}>
              <CheckCircle2 size={12} /> Committed
            </span>
            <button
              onClick={() => onComplete(tip.id)}
              className="text-sm font-semibold rounded-xl px-3 py-1 focus-ring transition-colors whitespace-nowrap"
              style={{ color: 'oklch(0.84 0.16 152)', border: '1px solid oklch(0.84 0.16 152 / 0.35)', background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.84 0.16 152 / 0.10)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Mark done ✓
            </button>
          </div>
        ) : (
          /* Uncommitted — show both options */
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCommit(tip.id)}
              className="text-sm font-semibold rounded-xl px-3 py-1 focus-ring transition-colors whitespace-nowrap"
              style={{ color: 'oklch(0.87 0.185 150)', border: '1px solid oklch(0.87 0.185 150 / 0.30)', background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.87 0.185 150 / 0.10)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Will try
            </button>
            <button
              onClick={() => onComplete(tip.id)}
              className="text-sm font-semibold rounded-xl px-3 py-1 focus-ring transition-colors whitespace-nowrap"
              style={{ color: 'oklch(0.84 0.16 152)', border: '1px solid oklch(0.84 0.16 152 / 0.35)', background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.84 0.16 152 / 0.10)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Done ✓
            </button>
          </div>
        )}
      </div>
    </article>
  )
})

export default InsightCard
