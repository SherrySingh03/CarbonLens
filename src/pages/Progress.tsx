import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
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
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .slice(0, 7)

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
  const totalSaved = Math.max(0, (lastAvg - currentAvg) * thisMonthLogs.length)

  return (
    <section aria-label="Progress and goals">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Your Progress</h1>

      {/* Goal card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Monthly Goal</h2>
        <ProgressBar
          current={currentAvg}
          goal={goalKg}
          baseline={lastAvg}
          label={`${goalPct}% reduction target`}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Days logged', value: String(daysLogged) },
          { label: 'Best day', value: bestLog ? `${bestLog.kg.toFixed(0)} kg` : '—' },
          { label: 'Total saved', value: `${totalSaved.toFixed(0)} kg` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Activity</h2>
        <HeatmapCalendar logs={allLogs} />
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-4">30-day trend</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Log a few days to see your trend
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: unknown) => [`${Number(v).toFixed(1)} kg`, 'CO₂']}
                contentStyle={{ fontSize: 12 }}
              />
              <ReferenceLine
                y={INDIA_AVERAGE_KG_CO2_PER_MONTH}
                stroke="#d97706"
                strokeDasharray="4 2"
                label={{ value: 'India avg', fontSize: 10, fill: '#d97706', position: 'right' }}
              />
              <Line
                type="monotone"
                dataKey="kg"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
