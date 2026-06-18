import { memo } from 'react'
import type { InsightTip } from '../types'

const CATEGORY_BORDER: Record<string, string> = {
  transport: 'border-l-blue-500',
  energy: 'border-l-orange-500',
  diet: 'border-l-green-500',
  purchases: 'border-l-purple-500',
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
  const borderColor = CATEGORY_BORDER[tip.category] ?? 'border-l-gray-300'
  const diffStyle = DIFFICULTY_STYLE[tip.difficulty] ?? 'bg-gray-100 text-gray-700'
  const diffLabel = tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)

  return (
    <article
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 ${borderColor}`}
      aria-label={tip.title}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 leading-snug">{tip.title}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${diffStyle}`}>
          {diffLabel}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{tip.description}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
          Saves ~{tip.estimatedSavingKgCO2.toFixed(1)} kg CO₂/mo
        </span>
        {tip.committed ? (
          <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
            ✓ Committed
          </span>
        ) : (
          <button
            onClick={() => onCommit(tip.id)}
            className="text-sm font-semibold text-green-600 border border-green-600 rounded-xl px-3 py-1 hover:bg-green-50 transition-colors focus-visible:ring-2 focus-visible:ring-green-600 whitespace-nowrap"
          >
            Commit to this
          </button>
        )}
      </div>
    </article>
  )
})

export default InsightCard
