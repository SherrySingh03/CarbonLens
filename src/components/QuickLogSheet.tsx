import { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calculateTotal } from '../lib/emissions'
import type { FootprintLog, TransportData, HomeEnergyData, DietData, PurchasesData } from '../types'

const ZERO_TRANSPORT: TransportData = { carKm: 0, carType: 'petrol', flightHours: 0, transitKm: 0 }
const ZERO_ENERGY: HomeEnergyData = { electricityKwh: 0, gasUnits: 0, energySource: 'grid' }
const ZERO_DIET: DietData = { dietType: 'average', mealCount: 3 }
const ZERO_PURCHASES: PurchasesData = { onlineOrdersCount: 0, newClothingItems: 0, electronicsItems: 0 }

export default function QuickLogSheet({
  prefill,
  onClose,
}: {
  prefill: FootprintLog | null
  onClose: () => void
}) {
  const { saveDailyLog } = useApp()
  const [transport, setTransport] = useState<TransportData>(prefill?.transport ?? ZERO_TRANSPORT)
  const [energy, setEnergy] = useState<HomeEnergyData>(prefill?.homeEnergy ?? ZERO_ENERGY)
  const [diet, setDiet] = useState<DietData>(prefill?.diet ?? ZERO_DIET)
  const [purchases, setPurchases] = useState<PurchasesData>(prefill?.purchases ?? ZERO_PURCHASES)

  const total = calculateTotal({ transport, homeEnergy: energy, diet, purchases })

  function handleSave() {
    const log: FootprintLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      transport,
      homeEnergy: energy,
      diet,
      purchases,
      totalKgCO2: total,
    }
    saveDailyLog(log)
    onClose()
  }

  const radioBtn = (active: boolean) =>
    `py-2 px-3 rounded-xl border text-sm font-medium transition-all focus-ring ${
      active
        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
        : 'border-white/8 bg-white/[0.03] text-zinc-400 hover:border-emerald-500/30 hover:text-zinc-200'
    }`

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="Quick log today's footprint"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto border-t border-white/8"
        style={{ background: '#0d1511', boxShadow: '0 -24px 64px rgba(0,0,0,0.7)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-white">Log Today</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-zinc-200 transition-colors focus-ring"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-2">Car type</p>
            <div className="grid grid-cols-2 gap-2">
              {(['none', 'electric', 'petrol', 'diesel'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={transport.carType === t}
                  onClick={() => setTransport({ ...transport, carType: t })}
                  className={radioBtn(transport.carType === t)}
                >
                  {t === 'none' ? 'No car' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-zinc-300">Car km this month</label>
              <span className="font-data text-sm font-semibold text-emerald-400">{transport.carKm} km</span>
            </div>
            <input
              type="range" min={0} max={3000} value={transport.carKm}
              onChange={(e) => setTransport({ ...transport, carKm: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-zinc-300">Electricity kWh/month</label>
              <span className="font-data text-sm font-semibold text-emerald-400">{energy.electricityKwh} kWh</span>
            </div>
            <input
              type="range" min={0} max={600} value={energy.electricityKwh}
              onChange={(e) => setEnergy({ ...energy, electricityKwh: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-300 mb-2">Diet</p>
            <div className="grid grid-cols-2 gap-2">
              {(['vegan', 'vegetarian', 'average', 'meat-heavy'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={diet.dietType === d}
                  onClick={() => setDiet({ ...diet, dietType: d })}
                  className={radioBtn(diet.dietType === d)}
                >
                  {d === 'meat-heavy' ? 'Meat-heavy' : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-300 mb-2">Online orders this month</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPurchases({ ...purchases, onlineOrdersCount: Math.max(0, purchases.onlineOrdersCount - 1) })}
                className="w-10 h-10 rounded-full border border-white/8 font-bold text-lg flex items-center justify-center text-zinc-400 hover:border-emerald-500/40 hover:text-zinc-200 transition-colors focus-ring"
              >−</button>
              <span className="font-data text-xl font-semibold text-white w-8 text-center">
                {purchases.onlineOrdersCount}
              </span>
              <button
                type="button"
                onClick={() => setPurchases({ ...purchases, onlineOrdersCount: purchases.onlineOrdersCount + 1 })}
                className="w-10 h-10 rounded-full border border-white/8 font-bold text-lg flex items-center justify-center text-zinc-400 hover:border-emerald-500/40 hover:text-zinc-200 transition-colors focus-ring"
              >+</button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zinc-500">Estimated total</p>
              <p className="font-data text-2xl font-semibold text-white">
                {total.toFixed(1)}{' '}
                <span className="text-base font-normal text-zinc-500">kg CO₂</span>
              </p>
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#080c0a] rounded-2xl py-3 font-semibold hover:brightness-110 transition-all focus-ring shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Save Log
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
