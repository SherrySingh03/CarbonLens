import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion, useScroll, useSpring, useInView, animate,
} from 'framer-motion'
import {
  ArrowRight, LayoutDashboard, Zap, TrendingDown,
  UtensilsCrossed, Car, CheckCircle2, Globe,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import BenchmarkRail from '../components/BenchmarkRail'
import EquivalencesCard from '../components/EquivalencesCard'

// ─── logo ───────────────────────────────────────────────────────────────────────

function RingLogo({ size = 26 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="CarbonLens"
      width={size}
      height={size}
      style={{ borderRadius: Math.round(size * 0.22), display: 'block', flexShrink: 0 }}
    />
  )
}

// ─── scroll progress ───────────────────────────────────────────────────────────

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      style={{ scaleX, background: 'linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150), oklch(0.85 0.14 90))' }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50 pointer-events-none"
    />
  )
}

// ─── count-up on scroll ────────────────────────────────────────────────────────

function Num({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctrl = animate(0, to, {
      duration: 2.4, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString('en-IN') + suffix },
    })
    return ctrl.stop
  }, [inView, to, prefix, suffix])
  return <span ref={ref}>{prefix}0{suffix}</span>
}

// ─── motion wrappers ───────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SlideIn({ children, from = 'left', delay = 0, className = '' }: {
  children: React.ReactNode; from?: 'left' | 'right'; delay?: number; className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from === 'left' ? -56 : 56 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── ticker ───────────────────────────────────────────────────────────────────

const FACTS = [
  'India emits 125 kg CO₂ per person every month',
  '3× below the global average of 375 kg',
  'Transport accounts for 40–50% of urban footprints',
  'One domestic flight hour = 90 kg CO₂ per passenger',
  'A vegetarian diet cuts food emissions by 40%',
  'LED bulbs save ~3 kg CO₂ per 100 W replaced monthly',
  'Air conditioning adds ~15 kg CO₂/month in summer',
  'EVs emit 60% less per km under India grid conditions',
  'Each online delivery averages 0.5 kg CO₂',
  'India grid emission factor: 0.716 kg CO₂/kWh (CEA 2023)',
]

function Ticker() {
  const doubled = [...FACTS, ...FACTS]
  return (
    <div className="overflow-hidden" style={{ borderTop: '1px solid oklch(0.5 0.02 170 / 0.1)', borderBottom: '1px solid oklch(0.5 0.02 170 / 0.1)', background: 'oklch(0.87 0.185 150 / 0.03)' }}>
      <div
        className="flex gap-10 py-3 whitespace-nowrap"
        style={{ animation: 'ticker 36s linear infinite' }}
        aria-hidden="true"
      >
        {doubled.map((f, i) => (
          <span key={i} className="text-xs shrink-0 flex items-center gap-3" style={{ color: 'var(--cl-text-subtle)' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'oklch(0.87 0.185 150 / 0.5)', display: 'inline-block', flexShrink: 0 }} />
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── hero gauge (animated ring for landing) ───────────────────────────────────

function HeroGauge() {
  const R = 96
  const CIRC = 2 * Math.PI * R
  const offset = CIRC * (1 - 0.72)

  return (
    <div style={{ position: 'relative', width: 280, height: 280, display: 'grid', placeItems: 'center' }}>
      <div style={{
        position: 'absolute', inset: 24, borderRadius: '50%',
        background: 'radial-gradient(circle, oklch(0.87 0.185 150 / 0.16), transparent 70%)',
        animation: 'cl-pulse 6s ease-in-out infinite',
      }} />
      <svg width="280" height="280" viewBox="0 0 280 280" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="hero-gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.83 0.105 205)" />
            <stop offset="55%" stopColor="oklch(0.87 0.185 150)" />
            <stop offset="100%" stopColor="oklch(0.85 0.14 90)" />
          </linearGradient>
          <filter id="hero-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="140" cy="140" r={R} fill="none" stroke="oklch(0.3 0.016 170 / 0.5)" strokeWidth="14" />
        <motion.circle
          cx="140" cy="140" r={R}
          fill="none"
          stroke="url(#hero-gauge-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: 'url(#hero-glow) drop-shadow(0 0 10px oklch(0.87 0.185 150 / 0.5))' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(0.72 0.018 165)' }}>
          Eco score
        </div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 64, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: 'oklch(0.97 0.01 160)' }}
        >
          <Num to={370} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '4px 11px', borderRadius: 999, background: 'oklch(0.84 0.16 152 / 0.14)', border: '1px solid oklch(0.84 0.16 152 / 0.3)' }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'oklch(0.84 0.16 152)' }}>↓ trending down</span>
        </motion.div>
      </div>
    </div>
  )
}

