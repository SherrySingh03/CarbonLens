import { memo } from 'react'

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  transport: { label: 'Transport', icon: '🚗', color: 'bg-blue-500' },
  energy: { label: 'Energy', icon: '⚡', color: 'bg-orange-500' },
  diet: { label: 'Diet', icon: '🍽️', color: 'bg-green-500' },
  purchases: { label: 'Purchases', icon: '🛍️', color: 'bg-purple-500' },
}

interface CategoryBarProps {
  category: string
  kg: number
  total: number
}

const CategoryBar = memo(function CategoryBar({ category, kg, total }: CategoryBarProps) {
  const meta = CATEGORY_META[category] ?? { label: category, icon: '•', color: 'bg-gray-500' }
  const pct = total > 0 ? (kg / total) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
        {meta.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{meta.label}</span>
          <span className="text-sm font-semibold text-gray-900">{kg.toFixed(1)} kg</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${meta.color} rounded-full transition-all duration-500`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${meta.label}: ${pct.toFixed(0)}% of total`}
          />
        </div>
      </div>
    </div>
  )
})

export default CategoryBar
