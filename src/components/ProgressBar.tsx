interface ProgressBarProps {
  current: number
  goal: number
  baseline: number
  label?: string
}

function getImpact(current: number, goal: number) {
  const ratio = goal > 0 ? current / goal : 1
  if (ratio <= 1)   return { grad: 'linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150))', text: 'oklch(0.84 0.16 152)', status: 'On track' }
  if (ratio <= 1.1) return { grad: 'oklch(0.85 0.14 90)',  text: 'oklch(0.85 0.14 90)',  status: 'Close'    }
  return               { grad: 'oklch(0.70 0.18 33)',       text: 'oklch(0.74 0.16 35)',  status: 'Behind'   }
}

export default function ProgressBar({ current, goal, baseline, label }: ProgressBarProps) {
  const pct = baseline > 0 ? Math.min((current / baseline) * 100, 100) : 0
  const { grad, text, status } = getImpact(current, goal)

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium" style={{ color: 'var(--cl-text-muted)' }}>{label}</span>
          <span className="font-semibold" style={{ color: text }}>{status}</span>
        </div>
      )}
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: grad }}
          role="progressbar"
          aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
          aria-label={`Progress: ${pct.toFixed(0)}% of baseline — ${status}`}
        />
      </div>
      <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--cl-text-subtle)' }}>
        <span className="font-data">{current.toFixed(1)} kg current</span>
        <span className="font-data">Goal: {goal.toFixed(1)} kg</span>
      </div>
    </div>
  )
}
