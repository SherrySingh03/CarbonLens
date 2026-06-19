import { memo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { InsightTip } from '../types'

const CATEGORY_STYLE: Record<string, { border: string; bg: string }> = {
  transport: { border: 'border-l-blue-500/60',  bg: 'bg-blue-500/[0.05]'   },
  energy:    { border: 'border-l-orange-500/60', bg: 'bg-orange-500/[0.05]' },
  diet:      { border: 'border-l-emerald-500/60',bg: 'bg-emerald-500/[0.05]'},
  purchases: { border: 'border-l-purple-500/60', bg: 'bg-purple-500/[0.05]' },
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   'bg-emerald-500/10 text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-400',
  hard:   'bg-red-500/10 text-red-400',
}

interface InsightCardProps {
  tip: InsightTip
  onCommit: (id: string) => void
}

const InsightCard = memo(function InsightCard({ tip, onCommit }: InsightCardProps) {
  const style = CATEGORY_STYLE[tip.category] ?? { border: 'border-l-zinc-500/40', bg: 'bg-white/[0.03]' }
  const diffStyle = DIFFICULTY_STYLE[tip.difficulty] ?? 'bg-zinc-500/10 text-zinc-400'
  const diffLabel = tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)

  return (
    <article
      className={`rounded-3xl border border-white/7 border-l-4 p-5 ${style.border} ${style.bg} backdrop-blur-sm`}
      aria-label={tip.title}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-semibold text-white leading-snug">{tip.title}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${diffStyle}`}>
          {diffLabel}
        </span>
      </div>
      <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{tip.description}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
          Saves ~{tip.estimatedSavingKgCO2.toFixed(1)} kg CO₂/mo
        </span>
        {tip.committed ? (
          <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={15} /> Committed
          </span>
        ) : (
          <button
            onClick={() => onCommit(tip.id)}
            className="text-sm font-semibold text-emerald-400 border border-emerald-500/30 rounded-xl px-3 py-1 hover:bg-emerald-500/10 transition-colors focus-ring whitespace-nowrap"
          >
            Commit to this
          </button>
        )}
      </div>
    </article>
  )
})

export default InsightCard