// ─── feature visuals (kept from original) ────────────────────────────────────

function MiniLogUI() {
  const rows = [
    { label: 'Car km / month', val: 12, max: 100, teal: true },
    { label: 'Electricity kWh', val: 45, max: 100, teal: false },
  ]
  const diets = ['Vegan', 'Veg', 'Mixed', 'Meat']
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--cl-surface)', border: '1px solid var(--cl-border)' }}>
      <p className="text-[10px] font-data uppercase tracking-widest mb-4" style={{ color: 'var(--cl-text-subtle)' }}>Today's quick log</p>
      {rows.map(({ label, val, max, teal }, i) => {
        const pct = (val / max) * 100
        return (
          <div key={label} className="mb-3.5">
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--cl-text-subtle)' }}>{label}</span>
              <span className="font-data text-xs" style={{ color: 'var(--cl-text-muted)' }}>{val}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 999, background: teal ? 'linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150))' : 'linear-gradient(90deg, oklch(0.85 0.14 90), oklch(0.87 0.185 150))' }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )
      })}
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--cl-border)' }}>
        <p className="text-[10px] mb-2" style={{ color: 'var(--cl-text-subtle)' }}>Diet</p>
        <div className="flex gap-2">
          {diets.map((d, i) => (
            <span key={d} className="text-[10px] px-2.5 py-1 rounded-lg" style={{
              border: i === 1 ? '1px solid oklch(0.87 0.185 150 / 0.4)' : '1px solid var(--cl-border)',
              background: i === 1 ? 'oklch(0.87 0.185 150 / 0.1)' : 'transparent',
              color: i === 1 ? 'oklch(0.87 0.185 150)' : 'var(--cl-text-subtle)',
            }}>{d}</span>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 flex justify-between items-center" style={{ borderTop: '1px solid var(--cl-border)' }}>
        <span className="text-xs" style={{ color: 'var(--cl-text-subtle)' }}>Live total</span>
        <span className="font-data text-sm font-bold" style={{ color: 'oklch(0.87 0.185 150)' }}>24.8 kg CO₂</span>
      </div>
    </div>
  )
}

function ComparisonBars() {
  const bars = [
    { label: 'You', kg: 138, pct: 37, grad: 'linear-gradient(90deg, oklch(0.83 0.105 205), oklch(0.87 0.185 150))', glow: true },
    { label: 'India average', kg: 125, pct: 33, grad: 'linear-gradient(90deg, oklch(0.84 0.16 152), oklch(0.87 0.185 150))', glow: false },
    { label: 'Global average', kg: 375, pct: 100, grad: 'linear-gradient(90deg, oklch(0.85 0.14 90), oklch(0.70 0.18 33))', glow: false },
  ]
  return (
    <div className="space-y-6">
      {bars.map(({ label, kg, pct, grad, glow }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: glow ? 'var(--cl-text)' : 'var(--cl-text-subtle)' }}>{label}</span>
            <span className="font-data text-sm font-bold" style={{ color: glow ? 'oklch(0.87 0.185 150)' : 'var(--cl-text-subtle)' }}>{kg} kg/mo</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'oklch(0.3 0.016 170 / 0.5)' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 999, background: grad, boxShadow: glow ? '0 0 10px oklch(0.87 0.185 150 / 0.4)' : 'none' }}
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── main ──────────────────────────────────────────────────────────────────────

const AI_TIPS = [
  { title: 'Use public transit for your daily commute twice a week', cat: 'Transport', kg: 12.4, diff: 'Easy' },
  { title: 'Set AC thermostat to 24°C instead of 20°C this summer', cat: 'Energy', kg: 8.1, diff: 'Easy' },
  { title: 'Replace two meat meals per week with vegetarian options', cat: 'Diet', kg: 6.3, diff: 'Easy' },
] as const

const STEPS = [
  { n: '01', Icon: UtensilsCrossed, title: 'Answer four questions', desc: 'Transport, energy, diet, purchases — pre-filled with India averages. Only update what differs. Five minutes.', color: 'oklch(0.87 0.185 150)', bg: 'oklch(0.87 0.185 150 / 0.1)', border: 'oklch(0.87 0.185 150 / 0.2)' },
  { n: '02', Icon: TrendingDown,    title: 'See your exact score',   desc: 'Calculated instantly using CEA India 2023 grid data and IPCC factors. Your number, not an estimate.', color: 'oklch(0.83 0.105 205)', bg: 'oklch(0.83 0.105 205 / 0.1)', border: 'oklch(0.83 0.105 205 / 0.2)' },
  { n: '03', Icon: Zap,             title: 'Get ranked actions',     desc: 'Claude AI ranks six specific cuts by kg saved, personalised to your data — not generic advice.', color: 'oklch(0.85 0.14 90)', bg: 'oklch(0.85 0.14 90 / 0.1)', border: 'oklch(0.85 0.14 90 / 0.2)' },
] as const

export default function Landing() {
  const { profile } = useApp()
  const hasProfile = Boolean(profile)
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => scrollY.on('change', (v) => setScrolled(v > 60)), [scrollY])

  const ctaProps = hasProfile
    ? { to: '/dashboard', label: 'Go to your dashboard', Icon: LayoutDashboard }
    : { to: '/onboarding', label: 'Start your footprint', Icon: ArrowRight }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--cl-base)', color: 'var(--cl-text)' }}>

      {/* Ambient blobs — behind everything */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '-10%', left: '8%', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.87 0.185 150 / 0.12), transparent 68%)', filter: 'blur(40px)', animation: 'cl-drift 18s ease-in-out infinite, cl-pulse 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-6%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.83 0.105 205 / 0.10), transparent 68%)', filter: 'blur(44px)', animation: 'cl-drift2 22s ease-in-out infinite, cl-pulse 11s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '36%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.84 0.16 152 / 0.08), transparent 70%)', filter: 'blur(46px)', animation: 'cl-drift 26s ease-in-out infinite' }} />
      </div>

      <ScrollProgress />

      {/* ── nav ── */}
      <header
        className="sticky top-0 z-30 transition-all duration-300"
        style={{
          backdropFilter: scrolled ? 'blur(16px)' : undefined,
          background: scrolled ? 'oklch(0.15 0.014 168 / 0.88)' : 'transparent',
          borderBottom: scrolled ? '1px solid oklch(0.5 0.02 170 / 0.12)' : '1px solid transparent',
        }}
      >
        <div className="relative z-10 w-full px-6 lg:px-16 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RingLogo size={26} />
            <span className="font-display font-semibold" style={{ fontSize: 18, letterSpacing: '-0.02em', color: 'var(--cl-text)' }}>CarbonLens</span>
          </div>
          {hasProfile ? (
            <Link to="/dashboard"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl focus-ring transition-all"
              style={{ background: 'var(--cl-surface-up)', border: '1px solid var(--cl-border-mid)', color: 'var(--cl-text-muted)' }}
            >
              <LayoutDashboard size={13} /> Dashboard
            </Link>
          ) : (
            <Link to="/onboarding"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl focus-ring transition-all hover:brightness-110"
              style={{ background: 'oklch(0.87 0.185 150)', color: 'oklch(0.15 0.014 168)', boxShadow: '0 4px 14px oklch(0.87 0.185 150 / 0.3)' }}
            >
              Get started <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </header>

      {/* ── hero ── */}
      <section className="relative z-10 w-full px-4 md:px-6 lg:px-16 pt-12 pb-8">
        {/* Design-language hero card */}
        <div style={{
          position: 'relative', borderRadius: 24, overflow: 'hidden',
          border: '1px solid oklch(0.5 0.02 170 / 0.14)',
          background: 'linear-gradient(165deg, oklch(0.19 0.016 170), oklch(0.155 0.014 168))',
        }}>
          {/* top-right ambient blob inside card */}
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.87 0.185 150 / 0.22), transparent 66%)', filter: 'blur(30px)', animation: 'cl-pulse 8s ease-in-out infinite', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 40, alignItems: 'center', padding: 'clamp(28px, 5vw, 64px)' }} className="max-md:grid-cols-1">
            {/* Left: text */}
            <div>
              {/* Pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 13px', borderRadius: 999, background: 'oklch(0.235 0.018 172 / 0.7)', border: '1px solid oklch(0.5 0.02 170 / 0.18)', marginBottom: 22 }}
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.06em', color: 'oklch(0.84 0.16 152)' }}>●</span>
                <span style={{ fontSize: 13, color: 'var(--cl-text-muted)' }}>
                  {hasProfile ? `Welcome back, ${profile!.name}` : 'Built for India · Powered by Claude AI'}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-display font-semibold"
                style={{ fontSize: 'clamp(30px, 5vw, 52px)', lineHeight: 1.04, letterSpacing: '-0.03em', marginBottom: 18, color: 'var(--cl-text)' }}
              >
                See your carbon.{' '}
                <span style={{ background: 'linear-gradient(100deg, oklch(0.87 0.185 150), oklch(0.83 0.105 205))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Then bend it down.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--cl-text-muted)', maxWidth: '46ch', marginBottom: 28 }}
              >
                Log a week in two minutes. CarbonLens turns transport, energy, diet and spending into one clear score — and an AI that tells you the three changes that actually move it.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.48 }}
                style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}
              >
                <Link
                  to={ctaProps.to}
                  className="focus-ring transition-all hover:brightness-110"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: 'oklch(0.18 0.02 160)', background: 'oklch(0.87 0.185 150)', padding: '14px 24px', borderRadius: 12, boxShadow: '0 8px 28px oklch(0.87 0.185 150 / 0.32)', textDecoration: 'none' }}
                >
                  <ctaProps.Icon size={16} /> {ctaProps.label}
                </Link>
                <Link
                  to="/onboarding"
                  className="focus-ring transition-all"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--cl-text)', background: 'oklch(0.5 0.02 170 / 0.08)', border: '1px solid oklch(0.5 0.02 170 / 0.22)', padding: '14px 22px', borderRadius: 12, textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.5 0.02 170 / 0.16)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'oklch(0.5 0.02 170 / 0.08)')}
                >
                  See how it works
                </Link>
              </motion.div>
            </div>

            {/* Right: animated gauge */}
            <div className="hidden md:grid" style={{ placeItems: 'center' }}>
              <HeroGauge />
            </div>
          </div>
        </div>
      </section>

      {/* ── ticker ── */}
      <div className="relative z-10">
        <Ticker />
      </div>

      {/* ── stats ── */}
      <section className="relative z-10" style={{ borderBottom: '1px solid oklch(0.5 0.02 170 / 0.1)', background: 'oklch(0.87 0.185 150 / 0.02)' }}>
        <div className="w-full px-6 lg:px-16 py-14 grid grid-cols-3 divide-x" style={{ borderColor: 'oklch(0.5 0.02 170 / 0.1)' }}>
          {([
            { to: 125, suffix: ' kg', label: 'India avg CO₂ per person per month', color: 'oklch(0.87 0.185 150)' },
            { to: 375, suffix: ' kg', label: 'Global avg CO₂ per person per month', color: 'oklch(0.83 0.105 205)' },
            { to: 36,  suffix: 'B+',  label: 'Tonnes of CO₂ emitted globally every year', color: 'oklch(0.85 0.14 90)' },
          ] as const).map(({ to, suffix, label, color }, i) => (
            <FadeUp key={label} delay={i * 0.1} className="text-center px-8">
              <p className="font-data font-bold text-5xl md:text-6xl mb-2" style={{ color }}>
                <Num to={to} suffix={suffix} />
              </p>
              <p className="text-xs leading-snug max-w-[12ch] mx-auto" style={{ color: 'var(--cl-text-subtle)' }}>{label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── how it works ── */}
      <section className="relative z-10 w-full px-6 lg:px-16 py-24">
        <FadeUp>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'oklch(0.87 0.185 150)' }}>Process</p>
          <h2 className="font-display font-semibold mb-16" style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.025em', color: 'var(--cl-text)' }}>
            From unknown to{' '}
            <span style={{ background: 'linear-gradient(100deg, oklch(0.87 0.185 150), oklch(0.83 0.105 205))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              actionable.
            </span>
          </h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map(({ n, Icon, title, desc, color, bg, border }, i) => (
            <FadeUp key={n} delay={i * 0.12}>
              <div className="h-full rounded-2xl p-6 transition-all duration-300" style={{ border: `1px solid var(--cl-border)`, background: 'var(--cl-surface)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color} / 0.3`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--cl-border)')}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="font-data text-xs font-semibold mb-2.5" style={{ color }}>{n}</div>
                <h3 className="font-display font-semibold mb-2 leading-snug" style={{ color: 'var(--cl-text)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cl-text-muted)' }}>{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── feature 1: daily log ── */}
      <section className="relative z-10 w-full px-6 lg:px-16 py-24" style={{ borderTop: '1px solid oklch(0.5 0.02 170 / 0.1)' }}>
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <SlideIn from="left">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'oklch(0.87 0.185 150)' }}>Daily tracking</p>
            <h2 className="font-display font-semibold mb-5 leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 38px)', letterSpacing: '-0.025em', color: 'var(--cl-text)' }}>
              Log your day<br />in 30 seconds.
            </h2>
            <p className="leading-relaxed mb-7" style={{ color: 'var(--cl-text-muted)' }}>
              The quick-log sheet pre-fills from your last entry. Adjust only what changed — a slider for km driven,
              a tap for diet, a number for orders. Most days: under a minute.
            </p>
            <ul className="space-y-3">
              {['Pre-fills from your previous log', 'Sliders for fast numeric input', 'Live CO₂ total updates as you adjust'].map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--cl-text-muted)' }}>
                  <CheckCircle2 size={15} style={{ color: 'oklch(0.87 0.185 150)', flexShrink: 0 }} />
                  {pt}
                </li>
              ))}
            </ul>
          </SlideIn>
          <SlideIn from="right" delay={0.1}>
            <MiniLogUI />
          </SlideIn>
        </div>
      </section>

      {/* ── feature 2: benchmark ── */}
      <section className="relative z-10 w-full px-6 lg:px-16 py-24" style={{ borderTop: '1px solid oklch(0.5 0.02 170 / 0.1)' }}>
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <SlideIn from="left">
            <ComparisonBars />
          </SlideIn>
          <SlideIn from="right" delay={0.1}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'oklch(0.83 0.105 205)' }}>Benchmarking</p>
            <h2 className="font-display font-semibold mb-5 leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 38px)', letterSpacing: '-0.025em', color: 'var(--cl-text)' }}>
              See where you stand<br />against India.
            </h2>
            <p className="leading-relaxed mb-7" style={{ color: 'var(--cl-text-muted)' }}>
              Your score is compared against real Indian demographics — not global averages that don't apply here.
              India's grid, roads, and food systems are different. Your benchmark should be too.
            </p>
            <ul className="space-y-3">
              {['CEA India 2023 grid emission factor', 'MoEFCC per-capita baseline', 'Live grid intensity via Electricity Maps API'].map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--cl-text-muted)' }}>
                  <CheckCircle2 size={15} style={{ color: 'oklch(0.83 0.105 205)', flexShrink: 0 }} />
                  {pt}
                </li>
              ))}
            </ul>
          </SlideIn>
        </div>
      </section>

      {/* ── feature 3: AI tips ── */}
      <section className="relative z-10 w-full px-6 lg:px-16 py-24" style={{ borderTop: '1px solid oklch(0.5 0.02 170 / 0.1)' }}>
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <SlideIn from="left">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'oklch(0.85 0.14 90)' }}>AI-powered plan</p>
            <h2 className="font-display font-semibold mb-5 leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 38px)', letterSpacing: '-0.025em', color: 'var(--cl-text)' }}>
              Six cuts, ranked<br />by kg saved.
            </h2>
            <p className="leading-relaxed mb-7" style={{ color: 'var(--cl-text-muted)' }}>
              Claude AI reads your exact footprint breakdown and returns six specific actions — ordered by CO₂ impact,
              calibrated to your categories. Commit to one and track it over time.
            </p>
            <ul className="space-y-3">
              {['Ranked by kg CO₂ saved per month', 'Specific to your biggest categories', 'Difficulty-rated from Easy to Hard'].map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--cl-text-muted)' }}>
                  <CheckCircle2 size={15} style={{ color: 'oklch(0.85 0.14 90)', flexShrink: 0 }} />
                  {pt}
                </li>
              ))}
            </ul>
          </SlideIn>
          <SlideIn from="right" delay={0.1}>
            <div className="space-y-3">
              {AI_TIPS.map((tip, i) => (
                <FadeUp key={tip.title} delay={i * 0.1}>
                  <div className="rounded-2xl p-4" style={{ border: '1px solid var(--cl-border)', background: 'var(--cl-surface)' }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--cl-text)' }}>{tip.title}</p>
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: 'oklch(0.87 0.185 150)', background: 'oklch(0.87 0.185 150 / 0.1)', border: '1px solid oklch(0.87 0.185 150 / 0.2)' }}>{tip.diff}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--cl-text-subtle)' }}>{tip.cat}</span>
                      <span className="font-data text-xs font-semibold" style={{ color: 'oklch(0.87 0.185 150)' }}>~{tip.kg} kg CO₂/mo</span>
                    </div>
                  </div>
                </FadeUp>
              ))}
              <FadeUp delay={0.35}>
                <p className="text-xs text-center pt-1" style={{ color: 'var(--cl-text-subtle)' }}>Generated by Claude AI · personalised to your footprint</p>
              </FadeUp>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* ── understand your number (live component demos) ── */}
      <section className="relative z-10 w-full px-6 lg:px-16 md:py-20 md:grid md:grid-cols-2" style={{ borderTop: '1px solid oklch(0.5 0.02 170 / 0.1)' }}>
        
        <FadeUp className="mb-10">
          <div className='flex-row md:my-32'>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'oklch(0.83 0.105 205)' }}>Understand your number</p>
          <h2 className="font-display font-semibold leading-tight" style={{ fontSize: 'clamp(26px, 4vw, 38px)', letterSpacing: '-0.025em', color: 'var(--cl-text)', maxWidth: '22ch' }}>
            Your score in the real world — not just a number.
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--cl-text-muted)', maxWidth: '50ch' }}>
            CarbonLens translates your monthly total into tangible India-specific anchors and shows exactly where you stand against the national average.
            Below is a preview using India's average of 125 kg/mo.
          </p>
          </div>
        </FadeUp>
        <div className="space-y-4 max-w-2xl">
          <FadeUp delay={0.1}>
            <BenchmarkRail kg={125} />
          </FadeUp>
          <FadeUp delay={0.2}>
            <EquivalencesCard kg={125} period="monthly (India avg)" />
          </FadeUp>
        </div>
      </section>

      {/* ── india context band ── */}
      <section className="relative z-10 overflow-hidden py-20" style={{ borderTop: '1px solid oklch(0.87 0.185 150 / 0.1)', borderBottom: '1px solid oklch(0.87 0.185 150 / 0.1)', background: 'linear-gradient(135deg, oklch(0.87 0.185 150 / 0.06) 0%, var(--cl-base) 60%)' }}>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'oklch(0.87 0.185 150 / 0.06)', filter: 'blur(100px)' }} />
        <div className="relative w-full px-6 lg:px-16">
          <FadeUp className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={16} style={{ color: 'oklch(0.87 0.185 150)' }} />
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'oklch(0.87 0.185 150)' }}>Built for India</p>
            </div>
            <h2 className="font-display font-semibold max-w-2xl leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.025em', color: 'var(--cl-text)' }}>
              Calibrated to India's grid, roads, and markets.
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {([
              { Icon: Car,          label: '0.716 kg CO₂/kWh', sub: 'India grid factor (CEA 2023)',            color: 'oklch(0.87 0.185 150)' },
              { Icon: Globe,        label: '3× below global',   sub: 'India avg vs world avg per capita',      color: 'oklch(0.83 0.105 205)' },
              { Icon: TrendingDown, label: '30% cut possible',  sub: 'Achievable with 3 behaviour changes',    color: 'oklch(0.85 0.14 90)'   },
            ] as const).map(({ Icon, label, sub, color }, i) => (
              <FadeUp key={label} delay={i * 0.1}>
                <div className="rounded-2xl p-5" style={{ border: '1px solid var(--cl-border)', background: 'var(--cl-surface)' }}>
                  <Icon size={18} style={{ color, marginBottom: 12 }} />
                  <p className="font-data font-bold text-xl mb-1" style={{ color }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--cl-text-subtle)' }}>{sub}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── final CTA ── */}
      <section className="relative z-10 w-full px-6 lg:px-16 py-28">
        <FadeUp>
          <div className="rounded-3xl p-12 md:p-20 text-center relative overflow-hidden" style={{ border: '1px solid oklch(0.87 0.185 150 / 0.15)', background: 'linear-gradient(135deg, oklch(0.87 0.185 150 / 0.08) 0%, oklch(0.83 0.105 205 / 0.04) 50%, var(--cl-base) 100%)' }}>
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'oklch(0.87 0.185 150 / 0.12)', filter: 'blur(80px)' }} />
            <div className="relative">
              <h2 className="font-display font-semibold mb-4 leading-tight" style={{ fontSize: 'clamp(36px, 6vw, 56px)', letterSpacing: '-0.03em', color: 'var(--cl-text)' }}>
                Five minutes.<br />
                <span style={{ background: 'linear-gradient(100deg, oklch(0.87 0.185 150), oklch(0.83 0.105 205))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Real numbers.
                </span>
              </h2>
              <p className="mb-10 max-w-xs mx-auto text-sm leading-relaxed" style={{ color: 'var(--cl-text-subtle)' }}>
                No account. No email. Your data stays in your browser. India-specific from day one.
              </p>
              <Link
                to={ctaProps.to}
                className="inline-flex items-center gap-2 font-semibold px-10 py-4 rounded-2xl focus-ring transition-all hover:brightness-110"
                style={{ background: 'oklch(0.87 0.185 150)', color: 'oklch(0.15 0.014 168)', boxShadow: '0 0 40px oklch(0.87 0.185 150 / 0.4)', fontSize: 16 }}
              >
                <ctaProps.Icon size={18} /> {ctaProps.label}
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── footer ── */}
      <footer style={{ borderTop: '1px solid oklch(0.5 0.02 170 / 0.08)', padding: '32px 0' }}>
        <div className="w-full px-6 lg:px-16 text-center space-y-1.5">
          <p className="text-xs" style={{ color: 'oklch(0.4 0.01 165)' }}>Emission factors: CEA India 2023 · IPCC AR6 · DEFRA 2023 · Poore &amp; Nemecek 2018</p>
          <p className="text-xs" style={{ color: 'oklch(0.4 0.01 165)' }}>India avg: 125 kg CO₂/mo (MoEFCC) · Global: 375 kg CO₂/mo (IEA 2022)</p>
          <p className="text-xs pt-1" style={{ color: 'oklch(0.32 0.008 165)' }}>Disclaimer: Calculations are estimates for informational purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
