import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calculateTotal, calculateTransportEmissions, calculateEnergyEmissions, appliancesToEnergy } from '../lib/emissions'
import { Panel, Toggle, SegmentedPick, RangeSlider, Counter } from './FormWidgets'
import type { FootprintLog, TransportData, HomeEnergyData, DietData, PurchasesData } from '../types'

const CAR_OPTS   = ['none', 'electric', 'petrol', 'diesel'] as const
const ENERGY_OPTS = ['grid', 'mixed', 'renewable'] as const
const DIET_OPTS  = ['vegan', 'vegetarian', 'average', 'meat-heavy'] as const

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(0.87 0.185 150)' }}>
        {title}
      </span>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'oklch(0.5 0.02 170 / 0.14)', margin: '8px 0' }} />
}

// ─── Main sheet ───────────────────────────────────────────────────────────────

export default function QuickLogSheet({
  prefill,
  onClose,
}: {
  prefill: FootprintLog | null
  onClose: () => void
}) {
  const { saveDailyLog } = useApp()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    const panel = dialogRef.current
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previous?.focus()
    }
  }, [onClose])

  // ── Transport (full onboarding parity) ──
  const [carType, setCarType]       = useState<TransportData['carType']>(prefill?.transport.carType ?? 'petrol')
  const [carKm, setCarKm]           = useState(prefill?.transport.carKm ?? 0)
  const [transitKm, setTransitKm]   = useState(prefill?.transport.transitKm ?? 0)
  const [flightHours, setFlightHours] = useState(prefill?.transport.flightHours ?? 0)

  // ── Energy — appliance-based ──
  const [energySource, setEnergySource] = useState<HomeEnergyData['energySource']>(prefill?.homeEnergy.energySource ?? 'grid')
  const [acHours, setAcHours]           = useState(0)
  const [tvHours, setTvHours]           = useState(2)
  const [hasFridge, setHasFridge]       = useState(true)
  const [cookingSessions, setCookingSessions] = useState(2)

  // ── Diet (full onboarding parity) ──
  const [dietType, setDietType]   = useState<DietData['dietType']>(prefill?.diet.dietType ?? 'average')
  const [mealCount, setMealCount] = useState(prefill?.diet.mealCount ?? 3)

  // ── Purchases (all three) ──
  const [orders, setOrders]       = useState(prefill?.purchases.onlineOrdersCount ?? 0)
  const [clothing, setClothing]   = useState(prefill?.purchases.newClothingItems ?? 0)
  const [electronics, setElectronics] = useState(prefill?.purchases.electronicsItems ?? 0)

  // ── Derived ──
  const transport: TransportData = { carType, carKm, transitKm, flightHours }
  const energy: HomeEnergyData   = appliancesToEnergy(acHours, tvHours, hasFridge, cookingSessions, energySource)
  const diet: DietData           = { dietType, mealCount }
  const purchases: PurchasesData = { onlineOrdersCount: orders, newClothingItems: clothing, electronicsItems: electronics }

  const total        = calculateTotal({ transport, homeEnergy: energy, diet, purchases }, true)
  const transportKg  = calculateTransportEmissions(transport).toFixed(1)
  const energyKg     = calculateEnergyEmissions(energy).toFixed(1)

  function handleSave() {
    const log: FootprintLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      transport, homeEnergy: energy, diet, purchases,
      totalKgCO2: total,
    }
    saveDailyLog(log)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label="Log today's footprint"
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'oklch(0 0 0 / 0.65)' }}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="relative w-full max-h-[92vh] overflow-y-auto"
        style={{
          maxWidth: 560,
          background: 'oklch(0.17 0.015 170)',
          border: '1px solid oklch(0.5 0.02 170 / 0.22)',
          borderRadius: '1.5rem',
          boxShadow: '0 24px 80px oklch(0 0 0 / 0.65), 0 0 0 1px oklch(0.87 0.185 150 / 0.06)',
          padding: '1.5rem',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--cl-text)', letterSpacing: '-0.02em' }}>Log Today</h2>
            <p style={{ fontSize: 12, color: 'var(--cl-text-subtle)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl focus-ring"
            style={{ background: 'oklch(0.235 0.018 172)', border: '1px solid oklch(0.5 0.02 170 / 0.16)', color: 'var(--cl-text-muted)' }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-6">

          {/* ── TRANSPORT ── */}
          <Panel>
            <SectionHeader emoji="🚗" title="Transport" />
            <div className="space-y-5">
              <SegmentedPick label="Vehicle type" options={CAR_OPTS} value={carType} onChange={setCarType} />

              {carType !== 'none' && (
                <RangeSlider
                  label="Km driven today" value={carKm} max={200} unit="km"
                  note={`≈ ${transportKg} kg CO₂ from transport today`}
                  onChange={setCarKm}
                />
              )}

              <RangeSlider label="Public transit / metro / bus" value={transitKm} max={80} unit="km" onChange={setTransitKm} />

              <Counter label="Flight hours" value={flightHours} max={24} unit="hours in air today" onChange={(v) => setFlightHours(v)} />
            </div>
          </Panel>

          {/* ── HOME ENERGY ── */}
          <Panel>
            <SectionHeader emoji="⚡" title="Home Energy" />
            <div className="space-y-5">
              <SegmentedPick
                label="Energy source"
                options={ENERGY_OPTS}
                value={energySource}
                onChange={setEnergySource}
              />

              <Divider />

              <RangeSlider
                label="AC hours today"
                value={acHours} max={16} step={0.5} unit="h"
                note="1.5 ton AC ≈ 1.5 kWh per hour"
                onChange={setAcHours}
              />

              <RangeSlider
                label="TV / screens"
                value={tvHours} max={12} step={0.5} unit="h"
                note="100W TV ≈ 0.1 kWh per hour"
                onChange={setTvHours}
              />

              <Toggle
                label="Fridge running today"
                description="Typical 200L fridge ≈ 0.96 kWh/day"
                value={hasFridge}
                onChange={setHasFridge}
              />

              <Counter
                label="Cooking sessions on gas"
                value={cookingSessions} min={0} max={6}
                unit="sessions (each ≈ 30 min burner)"
                onChange={setCookingSessions}
              />

              <div style={{ fontSize: 12, color: 'var(--cl-text-subtle)', padding: '8px 10px', borderRadius: 8, background: 'oklch(0.235 0.018 172 / 0.6)', lineHeight: 1.5 }}>
                ⚡ {energy.electricityKwh} kWh electricity + 🔥 {energy.gasUnits} m³ gas → <strong style={{ color: 'var(--cl-text-muted)' }}>{energyKg} kg CO₂</strong>
              </div>
            </div>
          </Panel>

          {/* ── DIET ── */}
          <Panel>
            <SectionHeader emoji="🍽️" title="Diet" />
            <div className="space-y-5">
              <SegmentedPick label="Typical diet" options={DIET_OPTS} value={dietType} onChange={setDietType} />
              <Counter label="Meals today" value={mealCount} min={1} max={6} unit="meals eaten" onChange={setMealCount} />
            </div>
          </Panel>

          {/* ── PURCHASES ── */}
          <Panel>
            <SectionHeader emoji="🛍️" title="Purchases" />
            <div className="space-y-5">
              <Counter label="Online orders placed today" value={orders} max={20} unit="orders (≈ 0.5 kg CO₂ each)" onChange={setOrders} />
              <Counter label="New clothing items bought" value={clothing} max={10} unit="items (≈ 10 kg CO₂ each)" onChange={setClothing} />
              <Counter label="Electronics purchased" value={electronics} max={5} unit="items (≈ 70 kg CO₂ each)" onChange={setElectronics} />
            </div>
          </Panel>

          {/* ── Footer ── */}
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid oklch(0.5 0.02 170 / 0.14)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <p style={{ fontSize: 14, color: 'var(--cl-text-muted)' }}>Estimated total today</p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 600, color: 'var(--cl-text)', letterSpacing: '-0.02em' }}>
                {total.toFixed(1)}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 400, color: 'var(--cl-text-muted)', marginLeft: 6 }}>
                  kg CO₂
                </span>
              </p>
            </div>
            <p style={{ fontSize: 12, color: 'var(--cl-text-subtle)', marginBottom: 16 }}>
              ≈ {(total * 30).toFixed(0)} kg CO₂ / month at this rate
            </p>
            <button
              onClick={handleSave}
              className="w-full rounded-2xl py-3.5 font-semibold focus-ring transition-all hover:brightness-110"
              style={{
                background: 'oklch(0.87 0.185 150)',
                color: 'oklch(0.15 0.014 168)',
                boxShadow: '0 8px 28px oklch(0.87 0.185 150 / 0.32)',
                fontSize: 15,
              }}
            >
              Save Log
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
