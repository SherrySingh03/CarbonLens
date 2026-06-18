import { useState } from 'react'
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="Quick log today's footprint"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Log Today's Footprint</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-green-600 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['none', 'electric', 'petrol', 'diesel'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={transport.carType === t}
                  onClick={() => setTransport({ ...transport, carType: t })}
                  className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-green-600 ${
                    transport.carType === t
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t === 'none' ? 'No car' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Car km this month</label>
              <span className="text-sm font-semibold text-green-600">{transport.carKm} km</span>
            </div>
            <input
              type="range"
              min={0}
              max={3000}
              value={transport.carKm}
              onChange={(e) => setTransport({ ...transport, carKm: Number(e.target.value) })}
              className="w-full accent-green-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Electricity kWh/month</label>
              <span className="text-sm font-semibold text-green-600">{energy.electricityKwh} kWh</span>
            </div>
            <input
              type="range"
              min={0}
              max={600}
              value={energy.electricityKwh}
              onChange={(e) => setEnergy({ ...energy, electricityKwh: Number(e.target.value) })}
              className="w-full accent-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diet</label>
            <div className="grid grid-cols-2 gap-2">
              {(['vegan', 'vegetarian', 'average', 'meat-heavy'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={diet.dietType === d}
                  onClick={() => setDiet({ ...diet, dietType: d })}
                  className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-green-600 ${
                    diet.dietType === d
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Online orders this month</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPurchases({ ...purchases, onlineOrdersCount: Math.max(0, purchases.onlineOrdersCount - 1) })}
                className="w-10 h-10 rounded-full border-2 border-gray-200 font-bold text-lg flex items-center justify-center hover:border-green-600 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
              >
                −
              </button>
              <span className="text-xl font-bold w-8 text-center">{purchases.onlineOrdersCount}</span>
              <button
                type="button"
                onClick={() => setPurchases({ ...purchases, onlineOrdersCount: purchases.onlineOrdersCount + 1 })}
                className="w-10 h-10 rounded-full border-2 border-gray-200 font-bold text-lg flex items-center justify-center hover:border-green-600 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
              >
                +
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Estimated total</p>
            <p className="text-2xl font-bold text-gray-900">
              {total.toFixed(1)}{' '}
              <span className="text-base font-normal text-gray-500">kg CO₂</span>
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
          >
            Save Log
          </button>
        </div>
      </div>
    </div>
  )
}
