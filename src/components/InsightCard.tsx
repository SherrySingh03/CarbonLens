import { memo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { InsightTip } from '../types'

const CATEGORY_COLOR: Record<string, string> = {
  transport: 'bg-blue-50 border-l-blue-400',
  energy: 'bg-orange-50 border-l-orange-400',
  diet: 'bg-green-50 border-l-green-500',
  purchases: 'bg-purple-50 border-l-purple-400',
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

interface InsightCardProps {
  tip: InsightTip
  onCommit: (id: string) => void
}

const InsightCard = memo(function InsightCard({ tip, onCommit }: InsightCardProps) {
  const cardColor = CATEGORY_COLOR[tip.category] ?? 'bg-white border-l-gray-300'
  const diffStyle = DIFFICULTY_STYLE[tip.difficulty] ?? 'bg-gray-100 text-gray-700'
  const diffLabel = tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)

  return (
    <article
      className={`rounded-3xl border border-[#D4E4CC] border-l-4 p-5 shadow-sm ${cardColor}`}
      aria-label={tip.title}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-semibold text-[#1A2E1A] leading-snug">{tip.title}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${diffStyle}`}>
          {diffLabel}
        </span>
      </div>
      <p className="text-sm text-muted line-clamp-2 mb-4">{tip.description}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full whitespace-nowrap">
          Saves ~{tip.estimatedSavingKgCO2.toFixed(1)} kg CO₂/mo
        </span>
        {tip.committed ? (
          <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
            <CheckCircle2 size={15} /> Committed
          </span>
        ) : (
          <button
            onClick={() => onCommit(tip.id)}
            className="text-sm font-semibold text-green-600 border border-green-500 rounded-xl px-3 py-1 hover:bg-green-50 transition-colors focus-ring whitespace-nowrap"
          >
            Commit to this
          </button>
        )}
      </div>
    </article>
  )
})

export default InsightCard
