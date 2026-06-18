import { useApp } from '../context/AppContext'
import ScoreRing from '../components/ScoreRing'
import CategoryBar from '../components/CategoryBar'
import {
  getCategoryBreakdown,
  INDIA_AVERAGE_KG_CO2_PER_MONTH,
  GLOBAL_AVERAGE_KG_CO2_PER_MONTH,
} from '../lib/emissions'

export default function Dashboard() {
  const { profile, todayLog } = useApp()

  if (!todayLog) {
    return (
      <section aria-label="Dashboard">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome back, {profile?.name ?? 'there'} 👋
        </h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-4xl mb-3">🌿</p>
          <p className="font-medium text-gray-900">No log for today yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Tap <strong>Log</strong> in the navigation to record your footprint.
          </p>
        </div>
      </section>
    )
  }

  const breakdown = getCategoryBreakdown(todayLog)
  const total = todayLog.totalKgCO2

  return (
    <section aria-label="Carbon footprint dashboard">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Hello, {profile?.name ?? 'there'} 👋
      </h1>

      {/* Score ring */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-4">
        <ScoreRing kg={total} size={200} />
        <div className="mt-5 flex gap-6 text-sm text-gray-500">
          <span>
            India avg:{' '}
            <strong className="text-gray-700">{INDIA_AVERAGE_KG_CO2_PER_MONTH} kg</strong>
          </span>
          <span>
            Global avg:{' '}
            <strong className="text-gray-700">{GLOBAL_AVERAGE_KG_CO2_PER_MONTH} kg</strong>
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Factors based on CEA India 2023 / IPCC data
        </p>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Breakdown</h2>
        {Object.entries(breakdown).map(([cat, kg]) => (
          <CategoryBar key={cat} category={cat} kg={kg} total={total} />
        ))}
      </div>
    </section>
  )
}
