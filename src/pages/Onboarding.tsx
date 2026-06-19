import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Zap, Leaf, Bus, Flame, UtensilsCrossed, ArrowRight, ArrowLeft } from 'lucide-react'
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
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 focus-ring ${
        selected
          ? 'border-green-500 bg-green-50 text-green-800'
          : 'border-[#D4E4CC] bg-white text-[#1A2E1A] hover:border-green-300'
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
      <div className="flex justify-between mb-1.5">
        <label className="text-sm font-medium text-[#1A2E1A]">{label}</label>
        <span className="font-data text-sm font-semibold text-green-700">
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
    <div className="min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-green-600 rounded-xl mb-3">
            <Leaf size={20} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1A2E1A]">CarbonLens</h1>
          <p className="text-sm text-muted mt-1">Measure your monthly carbon footprint</p>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span className="font-medium text-[#1A2E1A]">{STEPS[step]}</span>
          </div>
          <div className="h-1.5 bg-[#D4E4CC] rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Live estimate */}
        <div className="card p-4 mb-4 flex items-center justify-between">
          <span className="text-sm text-muted">Estimated monthly footprint</span>
          <span className="font-data text-xl font-semibold text-[#1A2E1A]">
            {liveTotal.toFixed(1)}{' '}
            <span className="text-sm font-normal text-muted">kg CO₂</span>
          </span>
        </div>

        {/* Step card */}
        <div className="card p-6 space-y-5">
          {/* Step 1: Transport */}
          {step === 0 && (
            <>
              <h2 className="font-display text-xl font-semibold text-[#1A2E1A]">How do you get around?</h2>
              <div className="space-y-2" role="radiogroup" aria-label="Car type">
                {([
                  ['none', 'No car', Bus],
                  ['electric', 'Electric car', Zap],
                  ['petrol', 'Petrol car', Car],
                  ['diesel', 'Diesel car', Car],
                ] as const).map(([val, label, Icon]) => (
                  <RadioCard
                    key={val}
                    selected={transport.carType === val}
                    onClick={() => setTransport({ ...transport, carType: val })}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Icon size={16} className="text-green-600 shrink-0" />
                      {label}
                    </span>
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
                <label className="block text-sm font-medium text-[#1A2E1A] mb-1.5">
                  Monthly flight hours
                </label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={transport.flightHours}
                  onChange={(e) => setTransport({ ...transport, flightHours: Number(e.target.value) })}
                  className="w-full border border-[#D4E4CC] rounded-xl px-3 py-2 focus-ring outline-none text-[#1A2E1A] bg-white"
                />
              </div>
            </>
          )}

          {/* Step 2: Energy */}
          {step === 1 && (
            <>
              <h2 className="font-display text-xl font-semibold text-[#1A2E1A]">Home energy use</h2>
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
                {([
                  ['grid', 'City grid (DISCOM)', Zap],
                  ['mixed', 'Mixed / partial solar', Flame],
                  ['renewable', 'Fully renewable', Leaf],
                ] as const).map(([val, label, Icon]) => (
                  <RadioCard
                    key={val}
                    selected={energy.energySource === val}
                    onClick={() => setEnergy({ ...energy, energySource: val })}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Icon size={16} className="text-green-600 shrink-0" />
                      {label}
                    </span>
                  </RadioCard>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Diet */}
          {step === 2 && (
            <>
              <h2 className="font-display text-xl font-semibold text-[#1A2E1A]">What do you eat?</h2>
              <div className="space-y-2" role="radiogroup" aria-label="Diet type">
                {([
                  ['vegan', 'Vegan', 'No animal products'],
                  ['vegetarian', 'Vegetarian', 'No meat or fish'],
                  ['average', 'Average omnivore', 'Balanced mix of everything'],
                  ['meat-heavy', 'Meat-heavy', 'Meat at most meals'],
                ] as const).map(([val, label, desc]) => (
                  <RadioCard
                    key={val}
                    selected={diet.dietType === val}
                    onClick={() => setDiet({ ...diet, dietType: val })}
                  >
                    <span className="flex items-center gap-2">
                      <UtensilsCrossed size={15} className="text-green-600 shrink-0" />
                      <span>
                        <span className="font-medium">{label}</span>
                        <span className="block text-xs text-muted mt-0.5">{desc}</span>
                      </span>
                    </span>
                  </RadioCard>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2E1A] mb-2">
                  Meals per day
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setDiet({ ...diet, mealCount: Math.max(1, diet.mealCount - 1) })}
                    className="w-10 h-10 rounded-full border border-[#D4E4CC] font-bold text-lg flex items-center justify-center hover:border-green-500 transition-colors focus-ring"
                    aria-label="Decrease meals"
                  >
                    −
                  </button>
                  <span className="font-data text-2xl font-semibold text-[#1A2E1A] w-8 text-center">
                    {diet.mealCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDiet({ ...diet, mealCount: Math.min(5, diet.mealCount + 1) })}
                    className="w-10 h-10 rounded-full border border-[#D4E4CC] font-bold text-lg flex items-center justify-center hover:border-green-500 transition-colors focus-ring"
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
              <h2 className="font-display text-xl font-semibold text-[#1A2E1A]">Almost there</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1A2E1A] mb-1.5">
                  Your first name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full border border-[#D4E4CC] rounded-xl px-3 py-2.5 focus-ring outline-none text-[#1A2E1A] bg-white"
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
              <p className="text-sm text-muted bg-green-50 rounded-2xl p-4 border border-green-100">
                Aiming to cut your footprint by{' '}
                <strong className="text-green-700">{goalPct}%</strong> — that's{' '}
                <strong className="text-green-700">
                  {(liveTotal * (goalPct / 100)).toFixed(1)} kg CO₂
                </strong>{' '}
                in savings.
              </p>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-1">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-[#D4E4CC] font-semibold text-[#1A2E1A] hover:bg-green-50 transition-colors focus-ring"
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white rounded-2xl py-3 font-semibold hover:bg-green-700 transition-colors focus-ring"
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white rounded-2xl py-3 font-semibold hover:bg-green-700 transition-colors focus-ring"
              >
                See my footprint <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          Emission factors: CEA India 2023 · IPCC · DEFRA 2023
        </p>
      </div>
    </div>
  )
}
