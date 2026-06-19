import { useState } from 'react'
import { Lightbulb, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import InsightCard from '../components/InsightCard'
import { fetchInsights } from '../lib/ai'

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 bg-[#D4E4CC] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[#D4E4CC] rounded w-full mb-1.5" />
      <div className="h-3 bg-[#D4E4CC] rounded w-2/3 mb-4" />
      <div className="h-7 bg-[#D4E4CC] rounded-full w-1/3" />
    </div>
  )
}

export default function Insights() {
  const { todayLog, profile, tips, commitTip, saveInsightTips } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [committedOpen, setCommittedOpen] = useState(false)

  const uncommitted = tips
    .filter((t) => !t.committed)
    .sort((a, b) => b.estimatedSavingKgCO2 - a.estimatedSavingKgCO2)
  const committed = tips.filter((t) => t.committed)
  const totalPotential = uncommitted.reduce((sum, t) => sum + t.estimatedSavingKgCO2, 0)

  async function handleRefresh() {
    if (!todayLog || !profile) return
    setLoading(true)
    setError(null)
    try {
      const committedIds = committed.map((t) => t.id)
      const newTips = await fetchInsights(todayLog, profile, committedIds)
      saveInsightTips(newTips)
    } catch {
      setError('Could not load tips. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="Personalised reduction plan" className="animate-slide-up">
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-[#D4E4CC]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A2E1A]">Your reduction plan</h1>
          {totalPotential > 0 && (
            <p className="text-sm text-muted mt-0.5">
              Potential saving:{' '}
              <strong className="text-green-700">{totalPotential.toFixed(1)} kg CO₂/mo</strong>
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || !todayLog}
          className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-green-700 border border-green-300 bg-green-50 rounded-xl px-3 py-2 hover:bg-green-100 transition-colors disabled:opacity-40 focus-ring"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Refresh tips'}
        </button>
      </div>

      {!todayLog && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
          Log your footprint first to get personalised tips.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : uncommitted.length === 0 && tips.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb size={24} className="text-amber-600" />
            </div>
            <p className="font-display font-semibold text-[#1A2E1A]">No tips yet</p>
            <p className="text-sm text-muted mt-1">Tap Refresh tips to get your personalised plan</p>
          </div>
        ) : (
          uncommitted.map((tip) => (
            <InsightCard key={tip.id} tip={tip} onCommit={commitTip} />
          ))
        )}
      </div>

      {committed.length > 0 && (
        <div className="mt-6 border-t border-[#D4E4CC] pt-5">
          <button
            onClick={() => setCommittedOpen((o) => !o)}
            className="text-sm font-medium text-muted flex items-center gap-1.5 hover:text-[#1A2E1A] transition-colors focus-ring rounded-lg"
            aria-expanded={committedOpen}
          >
            {committedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Committed ({committed.length}) —{' '}
            <strong className="text-green-700">
              {committed.reduce((s, t) => s + t.estimatedSavingKgCO2, 0).toFixed(1)} kg CO₂/mo
            </strong>{' '}
            saved
          </button>
          {committedOpen && (
            <div className="space-y-3 mt-3">
              {committed.map((tip) => (
                <InsightCard key={tip.id} tip={tip} onCommit={commitTip} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
