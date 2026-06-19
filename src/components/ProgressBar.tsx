interface ProgressBarProps {
  current: number
  goal: number
  baseline: number
  label?: string
}

function getColors(current: number, goal: number): { bar: string; text: string; status: string } {
  const ratio = goal > 0 ? current / goal : 1
  if (ratio <= 1) return { bar: 'bg-green-500', text: 'text-green-700', status: 'On track' }
  if (ratio <= 1.1) return { bar: 'bg-amber-500', text: 'text-amber-700', status: 'Close' }
  return { bar: 'bg-red-500', text: 'text-red-700', status: 'Behind' }
}

export default function ProgressBar({ current, goal, baseline, label }: ProgressBarProps) {
  const pct = baseline > 0 ? Math.min((current / baseline) * 100, 100) : 0
  const { bar, text, status } = getColors(current, goal)

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-[#1A2E1A]">{label}</span>
          <span className={`font-semibold ${text}`}>{status}</span>
        </div>
      )}
      <div className="h-3 bg-[#D4E4CC] rounded-full overflow-hidden">
        <div
          className={`h-full ${bar} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${pct.toFixed(0)}% of baseline — ${status}`}
        />
      </div>
      <div className="flex justify-between text-xs text-muted mt-1.5">
        <span className="font-data">{current.toFixed(1)} kg current</span>
        <span className="font-data">Goal: {goal.toFixed(1)} kg</span>
      </div>
    </div>
  )
}
