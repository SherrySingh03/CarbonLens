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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="Quick log today's footprint"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-[#D4E4CC]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-[#1A2E1A]">Log Today</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#D4E4CC] text-muted hover:text-[#1A2E1A] transition-colors focus-ring"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Car type */}
          <div>
            <p className="text-sm font-medium text-[#1A2E1A] mb-2">Car type</p>
            <div className="grid grid-cols-2 gap-2">
              {(['none', 'electric', 'petrol', 'diesel'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={transport.carType === t}
                  onClick={() => setTransport({ ...transport, carType: t })}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all focus-ring ${
                    transport.carType === t
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-[#D4E4CC] text-[#1A2E1A] hover:border-green-300'
                  }`}
                >
                  {t === 'none' ? 'No car' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Car km */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-[#1A2E1A]">Car km this month</label>
              <span className="font-data text-sm font-semibold text-green-700">{transport.carKm} km</span>
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

          {/* Electricity */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-[#1A2E1A]">Electricity kWh/month</label>
              <span className="font-data text-sm font-semibold text-green-700">{energy.electricityKwh} kWh</span>
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

          {/* Diet */}
          <div>
            <p className="text-sm font-medium text-[#1A2E1A] mb-2">Diet</p>
            <div className="grid grid-cols-2 gap-2">
              {(['vegan', 'vegetarian', 'average', 'meat-heavy'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={diet.dietType === d}
                  onClick={() => setDiet({ ...diet, dietType: d })}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all focus-ring ${
                    diet.dietType === d
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-[#D4E4CC] text-[#1A2E1A] hover:border-green-300'
                  }`}
                >
                  {d === 'meat-heavy' ? 'Meat-heavy' : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div>
            <p className="text-sm font-medium text-[#1A2E1A] mb-2">Online orders this month</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPurchases({ ...purchases, onlineOrdersCount: Math.max(0, purchases.onlineOrdersCount - 1) })}
                className="w-10 h-10 rounded-full border border-[#D4E4CC] font-bold text-lg flex items-center justify-center hover:border-green-500 transition-colors focus-ring"
              >
                −
              </button>
              <span className="font-data text-xl font-semibold text-[#1A2E1A] w-8 text-center">
                {purchases.onlineOrdersCount}
              </span>
              <button
                type="button"
                onClick={() => setPurchases({ ...purchases, onlineOrdersCount: purchases.onlineOrdersCount + 1 })}
                className="w-10 h-10 rounded-full border border-[#D4E4CC] font-bold text-lg flex items-center justify-center hover:border-green-500 transition-colors focus-ring"
              >
                +
              </button>
            </div>
          </div>

          {/* Total + save */}
          <div className="pt-4 border-t border-[#D4E4CC]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">Estimated total</p>
              <p className="font-data text-2xl font-semibold text-[#1A2E1A]">
                {total.toFixed(1)}{' '}
                <span className="text-base font-normal text-muted">kg CO₂</span>
              </p>
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-green-600 text-white rounded-2xl py-3 font-semibold hover:bg-green-700 transition-colors focus-ring"
            >
              Save Log
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
