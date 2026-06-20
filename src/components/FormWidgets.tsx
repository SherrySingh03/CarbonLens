import { useId } from 'react'

// Canonical sizing scale: QuickLogSheet (+2 vs Onboarding on fonts/spacing).
// Label elements: <div> throughout — SegmentedPick and Counter have no paired <input>
// so <label> without htmlFor would be semantically incorrect. RangeSlider is the
// exception: it has useId + htmlFor wiring to a real <input type="range">.

// ─── Panel ───────────────────────────────────────────────────────────────────

export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 14, background: 'oklch(0.235 0.018 172 / 0.5)', border: '1px solid oklch(0.5 0.02 170 / 0.12)', padding: 16 }}>
      {children}
    </div>
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

export function Toggle({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'oklch(0.84 0.014 165)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--cl-text-subtle)', marginTop: 2 }}>{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className="focus-ring"
        style={{
          width: 44, height: 24, borderRadius: 999, flexShrink: 0,
          background: value ? 'oklch(0.87 0.185 150)' : 'oklch(0.3 0.016 170 / 0.5)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s ease',
          boxShadow: value ? '0 0 8px oklch(0.87 0.185 150 / 0.35)' : 'none',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: 'oklch(0.97 0.01 160)',
          transition: 'left 0.2s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </button>
    </div>
  )
}

// ─── SegmentedPick ────────────────────────────────────────────────────────────

export function SegmentedPick<T extends string>({
  label, options, value, onChange, formatLabel,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  formatLabel?: (opt: T) => string
}) {
  const idx = options.indexOf(value)
  const fmt = formatLabel ?? ((opt: T) => {
    if (opt === 'none') return 'No car'
    if (opt === 'meat-heavy') return 'Meat+'
    if (opt === 'renewable') return 'Solar/Wind'
    return opt.charAt(0).toUpperCase() + opt.slice(1)
  })
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'oklch(0.84 0.014 165)', marginBottom: 12 }}>
        {label}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        style={{
          position: 'relative', display: 'flex', padding: 4,
          borderRadius: 12, background: 'oklch(0.235 0.018 172)',
          border: '1px solid oklch(0.5 0.02 170 / 0.16)',
        }}
      >
        <div style={{
          position: 'absolute', top: 4, bottom: 4, left: 4,
          width: `calc(${100 / options.length}% - 4px)`,
          borderRadius: 9, background: 'oklch(0.87 0.185 150)',
          boxShadow: '0 2px 10px oklch(0.87 0.185 150 / 0.40)',
          zIndex: 1, transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1)',
          transform: `translateX(calc(${idx * 100}%))`,
        }} />
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(opt)}
            className="focus-ring"
            style={{
              flex: 1, position: 'relative', zIndex: 2, padding: '8px 2px',
              borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: 'transparent', border: 'none', textAlign: 'center',
              color: value === opt ? 'oklch(0.15 0.014 168)' : 'oklch(0.72 0.018 165)',
              transition: 'color 0.18s ease',
            }}
          >
            {fmt(opt)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── RangeSlider ─────────────────────────────────────────────────────────────
// Uses useId + htmlFor to associate the <label> with the <input type="range">.

export function RangeSlider({ label, value, min = 0, max, step = 1, unit, note, onChange }: {
  label: string; value: number; min?: number; max: number; step?: number
  unit: string; note?: string; onChange: (v: number) => void
}) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <label htmlFor={id} style={{ fontSize: 14, fontWeight: 600, color: 'oklch(0.84 0.014 165)' }}>{label}</label>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, color: 'var(--cl-text)' }}>
          {value}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--cl-text-muted)', fontWeight: 400, marginLeft: 4 }}>
            {unit}
          </span>
        </span>
      </div>
      <input
        id={id}
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cl-range"
        style={{
          background: `linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150) ${pct}%, oklch(0.3 0.016 170 / 0.55) ${pct}%)`,
        }}
      />
      {note && (
        <div style={{ fontSize: 12, color: 'var(--cl-text-muted)', marginTop: 10, lineHeight: 1.5 }}>
          {note}
        </div>
      )}
    </div>
  )
}

// ─── Counter ─────────────────────────────────────────────────────────────────

export function Counter({ label, value, min = 0, max = 20, unit, onChange }: {
  label: string; value: number; min?: number; max?: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'oklch(0.84 0.014 165)', marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {([
          { sym: '−', action: () => onChange(Math.max(min, value - 1)), ariaLabel: `Decrease ${label}` },
          null,
          { sym: '+', action: () => onChange(Math.min(max, value + 1)), ariaLabel: `Increase ${label}` },
        ] as const).map((btn, i) =>
          btn === null ? (
            <span key={i} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, width: 36, textAlign: 'center', color: 'var(--cl-text)' }}>
              {value}
            </span>
          ) : (
            <button
              key={i} type="button" onClick={btn.action} aria-label={btn.ariaLabel}
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base focus-ring"
              style={{ background: 'oklch(0.235 0.018 172)', border: '1px solid oklch(0.5 0.02 170 / 0.16)', color: 'var(--cl-text-muted)', flexShrink: 0 }}
            >
              {btn.sym}
            </button>
          )
        )}
        <span style={{ fontSize: 13, color: 'var(--cl-text-muted)', marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  )
}
