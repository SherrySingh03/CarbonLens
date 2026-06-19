import { memo } from 'react'
import { Car, Zap, UtensilsCrossed, ShoppingBag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CategoryMeta { label: string; Icon: LucideIcon; rowBg: string; iconColor: string; barClass: string }

const CATEGORY: Record<string, CategoryMeta> = {
  transport: {
    label: 'Transport', Icon: Car,
    rowBg: 'border border-blue-500/15 bg-blue-500/[0.06]',
    iconColor: 'text-blue-400',
    barClass: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  energy: {
    label: 'Energy', Icon: Zap,
    rowBg: 'border border-orange-500/15 bg-orange-500/[0.06]',
    iconColor: 'text-orange-400',
    barClass: 'bg-gradient-to-r from-orange-500 to-amber-400',
  },
  diet: {
    label: 'Diet', Icon: UtensilsCrossed,
    rowBg: 'border border-emerald-500/15 bg-emerald-500/[0.06]',
    iconColor: 'text-emerald-400',
    barClass: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
  purchases: {
    label: 'Purchases', Icon: ShoppingBag,
    rowBg: 'border border-purple-500/15 bg-purple-500/[0.06]',
    iconColor: 'text-purple-400',
    barClass: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
}

interface CategoryBarProps { category: string; kg: number; total: number }

const CategoryBar = memo(function CategoryBar({ category, kg, total }: CategoryBarProps) {
  const meta = CATEGORY[category]
  if (!meta) return null
  const { label, Icon, rowBg, iconColor, barClass } = meta
  const pct = total > 0 ? (kg / total) * 100 : 0

  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${rowBg}`}>
      <div className={`shrink-0 ${iconColor}`}>
        <Icon size={17} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-sm font-medium text-zinc-400">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data text-sm font-semibold text-white">{kg.toFixed(1)} kg</span>
            <span className="text-xs text-zinc-600">{pct.toFixed(0)}%</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className={`h-full ${barClass} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
            role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
            aria-label={`${label}: ${pct.toFixed(0)}% of total`}
          />
        </div>
      </div>
    </div>
  )
})

export default CategoryBar
