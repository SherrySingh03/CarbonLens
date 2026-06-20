import { memo } from 'react'

const INDIA_AVG_KG = 125
const TARGET_2030_KG = 75
const RAIL_MAX_KG = 350  // global avg used as visual ceiling

function railPct(kg: number) {
  return Math.min(Math.max(kg / RAIL_MAX_KG, 0.02), 0.98) * 100
}

interface BenchmarkRailProps {
  kg: number
}

const BenchmarkRail = memo(function BenchmarkRail({ kg }: BenchmarkRailProps) {
  const youPct   = railPct(kg)
  const avgPct   = railPct(INDIA_AVG_KG)
  const targPct  = railPct(TARGET_2030_KG)

  const belowAvg  = kg < INDIA_AVG_KG
  const belowTarg = kg < TARGET_2030_KG
  const statusLabel  = belowTarg ? '🎯 Below 2030 target' : belowAvg ? 'Below India avg' : 'Above India avg'
  const statusColor  = belowTarg
    ? 'oklch(0.84 0.16 152)'
    : belowAvg
    ? 'oklch(0.87 0.185 150)'
    : 'oklch(0.74 0.16 35)'
  const statusBg     = belowTarg
    ? 'oklch(0.84 0.16 152 / 0.12)'
    : belowAvg
    ? 'oklch(0.87 0.185 150 / 0.10)'
    : 'oklch(0.70 0.18 33 / 0.10)'
  const statusBorder = belowTarg
    ? 'oklch(0.84 0.16 152 / 0.3)'
    : belowAvg
    ? 'oklch(0.87 0.185 150 / 0.28)'
    : 'oklch(0.70 0.18 33 / 0.28)'

  const diffFromAvg  = Math.abs(kg - INDIA_AVG_KG).toFixed(0)
  const diffFromTarg = Math.abs(kg - TARGET_2030_KG).toFixed(0)

  return (
    <div className="card p-5">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
        <h2 className="font-display text-base font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>
          Where you stand
        </h2>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600,
          padding: '4px 11px', borderRadius: 999,
          color: statusColor, background: statusBg, border: `1px solid ${statusBorder}`,
        }}>
          {statusLabel}
        </span>
      </div>

      {/* Rail */}
      <div style={{ position: 'relative', margin: '0 8px' }}>

        {/* YOU label — above rail */}
        <div style={{
          position: 'absolute', bottom: '100%', left: `${youPct}%`,
          transform: 'translateX(-50%)', marginBottom: 14,
          textAlign: 'center', whiteSpace: 'nowrap', zIndex: 4,
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.06em', color: 'oklch(0.87 0.185 150)', marginBottom: 3 }}>YOU</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--cl-text)' }}>{kg.toFixed(0)}</div>
          <div style={{ width: 2, height: 14, background: 'oklch(0.87 0.185 150)', margin: '4px auto 0', boxShadow: '0 0 6px oklch(0.87 0.185 150)' }} />
        </div>

        {/* Track */}
        <div style={{
          position: 'relative', height: 14, borderRadius: 999,
          background: 'linear-gradient(90deg, oklch(0.84 0.16 152), oklch(0.85 0.14 90) 50%, oklch(0.70 0.18 33))',
        }}>
          {/* Dim overlay for the right portion (above YOU) */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            left: `${youPct}%`, background: 'oklch(0.17 0.015 170 / 0.72)',
            borderRadius: '0 999px 999px 0',
          }} />

          {/* YOU dot */}
          <div style={{
            position: 'absolute', top: '50%', left: `${youPct}%`,
            width: 22, height: 22, borderRadius: '50%',
            background: 'oklch(0.97 0.01 160)',
            border: '4px solid oklch(0.87 0.185 150)',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 5px oklch(0.87 0.185 150 / 0.2)',
            zIndex: 3,
          }} />
        </div>

        {/* 2030 TARGET — below rail */}
        <div style={{
          position: 'absolute', top: '100%', left: `${targPct}%`,
          transform: 'translateX(-50%)', marginTop: 14,
          textAlign: 'center', whiteSpace: 'nowrap',
        }}>
          <div style={{ width: 2, height: 12, background: 'oklch(0.83 0.105 205)', margin: '0 auto 5px' }} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.05em', color: 'oklch(0.83 0.105 205)', textTransform: 'uppercase' }}>2030 Target</div>
          <div style={{ fontSize: 12, color: 'var(--cl-text-muted)', marginTop: 2 }}>{TARGET_2030_KG} kg</div>
        </div>

        {/* INDIA AVG — below rail */}
        <div style={{
          position: 'absolute', top: '100%', left: `${avgPct}%`,
          transform: 'translateX(-50%)', marginTop: 14,
          textAlign: 'center', whiteSpace: 'nowrap',
        }}>
          <div style={{ width: 2, height: 12, background: 'oklch(0.6 0.016 165)', margin: '0 auto 5px' }} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.05em', color: 'oklch(0.72 0.018 165)', textTransform: 'uppercase' }}>India avg</div>
          <div style={{ fontSize: 12, color: 'var(--cl-text-muted)', marginTop: 2 }}>{INDIA_AVG_KG} kg</div>
        </div>
      </div>

      {/* Narrative */}
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--cl-text-muted)', marginTop: 72 }}>
        {belowAvg
          ? <>You're <strong style={{ color: statusColor }}>{diffFromAvg} kg below</strong> the India average — genuinely good.</>
          : <>You're <strong style={{ color: statusColor }}>{diffFromAvg} kg above</strong> the India average.</>
        }{' '}
        {belowTarg
          ? <span style={{ color: 'oklch(0.84 0.16 152)' }}>You've already hit the 2030 target. 🌍</span>
          : <>You're <strong style={{ color: 'var(--cl-text)' }}>{diffFromTarg} kg</strong> from the 2030 science target — one or two habit swaps closes that gap.</>
        }
      </p>
    </div>
  )
})

export default BenchmarkRail
