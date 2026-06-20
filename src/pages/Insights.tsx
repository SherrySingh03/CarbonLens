import { useState, useCallback } from 'react'
import { Lightbulb, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import InsightCard from '../components/InsightCard'
import RewardPopup from '../components/RewardPopup'
import { fetchInsights } from '../lib/ai'
import type { InsightTip } from '../types'

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 rounded w-3/4 mb-3" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }} />
      <div className="h-3 rounded w-full mb-1.5" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }} />
      <div className="h-3 rounded w-2/3 mb-4" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }} />
      <div className="h-7 rounded-full w-1/3" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }} />
    </div>
  )
}

export default function Insights() {
  const { todayLog, profile, tips, completedSavingKgCO2, commitTip, completeTip, saveInsightTips } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [committedOpen, setCommittedOpen] = useState(true)
  const [completedOpen, setCompletedOpen] = useState(false)
  const [rewardTip, setRewardTip] = useState<InsightTip | null>(null)

  const active    = tips.filter((t) => !t.committed && !t.completed).sort((a, b) => b.estimatedSavingKgCO2 - a.estimatedSavingKgCO2)
  const committed = tips.filter((t) => t.committed && !t.completed)
  const completed = tips.filter((t) => t.completed)
  const totalPotential = active.reduce((s, t) => s + t.estimatedSavingKgCO2, 0)

  const handleComplete = useCallback((id: string) => {
    completeTip(id)
    const tip = tips.find((t) => t.id === id)
    if (tip) setRewardTip({ ...tip, completed: true })
  }, [completeTip, tips])

  async function handleRefresh() {
    if (!todayLog || !profile) return
    setLoading(true)
    setError(null)
    try {
      const newTips = await fetchInsights(todayLog, profile, [...committed, ...completed].map((t) => t.id))
      saveInsightTips(newTips)
    } catch {
      setError('Could not load tips. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="Personalised reduction plan" className="animate-slide-up">
      <RewardPopup tip={rewardTip} onClose={() => setRewardTip(null)} />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 pb-5" style={{ borderBottom: '1px solid var(--cl-border)' }}>
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.02em' }}>Your reduction plan</h1>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {totalPotential > 0 && (
              <p className="text-sm" style={{ color: 'var(--cl-text-muted)' }}>
                Potential:{' '}
                <strong style={{ color: 'oklch(0.87 0.185 150)' }}>{totalPotential.toFixed(1)} kg/mo</strong>
              </p>
            )}
            {completedSavingKgCO2 > 0 && (
              <p className="text-sm" style={{ color: 'var(--cl-text-muted)' }}>
                Saved:{' '}
                <strong style={{ color: 'oklch(0.84 0.16 152)' }}>−{completedSavingKgCO2.toFixed(1)} kg/mo</strong>
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || !todayLog}
          className="shrink-0 flex items-center gap-1.5 text-sm font-medium rounded-xl px-3 py-2 focus-ring transition-colors disabled:opacity-40"
          style={{ color: 'oklch(0.87 0.185 150)', border: '1px solid oklch(0.87 0.185 150 / 0.28)', background: 'oklch(0.87 0.185 150 / 0.07)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Refresh tips'}
        </button>
      </div>

      {!todayLog && (
        <p className="text-sm rounded-2xl px-4 py-3 mb-4" style={{ color: 'oklch(0.85 0.14 90)', background: 'oklch(0.85 0.14 90 / 0.08)', border: '1px solid oklch(0.85 0.14 90 / 0.22)' }}>
          Log your footprint first to get personalised tips.
        </p>
      )}
      {error && (
        <p className="text-sm rounded-2xl px-4 py-3 mb-4" style={{ color: 'oklch(0.74 0.16 35)', background: 'oklch(0.70 0.18 33 / 0.08)', border: '1px solid oklch(0.70 0.18 33 / 0.22)' }}>
          {error}
        </p>
      )}

      {/* Active tips */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : active.length === 0 && tips.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'oklch(0.85 0.14 90 / 0.10)', border: '1px solid oklch(0.85 0.14 90 / 0.22)' }}>
              <Lightbulb size={24} style={{ color: 'oklch(0.85 0.14 90)' }} />
            </div>
            <p className="font-display font-semibold" style={{ color: 'var(--cl-text)' }}>No tips yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--cl-text-muted)' }}>Tap Refresh tips to get your personalised plan</p>
          </div>
        ) : active.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="font-display font-semibold mb-1" style={{ color: 'oklch(0.84 0.16 152)' }}>All tips actioned 🌱</p>
            <p className="text-sm" style={{ color: 'var(--cl-text-muted)' }}>Refresh for a new set of recommendations.</p>
          </div>
        ) : (
          active.map((tip) => (
            <InsightCard key={tip.id} tip={tip} onCommit={commitTip} onComplete={handleComplete} />
          ))
        )}
      </div>

      {/* Committed — will try */}
      {committed.length > 0 && (
        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--cl-border)' }}>
          <button
            onClick={() => setCommittedOpen((o) => !o)}
            className="text-sm font-medium flex items-center gap-1.5 focus-ring rounded-lg w-full text-left mb-3"
            style={{ color: 'var(--cl-text-muted)' }}
            aria-expanded={committedOpen}
            aria-controls="committed-tips-list"
          >
            {committedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Will try ({committed.length})</span>
            <span style={{ color: 'oklch(0.87 0.185 150)', marginLeft: 4 }}>
              · {committed.reduce((s, t) => s + t.estimatedSavingKgCO2, 0).toFixed(1)} kg/mo potential
            </span>
          </button>
          {committedOpen && (
            <div id="committed-tips-list" className="space-y-3">
              {committed.map((tip) => (
                <InsightCard key={tip.id} tip={tip} onCommit={commitTip} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--cl-border)' }}>
          <button
            onClick={() => setCompletedOpen((o) => !o)}
            className="text-sm font-medium flex items-center gap-1.5 focus-ring rounded-lg w-full text-left mb-3"
            style={{ color: 'var(--cl-text-muted)' }}
            aria-expanded={completedOpen}
            aria-controls="completed-tips-list"
          >
            {completedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Completed ({completed.length})</span>
            <span style={{ color: 'oklch(0.84 0.16 152)', marginLeft: 4 }}>
              · −{completedSavingKgCO2.toFixed(1)} kg/mo saved
            </span>
          </button>
          {completedOpen && (
            <div id="completed-tips-list" className="space-y-3">
              {completed.map((tip) => (
                <InsightCard key={tip.id} tip={tip} onCommit={commitTip} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
