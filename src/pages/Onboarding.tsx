import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { UtensilsCrossed, ArrowRight, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calculateTotal, appliancesToEnergy } from '../lib/emissions'
import { Panel, Toggle, SegmentedPick, RangeSlider, Counter } from '../components/FormWidgets'
import type { TransportData, HomeEnergyData, DietData, PurchasesData } from '../types'

const STEPS = ['Transport', 'Energy', 'Diet', 'Profile'] as const

const DEFAULT_PURCHASES: PurchasesData = { onlineOrdersCount: 2, newClothingItems: 0, electronicsItems: 0 }

function RadioCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onClick}
      className="w-full text-left p-4 rounded-2xl transition-all duration-150 focus-ring"
      style={{
        border: selected ? '1px solid oklch(0.87 0.185 150 / 0.55)' : '1px solid var(--cl-border-mid)',
        background: selected ? 'oklch(0.87 0.185 150 / 0.10)' : 'var(--cl-surface-up)',
        color: selected ? 'oklch(0.87 0.185 150)' : 'var(--cl-text-muted)',
      }}>
      {children}
    </button>
  )
}

function RingLogo() {
  return (
    <img src="/logo.png" alt="CarbonLens" width={40} height={40}
      style={{ borderRadius: 9, display: 'block', margin: '0 auto 12px' }} />
  )
}

const CAR_OPTS    = ['none', 'electric', 'petrol', 'diesel'] as const
const ENERGY_OPTS = ['grid', 'mixed', 'renewable'] as const

