import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { calculateTotal } from '../lib/emissions'
import type { TransportData, HomeEnergyData, DietData, PurchasesData } from '../types'

const STEPS = ['Transport', 'Energy', 'Diet', 'Profile'] as const

const DEFAULT_TRANSPORT: TransportData = { carKm: 100, carType: 'petrol', flightHours: 0, transitKm: 50 }
const DEFAULT_ENERGY: HomeEnergyData = { electricityKwh: 150, gasUnits: 5, energySource: 'grid' }
const DEFAULT_DIET: DietData = { dietType: 'average', mealCount: 3 }
const DEFAULT_PURCHASES: PurchasesData = { onlineOrdersCount: 2, newClothingItems: 0, electronicsItems: 0 }

function RadioCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-600 ${
        selected
          ? 'border-green-600 bg-green-50 text-green-800'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-green-600">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-green-600"
      />
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { saveProfile, saveDailyLog } = useApp()
  const [step, setStep] = useState(0)
  const [transport, setTransport] = useState<TransportData>(DEFAULT_TRANSPORT)
  const [energy, setEnergy] = useState<HomeEnergyData>(DEFAULT_ENERGY)
  const [diet, setDiet] = useState<DietData>(DEFAULT_DIET)
  const [purchases] = useState<PurchasesData>(DEFAULT_PURCHASES)
  const [name, setName] = useState('')
  const [goalPct, setGoalPct] = useState(10)

  const liveTotal = calculateTotal({ transport, homeEnergy: energy, diet, purchases })

  const handleFinish = useCallback(() => {
    const profile = {
      name: name.trim() || 'You',
      createdAt: new Date().toISOString(),
      monthlyGoalReductionPct: goalPct,
    }
    const log = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      transport,
      homeEnergy: energy,
      diet,
      purchases,
      totalKgCO2: liveTotal,
    }
    saveProfile(profile)
    saveDailyLog(log)
    navigate('/')
  }, [name, goalPct, transport, energy, diet, purchases, liveTotal, saveProfile, saveDailyLog, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🌿 CarbonLens</h1>
          <p className="text-gray-500 text-sm mt-1">Let's understand your carbon footprint</p>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Live estimate */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <span className="text-sm text-gray-500">Estimated monthly footprint</span>
          <span className="text-xl font-bold text-gray-900">
            {liveTotal.toFixed(1)}{' '}
            <span className="text-sm font-normal text-gray-500">kg CO₂</span>
          </span>
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          {/* Step 1: Transport */}
          {step === 0 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900">How do you get around?</h2>
              <div className="space-y-2" role="radiogroup" aria-label="Car type">
                {(
                  [
                    ['none', '🚶 No car'],
                    ['electric', '⚡ Electric car'],
                    ['petrol', '⛽ Petrol car'],
                    ['diesel', '🛢️ Diesel car'],
                  ] as const
                ).map(([val, label]) => (
                  <RadioCard
                    key={val}
                    selected={transport.carType === val}
                    onClick={() => setTransport({ ...transport, carType: val })}
                  >
                    <span className="font-medium">{label}</span>
                  </RadioCard>
                ))}
              </div>
              <Slider
                label="Monthly km by car"
                value={transport.carKm}
                min={0}
                max={3000}
                unit="km"
                onChange={(v) => setTransport({ ...transport, carKm: v })}
              />
              <Slider
                label="Monthly transit km"
                value={transport.transitKm}
                min={0}
                max={2000}
                unit="km"
                onChange={(v) => setTransport({ ...transport, transitKm: v })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly flight hours
                </label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={transport.flightHours}
                  onChange={(e) =>
                    setTransport({ ...transport, flightHours: Number(e.target.value) })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus-visible:ring-2 focus-visible:ring-green-600 outline-none text-gray-900"
                />
              </div>
            </>
          )}

          {/* Step 2: Energy */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900">Home energy use</h2>
              <Slider
                label="Monthly electricity"
                value={energy.electricityKwh}
                min={0}
                max={600}
                unit="kWh"
                onChange={(v) => setEnergy({ ...energy, electricityKwh: v })}
              />
              <Slider
                label="Monthly gas"
                value={energy.gasUnits}
                min={0}
                max={50}
                unit="m³"
                onChange={(v) => setEnergy({ ...energy, gasUnits: v })}
              />
              <div className="space-y-2" role="radiogroup" aria-label="Energy source">
                {(
                  [
                    ['grid', '🔌 City grid (DISCOM)'],
                    ['mixed', '☀️ Mixed / partial solar'],
                    ['renewable', '🌿 Fully renewable'],
                  ] as const
                ).map(([val, label]) => (
                  <RadioCard
                    key={val}
                    selected={energy.energySource === val}
                    onClick={() => setEnergy({ ...energy, energySource: val })}
                  >
                    <span className="font-medium">{label}</span>
                  </RadioCard>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Diet */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900">What do you eat?</h2>
              <div className="space-y-2" role="radiogroup" aria-label="Diet type">
                {(
                  [
                    ['vegan', '🌱 Vegan', 'No animal products'],
                    ['vegetarian', '🥗 Vegetarian', 'No meat or fish'],
                    ['average', '🍽️ Average omnivore', 'Balanced mix of everything'],
                    ['meat-heavy', '🥩 Meat-heavy', 'Meat at most meals'],
                  ] as const
                ).map(([val, label, desc]) => (
                  <RadioCard
                    key={val}
                    selected={diet.dietType === val}
                    onClick={() => setDiet({ ...diet, dietType: val })}
                  >
                    <span className="font-medium">{label}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{desc}</span>
                  </RadioCard>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meals per day
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setDiet({ ...diet, mealCount: Math.max(1, diet.mealCount - 1) })}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 font-bold text-lg flex items-center justify-center hover:border-green-600 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
                    aria-label="Decrease meals"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold w-8 text-center">{diet.mealCount}</span>
                  <button
                    type="button"
                    onClick={() => setDiet({ ...diet, mealCount: Math.min(5, diet.mealCount + 1) })}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 font-bold text-lg flex items-center justify-center hover:border-green-600 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
                    aria-label="Increase meals"
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Profile */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900">Almost there!</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your first name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus-visible:ring-2 focus-visible:ring-green-600 outline-none text-gray-900"
                />
              </div>
              <Slider
                label="Monthly reduction goal"
                value={goalPct}
                min={5}
                max={30}
                unit="%"
                onChange={setGoalPct}
              />
              <p className="text-sm text-gray-500 bg-green-50 rounded-xl p-3">
                You're aiming to cut your footprint by{' '}
                <strong className="text-green-700">{goalPct}%</strong> this month — that's{' '}
                <strong className="text-green-700">
                  {(liveTotal * (goalPct / 100)).toFixed(1)} kg CO₂
                </strong>{' '}
                in savings.
              </p>
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
              >
                See my footprint →
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Emission factors based on CEA India 2023 / IPCC data
        </p>
      </div>
    </div>
  )
}
