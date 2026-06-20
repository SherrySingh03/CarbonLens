import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingDown, TrendingUp, Minus, PenLine, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ScoreRing from '../components/ScoreRing'
import CategoryBar, { type ExplainData } from '../components/CategoryBar'
import BenchmarkRail from '../components/BenchmarkRail'
import EquivalencesCard from '../components/EquivalencesCard'
import OnboardingIntro, { useShowIntro } from '../components/OnboardingIntro'
import {
  getMonthlyBreakdown,
  aggregateLogTotals,
  FACTORS,
  INDIA_AVERAGE_KG_CO2_PER_MONTH,
  GLOBAL_AVERAGE_KG_CO2_PER_MONTH,
  ECO_SCORE_MAX,
  ECO_SCORE_CEIL_KG,
} from '../lib/emissions'
import type { FootprintLog, InsightTip, UserProfile } from '../types'

function buildExplainData(logs: FootprintLog[]): Record<string, ExplainData> {
  if (logs.length === 0) return {}
  const n = logs.length

  const totals = aggregateLogTotals(logs)

  const last = logs[logs.length - 1]
  const carType    = last.transport.carType
  const energySrc  = last.homeEnergy.energySource
  const dietType   = last.diet.dietType
  const mealCount  = last.diet.mealCount
  const carFactor  = FACTORS.car[carType]
  const gridFactor = FACTORS.electricity[energySrc]

  const transportRows = []
  if (totals.carKm > 0)
    transportRows.push({ label: `${totals.carKm.toFixed(0)} km · ${carType} car`, factor: `× ${carFactor} kg/km`, kg: totals.carKm * carFactor })
  if (totals.flightH > 0)
    transportRows.push({ label: `${totals.flightH.toFixed(1)} h flights`, factor: `× ${FACTORS.flight}/km · 800km/h`, kg: totals.flightH * 800 * FACTORS.flight })
  if (totals.transitKm > 0)
    transportRows.push({ label: `${totals.transitKm.toFixed(0)} km transit`, factor: `× ${FACTORS.transit} kg/km`, kg: totals.transitKm * FACTORS.transit })
  if (transportRows.length === 0)
    transportRows.push({ label: 'No car, flight or transit logged', factor: '', kg: 0 })

  const energyRows = []
  if (totals.kwh > 0)
    energyRows.push({ label: `${totals.kwh.toFixed(1)} kWh · ${energySrc}`, factor: `× ${gridFactor} kg/kWh`, kg: totals.kwh * gridFactor })
  if (totals.gas > 0)
    energyRows.push({ label: `${totals.gas.toFixed(1)} m³ gas`, factor: `× ${FACTORS.gas} kg/m³`, kg: totals.gas * FACTORS.gas })
  if (energyRows.length === 0)
    energyRows.push({ label: 'No energy logged', factor: '', kg: 0 })

  const dietMonthlyFactor = FACTORS.diet[dietType]
  const dietKgPerDay = (dietMonthlyFactor / 30) * (mealCount / 3)
  const dietTotal = dietKgPerDay * n

  const purchaseRows = []
  if (totals.orders > 0)
    purchaseRows.push({ label: `${totals.orders} online orders`, factor: `× ${FACTORS.onlineOrder} kg/order`, kg: totals.orders * FACTORS.onlineOrder })
  if (totals.clothing > 0)
    purchaseRows.push({ label: `${totals.clothing} clothing items`, factor: `× ${FACTORS.clothing} kg/item`, kg: totals.clothing * FACTORS.clothing })
  if (totals.elec > 0)
    purchaseRows.push({ label: `${totals.elec} electronics`, factor: `× ${FACTORS.electronics} kg/item`, kg: totals.elec * FACTORS.electronics })
  if (purchaseRows.length === 0)
    purchaseRows.push({ label: 'No purchases logged', factor: '', kg: 0 })

  return {
    transport: { rows: transportRows, source: 'DEFRA 2023 · CEA India · IPCC aviation' },
    energy:    { rows: energyRows,    source: `CEA India 2023 · ${gridFactor} kg CO₂/kWh for ${energySrc} grid` },
    diet:      { rows: [{ label: `${dietType} diet · ${mealCount} meals/day · ${n} days`, factor: `${dietMonthlyFactor} kg/mo ÷ 30`, kg: dietTotal }], source: 'IPCC AR6 · FAO food emissions database' },
    purchases: { rows: purchaseRows, source: 'DEFRA 2023 consumer goods lifecycle estimates' },
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getScoreStatus(kg: number) {
  const diff = kg - INDIA_AVERAGE_KG_CO2_PER_MONTH
  const pct = Math.abs((diff / INDIA_AVERAGE_KG_CO2_PER_MONTH) * 100).toFixed(0)
  if (diff < -5) return { icon: <TrendingDown size={12} />, text: `↓ ${pct}% vs India avg`, color: 'oklch(0.84 0.16 152)', bg: 'oklch(0.84 0.16 152 / 0.12)', border: 'oklch(0.84 0.16 152 / 0.3)' }
  if (diff > 5)  return { icon: <TrendingUp size={12} />,   text: `↑ ${pct}% vs India avg`, color: 'oklch(0.85 0.14 90)',  bg: 'oklch(0.85 0.14 90 / 0.12)',  border: 'oklch(0.85 0.14 90 / 0.3)'  }
  return                { icon: <Minus size={12} />,         text: 'At India avg',            color: 'oklch(0.72 0.018 165)', bg: 'oklch(0.5 0.02 170 / 0.1)',   border: 'oklch(0.5 0.02 170 / 0.22)' }
}

// ─── Eco Score explanation modal ──────────────────────────────────────────────

function EcoScoreInfo({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'oklch(0 0 0 / 0.5)' }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="eco-score-info-title"
        className="relative"
        style={{
          maxWidth: 380, width: '100%',
          background: 'oklch(0.17 0.015 170)',
          border: '1px solid oklch(0.5 0.02 170 / 0.22)',
          borderRadius: '1.5rem', padding: '1.5rem',
          boxShadow: '0 24px 60px oklch(0 0 0 / 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span id="eco-score-info-title" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--cl-text)' }}>
            How Eco Score works
          </span>
          <button onClick={onClose} aria-label="Close" className="focus-ring" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cl-text-subtle)', borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Formula', value: `Score = ${ECO_SCORE_MAX} × (1 − net CO₂ / ${ECO_SCORE_CEIL_KG} kg)` },
            { label: 'Net CO₂', value: 'Monthly log total − savings from committed & completed actions' },
            { label: `${ECO_SCORE_CEIL_KG} kg ceiling`, value: `Zero-score baseline, just above global avg (${GLOBAL_AVERAGE_KG_CO2_PER_MONTH} kg)` },
            { label: 'Grades', value: '750+ Exceptional · 600 Very Good · 450 Good · 300 Fair · 150 Poor · <150 Critical' },
          ].map(({ label, value }) => (
            <div key={label} style={{ borderRadius: 10, background: 'oklch(0.235 0.018 172 / 0.6)', padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'oklch(0.87 0.185 150)', marginBottom: 3, letterSpacing: '0.05em' }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--cl-text-muted)', lineHeight: 1.5 }}>{value}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--cl-text-subtle)', marginTop: 14, lineHeight: 1.5 }}>
          Committing to an action in the Actions tab deducts its estimated saving from your score immediately. Completing it confirms you did it.
        </p>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GaugeCard({
  ecoScore, netMonthlyKg, monthlyEquivalent, adjustedSavingKgCO2, daysLogged, onInfoClick,
}: {
  ecoScore: number
  netMonthlyKg: number
  monthlyEquivalent: number
  adjustedSavingKgCO2: number
  daysLogged: number
  onInfoClick: () => void
}) {
  const status = getScoreStatus(netMonthlyKg)
  const diff = netMonthlyKg - INDIA_AVERAGE_KG_CO2_PER_MONTH

  return (
    <div className="card flex flex-col items-center" style={{ padding: '20px 20px 16px' }}>
      {/* Score info button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
        <button
          onClick={onInfoClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cl-text-subtle)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
        >
          <Info size={13} /> How is this calculated?
        </button>
      </div>

      <div style={{ padding: '8px 12px' }}>
        <ScoreRing score={ecoScore} kg={netMonthlyKg} size={160} />
      </div>

      {/* India avg comparison chip */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1 mb-3"
        style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
      >
        {status.icon} {status.text}
      </div>

      {/* Commitment savings badge */}
      {adjustedSavingKgCO2 > 0 && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3"
          style={{ color: 'oklch(0.84 0.16 152)', background: 'oklch(0.84 0.16 152 / 0.1)', border: '1px solid oklch(0.84 0.16 152 / 0.28)' }}
        >
          🌱 −{adjustedSavingKgCO2.toFixed(1)} kg from commitments
        </div>
      )}

      <div className="text-xs mb-4 text-center" style={{ color: 'var(--cl-text-subtle)' }}>
        {daysLogged} {daysLogged === 1 ? 'day' : 'days'} logged · monthly estimate
      </div>

      <div className="flex gap-3 w-full">
        {[
          { label: 'India avg', value: INDIA_AVERAGE_KG_CO2_PER_MONTH, color: 'oklch(0.85 0.14 90)', bg: 'oklch(0.85 0.14 90 / 0.08)', border: 'oklch(0.85 0.14 90 / 0.22)' },
          { label: 'Global avg', value: GLOBAL_AVERAGE_KG_CO2_PER_MONTH, color: 'oklch(0.74 0.16 35)', bg: 'oklch(0.70 0.18 33 / 0.08)', border: 'oklch(0.70 0.18 33 / 0.22)' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="flex-1 rounded-xl px-2.5 py-2 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
            <p className="font-data text-sm font-semibold" style={{ color: 'var(--cl-text)' }}>{value}</p>
            <p className="text-[10px]" style={{ color }}>{label}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--cl-text-subtle)' }}>
        {diff < 0 ? `${Math.abs(diff).toFixed(0)} kg below` : `${diff.toFixed(0)} kg above`} India average
        {adjustedSavingKgCO2 > 0 && ` · raw ${monthlyEquivalent.toFixed(0)} kg`}
      </p>
    </div>
  )
}

function AICoachCard({ tips }: { tips: InsightTip[] }) {
  const topTips = tips
    .filter((t) => !t.completed)
    .sort((a, b) => b.estimatedSavingKgCO2 - a.estimatedSavingKgCO2)
    .slice(0, 5)

  return (
    <div
      className="card p-5"
      style={{
        border: '1px solid oklch(0.87 0.185 150 / 0.18)',
        background: 'linear-gradient(155deg, oklch(0.87 0.185 150 / 0.07), var(--cl-surface))',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'oklch(0.87 0.185 150)', boxShadow: '0 0 8px oklch(0.87 0.185 150)', display: 'inline-block', flexShrink: 0 }} />
        <span className="font-data text-xs tracking-widest uppercase" style={{ color: 'oklch(0.87 0.185 150)', letterSpacing: '0.08em' }}>AI Coach</span>
      </div>
      {topTips.length > 0 ? (
        <div className="space-y-2">
          {topTips.map((tip) => (
            <div
              key={tip.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl gap-2"
              style={{
                background: 'oklch(0.235 0.018 172 / 0.7)',
                border: tip.committed ? '1px solid oklch(0.87 0.185 150 / 0.25)' : '1px solid oklch(0.5 0.02 170 / 0.14)',
              }}
            >
              <span className="text-sm line-clamp-1" style={{ color: 'oklch(0.84 0.014 165)' }}>{tip.title}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {tip.committed && (
                  <span style={{ fontSize: 10, color: 'oklch(0.87 0.185 150)', background: 'oklch(0.87 0.185 150 / 0.12)', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>
                    committed
                  </span>
                )}
                <span className="font-data text-sm font-semibold" style={{ color: 'oklch(0.84 0.16 152)' }}>
                  −{tip.estimatedSavingKgCO2.toFixed(1)} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'oklch(0.9 0.012 165)', lineHeight: 1.55 }}>
            Visit the Actions tab to generate your personal AI plan — six specific changes ranked by CO₂ impact.
          </p>
          <Link
            to="/insights"
            className="inline-flex items-center gap-1.5 focus-ring"
            aria-label="Go to Actions tab to generate your AI reduction plan"
            style={{
              padding: '6px 13px', borderRadius: 999, textDecoration: 'none',
              background: 'oklch(0.87 0.185 150 / 0.1)',
              border: '1px solid oklch(0.87 0.185 150 / 0.25)',
              fontSize: 12, fontWeight: 600, color: 'oklch(0.87 0.185 150)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'oklch(0.87 0.185 150 / 0.18)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'oklch(0.87 0.185 150 / 0.1)' }}
          >
            Generate my plan →
          </Link>
        </>
      )}
    </div>
  )
}

function HeroBand({ profile, hasLogs, onOpenLog }: { profile: UserProfile | null; hasLogs: boolean; onOpenLog: () => void }) {
  return (
    <div className="mb-5 pb-5 flex items-start justify-between gap-4" style={{ borderBottom: '1px solid var(--cl-border)' }}>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-widest uppercase mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'oklch(0.87 0.185 150 / 0.7)', letterSpacing: '0.1em' }}>
          {formatDate()}
        </p>
        <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.02em' }}>
          {greeting()}, {profile?.name ?? 'there'}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--cl-text-muted)' }}>
          {hasLogs ? 'Your footprint is tracked below.' : 'Log today to see how you compare.'}
        </p>
      </div>
      <button
        onClick={onOpenLog}
        className="shrink-0 hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold focus-ring transition-all hover:brightness-110"
        style={{ background: 'oklch(0.87 0.185 150)', color: 'oklch(0.15 0.014 168)', boxShadow: '0 6px 18px oklch(0.87 0.185 150 / 0.3)' }}
      >
        <PenLine size={14} /> + Log today
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { profile, todayLog, monthLogs, monthlyEquivalent, netMonthlyKg, ecoScore, adjustedSavingKgCO2, tips, gridStatus, setLogSheetOpen } = useApp()
  const [showIntro, dismissIntro] = useShowIntro()
  const [showEcoInfo, setShowEcoInfo] = useState(false)
  const hasLogs = monthLogs.length > 0
  const monthlyBreakdown = getMonthlyBreakdown(monthLogs)
  const explainData = buildExplainData(monthLogs)

  return (
    <section aria-label="Carbon footprint dashboard" className="animate-slide-up">
      {showIntro && <OnboardingIntro onDone={dismissIntro} />}
      {showEcoInfo && <EcoScoreInfo onClose={() => setShowEcoInfo(false)} />}

      <HeroBand profile={profile} hasLogs={hasLogs} onOpenLog={() => setLogSheetOpen(true)} />

      {!hasLogs ? (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'oklch(0.87 0.185 150 / 0.10)', border: '1px solid oklch(0.87 0.185 150 / 0.22)' }}>
            <TrendingDown size={24} style={{ color: 'oklch(0.87 0.185 150)' }} />
          </div>
          <p className="font-display font-semibold mb-1" style={{ color: 'var(--cl-text)' }}>No logs this month yet</p>
          <p className="text-sm mb-5" style={{ color: 'var(--cl-text-muted)' }}>
            Record today's transport, energy, diet and purchases to see your eco score.
          </p>
          <button
            onClick={() => setLogSheetOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold focus-ring transition-all hover:brightness-110"
            style={{ background: 'oklch(0.87 0.185 150)', color: 'oklch(0.15 0.014 168)', boxShadow: '0 6px 18px oklch(0.87 0.185 150 / 0.3)' }}
          >
            <PenLine size={14} /> Log today's footprint
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Row 1: eco score gauge + AI coach */}
          <div className="grid md:grid-cols-2 gap-4">
            <GaugeCard
              ecoScore={ecoScore}
              netMonthlyKg={netMonthlyKg}
              monthlyEquivalent={monthlyEquivalent}
              adjustedSavingKgCO2={adjustedSavingKgCO2}
              daysLogged={monthLogs.length}
              onInfoClick={() => setShowEcoInfo(true)}
            />
            <AICoachCard tips={tips} />
          </div>

          {/* Row 2: Benchmark rail (uses net kg with commitments applied) */}
          <BenchmarkRail kg={netMonthlyKg} />

          {/* Row 3: Category breakdown with tap-to-explain */}
          <div className="card p-5">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>By category</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--cl-text-subtle)' }}>Tap any row to see how it's calculated</p>
              </div>
              <span className="font-data text-xs" style={{ color: 'var(--cl-text-subtle)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {monthLogs.length === 1 ? 'TODAY' : 'THIS MONTH'}
              </span>
            </div>
            <div className="space-y-2.5">
              {Object.entries(monthlyBreakdown).map(([cat, kg]) => (
                <CategoryBar key={cat} category={cat} kg={kg} total={monthlyEquivalent} explain={explainData[cat]} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              <p className="text-[10px]" style={{ color: 'var(--cl-text-subtle)' }}>
                Factors: CEA India 2023 · IPCC · DEFRA 2023{todayLog ? '' : ' · No log today'}
              </p>
              {gridStatus && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={gridStatus.isLive ? {
                    color: 'oklch(0.84 0.16 152)',
                    background: 'oklch(0.84 0.16 152 / 0.1)',
                    border: '1px solid oklch(0.84 0.16 152 / 0.28)',
                  } : {
                    color: 'oklch(0.72 0.018 165)',
                    background: 'oklch(0.5 0.02 170 / 0.08)',
                    border: '1px solid oklch(0.5 0.02 170 / 0.2)',
                  }}
                >
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                    background: gridStatus.isLive ? 'oklch(0.84 0.16 152)' : 'oklch(0.72 0.018 165)',
                    boxShadow: gridStatus.isLive ? '0 0 4px oklch(0.84 0.16 152)' : 'none',
                  }} />
                  {gridStatus.isLive
                    ? `Live grid · ${(gridStatus.kgPerKwh * 1000).toFixed(0)} gCO₂/kWh`
                    : `Est. grid · ${(gridStatus.kgPerKwh * 1000).toFixed(0)} gCO₂/kWh`}
                </span>
              )}
            </div>
          </div>

          {/* Row 4: Tangible equivalences (net kg with commitments) */}
          <EquivalencesCard kg={netMonthlyKg} period="this month (net)" />
        </div>
      )}
    </section>
  )
}