export default function Onboarding() {
  const navigate = useNavigate()
  const { saveProfile, saveDailyLog } = useApp()
  const [step, setStep] = useState(0)

  // Transport — monthly scale
  const [carType, setCarType]         = useState<TransportData['carType']>('petrol')
  const [carKm, setCarKm]             = useState(100)
  const [transitKm, setTransitKm]     = useState(50)
  const [flightHours, setFlightHours] = useState(0)

  // Energy — daily averages (appliance-based)
  const [energySource, setEnergySource]       = useState<HomeEnergyData['energySource']>('grid')
  const [acHours, setAcHours]                 = useState(4)
  const [tvHours, setTvHours]                 = useState(3)
  const [hasFridge, setHasFridge]             = useState(true)
  const [cookingSessions, setCookingSessions] = useState(3)

  // Diet
  const [dietType, setDietType]   = useState<DietData['dietType']>('average')
  const [mealCount, setMealCount] = useState(3)

  // Profile
  const [name, setName]       = useState('')
  const [goalPct, setGoalPct] = useState(10)

  const [purchases] = useState<PurchasesData>(DEFAULT_PURCHASES)

  // Derived — daily energy object
  const dailyEnergy = appliancesToEnergy(acHours, tvHours, hasFridge, cookingSessions, energySource)

  // Scale to monthly for the live preview (calculateTotal expects monthly energy)
  const monthlyEnergy: HomeEnergyData = {
    ...dailyEnergy,
    electricityKwh: +(dailyEnergy.electricityKwh * 30).toFixed(1),
    gasUnits:       +(dailyEnergy.gasUnits * 30).toFixed(2),
  }
  const transport: TransportData = { carType, carKm, transitKm, flightHours }
  const diet: DietData           = { dietType, mealCount }
  const liveTotal = calculateTotal({ transport, homeEnergy: monthlyEnergy, diet, purchases })

  const handleFinish = useCallback(() => {
    const profile = {
      name: name.trim() || 'You',
      createdAt: new Date().toISOString(),
      monthlyGoalReductionPct: goalPct,
    }
    // Transport is monthly → divide by 30 for the daily log entry
    const dailyTransport: TransportData = {
      carType,
      carKm:        +(carKm / 30).toFixed(1),
      transitKm:    +(transitKm / 30).toFixed(1),
      flightHours:  +(flightHours / 30).toFixed(2),
    }
    // dailyEnergy is already day-scale from appliancesToEnergy
    const energy = appliancesToEnergy(acHours, tvHours, hasFridge, cookingSessions, energySource)
    const dailyTotal = calculateTotal(
      { transport: dailyTransport, homeEnergy: energy, diet: { dietType, mealCount }, purchases },
      true
    )
    saveProfile(profile)
    saveDailyLog({
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      transport: dailyTransport,
      homeEnergy: energy,
      diet: { dietType, mealCount },
      purchases,
      totalKgCO2: dailyTotal,
    })
    navigate('/dashboard')
  }, [
    name, goalPct, carType, carKm, transitKm, flightHours,
    acHours, tvHours, hasFridge, cookingSessions, energySource,
    dietType, mealCount, purchases, saveProfile, saveDailyLog, navigate,
  ])

  const ctaStyle  = { background: 'oklch(0.87 0.185 150)', color: 'oklch(0.15 0.014 168)', boxShadow: '0 8px 24px oklch(0.87 0.185 150 / 0.32)' }
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
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150))' }} />
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

          {/* ── Transport ── */}
          {step === 0 && (
            <>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>
                How do you get around?
              </h2>
              <Panel>
                <div className="space-y-5">
                  <SegmentedPick label="Vehicle type" options={CAR_OPTS} value={carType} onChange={setCarType} />
                  {carType !== 'none' && (
                    <RangeSlider label="Km by car per month" value={carKm} max={3000} step={10} unit="km/mo" onChange={setCarKm} />
                  )}
                  <RangeSlider label="Public transit / metro / bus" value={transitKm} max={2000} step={10} unit="km/mo" onChange={setTransitKm} />
                  <Counter label="Flight hours this month" value={flightHours} max={200} unit="hours in air" onChange={setFlightHours} />
                </div>
              </Panel>
            </>
          )}

          {/* ── Energy ── */}
          {step === 1 && (
            <>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>
                Home energy use
              </h2>
              <Panel>
                <div className="space-y-5">
                  <SegmentedPick label="Energy source" options={ENERGY_OPTS} value={energySource} onChange={setEnergySource} />
                  <div style={{ height: 1, background: 'oklch(0.5 0.02 170 / 0.14)' }} />
                  <RangeSlider label="AC hours per day (avg)" value={acHours} max={16} step={0.5} unit="h/day"
                    note="1.5 ton AC ≈ 1.5 kWh per hour" onChange={setAcHours} />
                  <RangeSlider label="TV / screens per day (avg)" value={tvHours} max={12} step={0.5} unit="h/day"
                    note="100W screen ≈ 0.1 kWh per hour" onChange={setTvHours} />
                  <Toggle label="Fridge at home" description="Typical 200L fridge ≈ 0.96 kWh/day"
                    value={hasFridge} onChange={setHasFridge} />
                  <Counter label="Cooking sessions per day (avg)" value={cookingSessions} min={0} max={6}
                    unit="sessions (≈ 30 min burner each)" onChange={setCookingSessions} />
                  <div style={{ fontSize: 12, color: 'var(--cl-text-subtle)', padding: '8px 10px', borderRadius: 8, background: 'oklch(0.235 0.018 172 / 0.6)', lineHeight: 1.5 }}>
                    ⚡ {monthlyEnergy.electricityKwh} kWh electricity · 🔥 {monthlyEnergy.gasUnits} m³ gas per month
                  </div>
                </div>
              </Panel>
            </>
          )}

          {/* ── Diet ── */}
          {step === 2 && (
            <>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>
                What do you eat?
              </h2>
              <Panel>
                <div className="space-y-5">
                  <div className="space-y-2" role="radiogroup" aria-label="Diet type">
                    {([
                      ['vegan',      'Vegan',           'No animal products'],
                      ['vegetarian', 'Vegetarian',      'No meat or fish'],
                      ['average',    'Average omnivore','Balanced mix of everything'],
                      ['meat-heavy', 'Meat-heavy',      'Meat at most meals'],
                    ] as const).map(([val, label, desc]) => (
                      <RadioCard key={val} selected={dietType === val} onClick={() => setDietType(val)}>
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
                  <Counter label="Meals per day" value={mealCount} min={1} max={6} unit="meals" onChange={setMealCount} />
                </div>
              </Panel>
            </>
          )}

          {/* ── Profile ── */}
          {step === 3 && (
            <>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--cl-text)', letterSpacing: '-0.01em' }}>
                Almost there
              </h2>
              <Panel>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="ob-name" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'oklch(0.84 0.014 165)', marginBottom: 8 }}>
                      Your first name
                    </label>
                    <input id="ob-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya" className="w-full px-3 py-2.5 cl-input" />
                  </div>
                  <RangeSlider label="Monthly reduction goal" value={goalPct} min={5} max={30} unit="%" onChange={setGoalPct} />
                  <p className="text-sm p-4 rounded-2xl" style={{ color: 'var(--cl-text-muted)', background: 'oklch(0.87 0.185 150 / 0.07)', border: '1px solid oklch(0.87 0.185 150 / 0.18)' }}>
                    Aiming to cut your footprint by{' '}
                    <strong style={{ color: 'oklch(0.87 0.185 150)' }}>{goalPct}%</strong> — that's{' '}
                    <strong style={{ color: 'oklch(0.87 0.185 150)' }}>{(liveTotal * (goalPct / 100)).toFixed(1)} kg CO₂</strong>{' '}
                    in savings per month.
                  </p>
                </div>
              </Panel>
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
