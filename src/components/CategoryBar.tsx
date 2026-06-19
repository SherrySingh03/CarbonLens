import { memo } from 'react'
import { Car, Zap, UtensilsCrossed, ShoppingBag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CategoryMeta {
  label: string
  Icon: LucideIcon
  rowBg: string
  iconColor: string
  barClass: string
}

const CATEGORY: Record<string, CategoryMeta> = {
  transport: {
    label: 'Transport',
    Icon: Car,
    rowBg: 'bg-blue-50 border border-blue-100',
    iconColor: 'text-blue-600',
    barClass: 'bg-gradient-to-r from-blue-400 to-blue-500',
  },
  energy: {
    label: 'Energy',
    Icon: Zap,
    rowBg: 'bg-orange-50 border border-orange-100',
    iconColor: 'text-orange-500',
    barClass: 'bg-gradient-to-r from-orange-400 to-orange-500',
  },
  diet: {
    label: 'Diet',
    Icon: UtensilsCrossed,
    rowBg: 'bg-emerald-50 border border-emerald-100',
    iconColor: 'text-emerald-600',
    barClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  },
  purchases: {
    label: 'Purchases',
    Icon: ShoppingBag,
    rowBg: 'bg-purple-50 border border-purple-100',
    iconColor: 'text-purple-600',
    barClass: 'bg-gradient-to-r from-purple-400 to-purple-500',
  },
}

interface CategoryBarProps {
  category: string
  kg: number
  total: number
}

const CategoryBar = memo(function CategoryBar({ category, kg, total }: CategoryBarProps) {
  const meta = CATEGORY[category]
  if (!meta) return null
  const { label, Icon, rowBg, iconColor, barClass } = meta
  const pct = total > 0 ? (kg / total) * 100 : 0

  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${rowBg}`}>
      <div className={`shrink-0 ${iconColor}`}>
        <Icon size={18} strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-sm font-medium text-zinc-700">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data text-sm font-medium text-zinc-900">{kg.toFixed(1)} kg</span>
            <span className="text-xs text-muted">{pct.toFixed(0)}%</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
          <div
            className={`h-full ${barClass} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label}: ${pct.toFixed(0)}% of total`}
          />
        </div>
      </div>
    </div>
  )
})

export default CategoryBar
