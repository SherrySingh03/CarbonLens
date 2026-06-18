import { useState } from 'react'
import { useApp } from '../context/AppContext'
import InsightCard from '../components/InsightCard'
import { fetchInsights } from '../lib/ai'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-full mb-1.5" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-7 bg-gray-200 rounded-full w-1/3" />
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
    <section aria-label="Personalised reduction plan">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Your reduction plan</h1>
          {totalPotential > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              Potential saving:{' '}
              <strong className="text-green-600">{totalPotential.toFixed(1)} kg CO₂/mo</strong>
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || !todayLog}
          className="shrink-0 text-sm font-medium text-green-600 border border-green-600 rounded-xl px-3 py-1.5 hover:bg-green-50 transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-green-600"
        >
          {loading ? 'Loading…' : '↻ Refresh tips'}
        </button>
      </div>

      {!todayLog && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
          Log your footprint first to get personalised tips.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-3">
          {error}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : uncommitted.length === 0 && tips.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <p className="text-5xl mb-3">💡</p>
            <p className="font-medium text-gray-600">No tips yet</p>
            <p className="text-sm mt-1">Tap Refresh tips to get your personalised plan</p>
          </div>
        ) : (
          uncommitted.map((tip) => (
            <InsightCard key={tip.id} tip={tip} onCommit={commitTip} />
          ))
        )}
      </div>

      {committed.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            onClick={() => setCommittedOpen((o) => !o)}
            className="text-sm font-medium text-gray-500 flex items-center gap-1.5 hover:text-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600 rounded"
            aria-expanded={committedOpen}
          >
            <span>{committedOpen ? '▾' : '▸'}</span>
            <span>
              Committed ({committed.length}) —{' '}
              <strong className="text-green-600">
                {committed.reduce((s, t) => s + t.estimatedSavingKgCO2, 0).toFixed(1)} kg CO₂/mo
              </strong>{' '}
              saved
            </span>
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
