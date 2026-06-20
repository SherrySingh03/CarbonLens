import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useApp } from '../context/AppContext'
import HeatmapCalendar from '../components/HeatmapCalendar'
import ProgressBar from '../components/ProgressBar'
import { INDIA_AVERAGE_KG_CO2_PER_MONTH } from '../lib/emissions'

export default function Progress() {
  const { profile, allLogs } = useApp()

  const sorted = [...allLogs].sort((a, b) => a.date.localeCompare(b.date))
  const last30 = sorted.slice(-30)
  const chartData = last30.map((l) => ({ date: l.date.slice(5), kg: l.totalKgCO2 }))

  const thisMonth = new Date().toISOString().slice(0, 7)
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)

  const thisMonthLogs = sorted.filter((l) => l.date.startsWith(thisMonth))
  const lastMonthLogs = sorted.filter((l) => l.date.startsWith(lastMonth))

  const currentAvg = thisMonthLogs.length
    ? thisMonthLogs.reduce((s, l) => s + l.totalKgCO2, 0) / thisMonthLogs.length
    : 0
  const lastAvg = lastMonthLogs.length
    ? lastMonthLogs.reduce((s, l) => s + l.totalKgCO2, 0) / lastMonthLogs.length
    : INDIA_AVERAGE_KG_CO2_PER_MONTH

  const goalPct = profile?.monthlyGoalReductionPct ?? 10
  const goalKg = lastAvg * (1 - goalPct / 100)

  const daysLogged = allLogs.length
  const bestLog = sorted.reduce<{ date: string; kg: number } | null>(
    (best, l) => (!best || l.totalKgCO2 < best.kg ? { date: l.date, kg: l.totalKgCO2 } : best),
    null
  )
  const totalSaved = lastMonthLogs.length > 0
    ? Math.max(0, (lastAvg - currentAvg) * thisMonthLogs.length)
    : null

  return (
    <section aria-label="Progress and goals" className="animate-slide-up">
      <div className="mb-6 pb-5" style={{ borderBottom: '1px solid var(--cl-border)' }}>
        <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.02em' }}>Your Progress</h1>
      </div>

      <div className="card p-6 mb-4">
        <h2 className="font-display text-base font-semibold mb-4" style={{ color: 'var(--cl-text)' }}>Monthly Goal</h2>
        <ProgressBar current={currentAvg} goal={goalKg} baseline={lastAvg} label={`${goalPct}% reduction target`} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Days logged', value: String(daysLogged) },
          { label: 'Best day',    value: bestLog ? `${bestLog.kg.toFixed(0)} kg` : '—' },
          { label: 'Total saved', value: totalSaved !== null ? `${totalSaved.toFixed(0)} kg` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-data text-xl font-semibold" style={{ color: 'var(--cl-text)' }}>{value}</p>
            <p className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--cl-text-subtle)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-4">
        <h2 className="font-display text-base font-semibold mb-4" style={{ color: 'var(--cl-text)' }}>Activity</h2>
        <HeatmapCalendar logs={allLogs} />
      </div>

      <div className="card p-6">
        <h2 className="font-display text-base font-semibold mb-4" style={{ color: 'var(--cl-text)' }}>30-day trend</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--cl-text-subtle)' }}>
            Log a few days to see your trend
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(0.58 0.016 165)' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: 'oklch(0.58 0.016 165)' }} />
              <Tooltip
                formatter={(v: unknown) => [`${Number(v).toFixed(1)} kg`, 'CO₂']}
                contentStyle={{
                  fontSize: 12, borderRadius: 12,
                  border: '1px solid oklch(0.5 0.02 170 / 0.22)',
                  background: 'oklch(0.17 0.015 170)',
                  color: 'oklch(0.97 0.01 160)',
                }}
              />
              <ReferenceLine
                y={INDIA_AVERAGE_KG_CO2_PER_MONTH}
                stroke="oklch(0.85 0.14 90)"
                strokeDasharray="4 2"
                label={{ value: 'India avg', fontSize: 10, fill: 'oklch(0.85 0.14 90)', position: 'right' }}
              />
              <Line
                type="monotone" dataKey="kg"
                stroke="oklch(0.87 0.185 150)"
                strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: 'oklch(0.87 0.185 150)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
