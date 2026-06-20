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

function RadioCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" role="radio" aria-checked={selected} onClick={onClick}
      className="w-full text-left p-4 rounded-2xl transition-all duration-150 focus-ring"
      style={{
        border: selected ? '1px solid oklch(0.87 0.185 150 / 0.55)' : '1px solid var(--cl-border-mid)',
        background: selected ? 'oklch(0.87 0.185 150 / 0.10)' : 'var(--cl-surface-up)',
        color: selected ? 'oklch(0.87 0.185 150)' : 'var(--cl-text-muted)',
      }}
    >
      {children}
    </button>
  )
}

function Slider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--cl-text-muted)' }}>{label}</label>
        <span className="font-data text-sm font-semibold" style={{ color: 'var(--cl-green)' }}>{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cl-range"
        style={{ background: `linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150) ${pct}%, oklch(0.3 0.016 170 / 0.55) ${pct}%)` }}
      />
    </div>
  )
}

function RingLogo() {
  return (
    <img
      src="/logo.png"
      alt="CarbonLens"
      width={40}
      height={40}
      style={{ borderRadius: 9, display: 'block', margin: '0 auto 12px' }}
    />
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

  // Monthly preview shown to the user in the UI
  const liveTotal = calculateTotal({ transport, homeEnergy: energy, diet, purchases })

  const handleFinish = useCallback(() => {
    const profile = {
      name: name.trim() || 'You',
      createdAt: new Date().toISOString(),
      monthlyGoalReductionPct: goalPct,
    }
    // Onboarding inputs are monthly-scale; divide by 30 so the saved log is daily-scale.
    // extrapolateMonthly does (daily × N) / N × 30, so it correctly recovers the monthly total.
    const dailyTransport: TransportData = {
      ...transport,
      carKm: +(transport.carKm / 30).toFixed(1),
      transitKm: +(transport.transitKm / 30).toFixed(1),
      flightHours: +(transport.flightHours / 30).toFixed(2),
    }
    const dailyEnergy: HomeEnergyData = {
      ...energy,
      electricityKwh: +(energy.electricityKwh / 30).toFixed(1),
      gasUnits: +(energy.gasUnits / 30).toFixed(2),
    }
    const dailyTotal = calculateTotal({ transport: dailyTransport, homeEnergy: dailyEnergy, diet, purchases }, true)
    const log = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      transport: dailyTransport,
      homeEnergy: dailyEnergy,
      diet, purchases,
      totalKgCO2: dailyTotal,
    }
    saveProfile(profile)
    saveDailyLog(log)
    navigate('/dashboard')
  }, [name, goalPct, transport, energy, diet, purchases, saveProfile, saveDailyLog, navigate])

  const ctaStyle = { background: 'oklch(0.87 0.185 150)', color: 'oklch(0.15 0.014 168)', boxShadow: '0 8px 24px oklch(0.87 0.185 150 / 0.32)' }
  const backStyle = { background: 'var(--cl-surface-up)', border: '1px solid var(--cl-border-mid)', color: 'var(--cl-text-muted)' }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-10" style={{ background: 'var(--cl-base)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <RingLogo />
          <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.02em' }}>CarbonLens</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cl-text-muted)' }}>Measure your monthly carbon footprint</p>
        </div>

        {/* Step progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--cl-text-subtle)' }}>
            <span>Step {step + 1} of {STEPS.length}</span>
            <span className="font-medium" style={{ color: 'var(--cl-text-muted)' }}>{STEPS[step]}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150))' }}
            />
          </div>
        </div>

        {/* Live estimate */}
        <div className="card p-4 mb-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--cl-text-muted)' }}>Estimated monthly footprint</span>
          <span className="font-data text-xl font-semibold" style={{ color: 'var(--cl-text)' }}>
            {liveTotal.toFixed(1)}{' '}
            <span className="text-sm font-normal" style={{ color: 'var(--cl-text-muted)' }}>kg CO₂</span>
          </span>
        </div>

        {/* Step card */}
        <div className="card p-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>How do you get around?</h2>
              <div className="space-y-2" role="radiogroup" aria-label="Car type">
                {([
                  ['none', 'No car', Bus],
                  ['electric', 'Electric car', Zap],
                  ['petrol', 'Petrol car', Car],
                  ['diesel', 'Diesel car', Car],
                ] as const).map(([val, label, Icon]) => (
                  <RadioCard key={val} selected={transport.carType === val} onClick={() => setTransport({ ...transport, carType: val })}>
                    <span className="flex items-center gap-2 font-medium">
                      <Icon size={16} style={{ color: 'oklch(0.87 0.185 150)' }} className="shrink-0" />
                      {label}
                    </span>
                  </RadioCard>
                ))}
              </div>
              <Slider label="Monthly km by car" value={transport.carKm} min={0} max={3000} unit="km" onChange={(v) => setTransport({ ...transport, carKm: v })} />
              <Slider label="Monthly transit km" value={transport.transitKm} min={0} max={2000} unit="km" onChange={(v) => setTransport({ ...transport, transitKm: v })} />
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cl-text-muted)' }}>Monthly flight hours</label>
                <input
                  type="number" min={0} max={500} value={transport.flightHours}
                  onChange={(e) => setTransport({ ...transport, flightHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 cl-input"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>Home energy use</h2>
              <Slider label="Monthly electricity" value={energy.electricityKwh} min={0} max={600} unit="kWh" onChange={(v) => setEnergy({ ...energy, electricityKwh: v })} />
              <Slider label="Monthly gas" value={energy.gasUnits} min={0} max={50} unit="m³" onChange={(v) => setEnergy({ ...energy, gasUnits: v })} />
              <div className="space-y-2" role="radiogroup" aria-label="Energy source">
                {([
                  ['grid', 'City grid (DISCOM)', Zap],
                  ['mixed', 'Mixed / partial solar', Flame],
                  ['renewable', 'Fully renewable', Leaf],
                ] as const).map(([val, label, Icon]) => (
                  <RadioCard key={val} selected={energy.energySource === val} onClick={() => setEnergy({ ...energy, energySource: val })}>
                    <span className="flex items-center gap-2 font-medium">
                      <Icon size={16} style={{ color: 'oklch(0.87 0.185 150)' }} className="shrink-0" />
                      {label}
                    </span>
                  </RadioCard>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>What do you eat?</h2>
              <div className="space-y-2" role="radiogroup" aria-label="Diet type">
                {([
                  ['vegan', 'Vegan', 'No animal products'],
                  ['vegetarian', 'Vegetarian', 'No meat or fish'],
                  ['average', 'Average omnivore', 'Balanced mix of everything'],
                  ['meat-heavy', 'Meat-heavy', 'Meat at most meals'],
                ] as const).map(([val, label, desc]) => (
                  <RadioCard key={val} selected={diet.dietType === val} onClick={() => setDiet({ ...diet, dietType: val })}>
                    <span className="flex items-center gap-2">
                      <UtensilsCrossed size={15} style={{ color: 'oklch(0.87 0.185 150)' }} className="shrink-0" />
                      <span>
                        <span className="font-medium">{label}</span>
                        <span className="block text-xs mt-0.5" style={{ color: 'var(--cl-text-subtle)' }}>{desc}</span>
                      </span>
                    </span>
                  </RadioCard>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cl-text-muted)' }}>Meals per day</label>
                <div className="flex items-center gap-4">
                  {[
                    { label: '−', action: () => setDiet({ ...diet, mealCount: Math.max(1, diet.mealCount - 1) }), aria: 'Decrease meals' },
                    null,
                    { label: '+', action: () => setDiet({ ...diet, mealCount: Math.min(5, diet.mealCount + 1) }), aria: 'Increase meals' },
                  ].map((btn, i) => btn === null ? (
                    <span key={i} className="font-data text-2xl font-semibold w-8 text-center" style={{ color: 'var(--cl-text)' }}>{diet.mealCount}</span>
                  ) : (
                    <button key={i} type="button" onClick={btn.action} aria-label={btn.aria}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg focus-ring"
                      style={{ background: 'var(--cl-surface-up)', border: '1px solid var(--cl-border-mid)', color: 'var(--cl-text-muted)' }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>Almost there</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cl-text-muted)' }}>Your first name</label>
                <input
                  id="name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full px-3 py-2.5 cl-input"
                />
              </div>
              <Slider label="Monthly reduction goal" value={goalPct} min={5} max={30} unit="%" onChange={setGoalPct} />
              <p className="text-sm p-4 rounded-2xl" style={{ color: 'var(--cl-text-muted)', background: 'oklch(0.87 0.185 150 / 0.07)', border: '1px solid oklch(0.87 0.185 150 / 0.18)' }}>
                Aiming to cut your footprint by{' '}
                <strong style={{ color: 'oklch(0.87 0.185 150)' }}>{goalPct}%</strong> — that's{' '}
                <strong style={{ color: 'oklch(0.87 0.185 150)' }}>
                  {(liveTotal * (goalPct / 100)).toFixed(1)} kg CO₂
                </strong>{' '}
                in savings.
              </p>
            </>
          )}

          <div className="flex gap-3 pt-1">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl font-semibold focus-ring transition-all hover:brightness-110"
                style={backStyle}>
                <ArrowLeft size={15} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(step + 1)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 font-semibold focus-ring transition-all hover:brightness-110"
                style={ctaStyle}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 font-semibold focus-ring transition-all hover:brightness-110"
                style={ctaStyle}>
                See my footprint <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--cl-text-subtle)' }}>
          Emission factors: CEA India 2023 · IPCC · DEFRA 2023
        </p>
      </div>
    </div>
  )
}
