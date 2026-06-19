import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion, useScroll, useTransform, useSpring, useInView, animate,
} from 'framer-motion'
import {
  ArrowRight, Leaf, LayoutDashboard, Zap, TrendingDown,
  UtensilsCrossed, Car, CheckCircle2, Globe,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

// ─── scroll progress ───────────────────────────────────────────────────────────

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 origin-left z-50 pointer-events-none"
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
    <div className="overflow-hidden border-y border-white/[0.04]" style={{ background: 'rgba(16,185,129,0.03)' }}>
      <div
        className="flex gap-10 py-3 whitespace-nowrap"
        style={{ animation: 'ticker 36s linear infinite' }}
        aria-hidden="true"
      >
        {doubled.map((f, i) => (
          <span key={i} className="text-xs text-zinc-600 shrink-0 flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-emerald-500/50 shrink-0" />
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── hero: app preview card ────────────────────────────────────────────────────

const HERO_ROWS = [
  { label: 'Transport', pct: 45, kg: 62, c: 'from-emerald-500 to-teal-500' },
  { label: 'Energy',    pct: 30, kg: 41, c: 'from-teal-500 to-cyan-500' },
  { label: 'Diet',      pct: 20, kg: 28, c: 'from-lime-500 to-green-500' },
] as const

const R2 = 84, CIRC2 = 2 * Math.PI * R2

function AppPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-72 shrink-0"
    >
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-emerald-500/40 via-teal-500/15 to-transparent" />
      <div className="relative rounded-3xl p-6" style={{ background: '#0c1410', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-data text-zinc-600 uppercase tracking-widest">Monthly score</span>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/15 px-2 py-0.5 rounded-full">Above avg</span>
        </div>

        {/* ring */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl" />
            <svg width={188} height={188} viewBox="0 0 188 188" aria-hidden="true">
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="188" y2="188" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="55%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#a3e635" />
                </linearGradient>
                <filter id="hglow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx={94} cy={94} r={R2} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
              <motion.circle
                cx={94} cy={94} r={R2} fill="none" stroke="url(#hg)" strokeWidth={10} strokeLinecap="round"
                strokeDasharray={CIRC2}
                initial={{ strokeDashoffset: CIRC2 }}
                animate={{ strokeDashoffset: CIRC2 * (1 - 138 / 500) }}
                transition={{ duration: 2.0, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '94px 94px', filter: 'url(#hglow)' }}
              />
              <text x="94" y="88" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="36" fontWeight="800" fontFamily="Bricolage Grotesque, system-ui">138</text>
              <text x="94" y="108" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="JetBrains Mono, monospace">kg CO₂ / month</text>
              <rect x="55" y="128" width="78" height="16" rx="8" fill="rgba(251,191,36,0.1)" />
              <text x="94" y="136" textAnchor="middle" dominantBaseline="middle" fill="#fbbf24" fontSize="8.5" fontWeight="600" fontFamily="system-ui">Above India avg</text>
            </svg>
          </div>
        </div>

        {/* bars */}
        <div className="space-y-2.5">
          {HERO_ROWS.map(({ label, pct, kg, c }, i) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-zinc-600">{label}</span>
                <span className="font-data text-[10px] font-semibold text-white">{kg} kg</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${c}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.0, delay: 1.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between"
        >
          <span className="font-data text-sm font-bold gradient-text">138 kg total</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            View AI tips <ArrowRight size={9} />
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── feature visuals ───────────────────────────────────────────────────────────

function MiniLogUI() {
  const rows = [
    { label: 'Car km / month', val: 12, max: 100, c: 'from-blue-500 to-cyan-500' },
    { label: 'Electricity kWh', val: 45, max: 100, c: 'from-orange-500 to-amber-500' },
  ]
  const diets = ['Vegan', 'Veg', 'Mixed', 'Meat']
  return (
    <div className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: '#0c1410' }}>
      <p className="text-[10px] font-data text-zinc-600 uppercase tracking-widest mb-4">Today's quick log</p>
      {rows.map(({ label, val, max, c }, i) => (
        <div key={label} className="mb-3.5">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-zinc-500">{label}</span>
            <span className="font-data text-xs text-zinc-300">{val}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${c}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${(val / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
      <div className="mt-4 pt-3 border-t border-white/5">
        <p className="text-[10px] text-zinc-600 mb-2">Diet</p>
        <div className="flex gap-2">
          {diets.map((d, i) => (
            <span key={d} className={`text-[10px] px-2.5 py-1 rounded-lg border ${i === 1 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.06] text-zinc-700'}`}>
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
        <span className="text-xs text-zinc-600">Live total</span>
        <span className="font-data text-sm font-bold gradient-text">24.8 kg CO₂</span>
      </div>
    </div>
  )
}

function ComparisonBars() {
  const bars = [
    { label: 'You', kg: 138, pct: 37, c: 'from-teal-500 to-emerald-400', glow: true },
    { label: 'India average', kg: 125, pct: 33, c: 'from-emerald-600 to-green-500', glow: false },
    { label: 'Global average', kg: 375, pct: 100, c: 'from-rose-600 to-orange-500', glow: false },
  ]
  return (
    <div className="space-y-6">
      {bars.map(({ label, kg, pct, c, glow }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-medium ${glow ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
            <span className={`font-data text-sm font-bold ${glow ? 'gradient-text' : 'text-zinc-600'}`}>{kg} kg/mo</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${c}`}
              style={glow ? { boxShadow: '0 0 10px rgba(16,185,129,0.4)' } : {}}
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
  { n: '01', Icon: UtensilsCrossed, c: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Answer four questions', desc: 'Transport, energy, diet, purchases — pre-filled with India averages. Only update what differs. Five minutes.' },
  { n: '02', Icon: TrendingDown,    c: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/20',    title: 'See your exact score',   desc: 'Calculated instantly using CEA India 2023 grid data and IPCC factors. Your number, not an estimate.' },
  { n: '03', Icon: Zap,             c: 'text-lime-400',    bg: 'bg-lime-500/10 border-lime-500/20',    title: 'Get ranked actions',     desc: 'Claude AI ranks six specific cuts by kg saved, personalised to your data — not generic advice.' },
] as const

export default function Landing() {
  const { profile } = useApp()
  const hasProfile = Boolean(profile)
  const { scrollY } = useScroll()
  const ringY = useTransform(scrollY, [0, 700], [0, -60])
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => scrollY.on('change', (v) => setScrolled(v > 60)), [scrollY])

  const ctaProps = hasProfile
    ? { to: '/dashboard', label: 'Go to your dashboard', Icon: LayoutDashboard }
    : { to: '/onboarding', label: 'Measure your footprint', Icon: ArrowRight }

  return (
    <div className="min-h-screen bg-[#080c0a] text-white overflow-x-hidden">
      <ScrollProgress />

      {/* ── nav ── */}
      <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'bg-[#080c0a]/92 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <div className="w-full px-6 lg:px-16 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Leaf size={13} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight">CarbonLens</span>
          </div>
          {hasProfile ? (
            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-colors focus-ring">
              <LayoutDashboard size={13} /> Dashboard
            </Link>
          ) : (
            <Link to="/onboarding" className="flex items-center gap-1.5 text-sm font-semibold text-[#080c0a] bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 px-4 py-2 rounded-xl transition-all focus-ring glow-emerald">
              Get started <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </header>

      {/* ── hero ── */}
      <section className="relative min-h-[calc(100vh-56px)] flex items-center overflow-hidden">
        {/* grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.022]"
          style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        {/* blooms */}
        <div className="absolute top-[-80px] right-0 w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" style={{ animation: 'pulse-glow 6s ease-in-out infinite' }} />
        <div className="absolute bottom-[-60px] left-[-80px] w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" style={{ animation: 'pulse-glow 8s ease-in-out infinite reverse' }} />

        <div className="relative w-full px-6 lg:px-16 py-20 flex flex-col md:flex-row gap-12 lg:gap-20 items-center justify-between">
          {/* text */}
          <div className="max-w-2xl">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-7">
              <Leaf size={10} /> Built for India · Powered by Claude AI
            </motion.p>

            <div className="font-display text-[60px] md:text-[76px] lg:text-[88px] font-extrabold leading-[1.0] tracking-tight mb-6">
              {'Carbon is invisible'.split(' ').map((word, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block mr-[0.22em]">
                  {word}
                </motion.span>
              ))}
              <br />
              {'until you measure it.'.split(' ').map((word, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block mr-[0.22em] gradient-text">
                  {word}
                </motion.span>
              ))}
            </div>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9 }}
              className="text-lg text-zinc-400 leading-relaxed mb-9 max-w-lg">
              CarbonLens calculates your monthly CO₂ across transport, energy, food, and purchases
              — using real India grid data and IPCC factors — then gives you a ranked AI plan to cut it.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0 }}
              className="flex items-center gap-4">
              <Link to={ctaProps.to}
                className="inline-flex items-center gap-2 font-semibold text-[#080c0a] bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 transition-all px-7 py-3.5 rounded-2xl focus-ring shadow-[0_0_32px_rgba(16,185,129,0.3)]">
                <ctaProps.Icon size={16} /> {ctaProps.label}
              </Link>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="text-xs text-zinc-700 mt-4">
              {hasProfile ? `Welcome back, ${profile!.name}` : 'Free · No account required · 5 minutes'}
            </motion.p>
          </div>

          {/* right — app preview */}
          <motion.div style={{ y: ringY }} className="hidden lg:flex justify-end shrink-0">
            <AppPreviewCard />
          </motion.div>
        </div>
      </section>

      {/* ── ticker ── */}
      <Ticker />

      {/* ── stats ── */}
      <section className="border-b border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="w-full px-6 lg:px-16 py-14 grid grid-cols-3 divide-x divide-white/[0.04]">
          {([
            { to: 125, suffix: ' kg', label: 'India avg CO₂ per person per month', grad: 'from-emerald-400 to-emerald-300' },
            { to: 375, suffix: ' kg', label: 'Global avg CO₂ per person per month', grad: 'from-teal-400 to-teal-300' },
            { to: 36,  suffix: 'B+',  label: 'Tonnes of CO₂ emitted globally every year', grad: 'from-lime-400 to-lime-300' },
          ] as const).map(({ to, suffix, label, grad }, i) => (
            <FadeUp key={label} delay={i * 0.1} className="text-center px-8">
              <p className={`font-data font-bold text-5xl md:text-6xl bg-gradient-to-r ${grad} bg-clip-text text-transparent mb-2`}>
                <Num to={to} suffix={suffix} />
              </p>
              <p className="text-xs text-zinc-600 leading-snug max-w-[12ch] mx-auto">{label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── how it works ── */}
      <section className="w-full px-6 lg:px-16 py-24">
        <FadeUp>
          <p className="text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-3">Process</p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold mb-16">
            From unknown to <span className="gradient-text">actionable</span>.
          </h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map(({ n, Icon, title, desc, c, bg }, i) => (
            <FadeUp key={n} delay={i * 0.12}>
              <div className="h-full rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border mb-5 ${bg}`}>
                  <Icon size={18} className={c} />
                </div>
                <div className={`font-data text-xs font-semibold mb-2.5 ${c}`}>{n}</div>
                <h3 className="font-display font-semibold text-white mb-2 leading-snug">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── feature 1: daily log ── */}
      <section className="border-t border-white/[0.04] w-full px-6 lg:px-16 py-24">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <SlideIn from="left">
            <p className="text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-4">Daily tracking</p>
            <h2 className="font-display text-4xl font-bold mb-5 leading-tight">
              Log your day<br />in 30 seconds.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-7">
              The quick-log sheet pre-fills from your last entry. Adjust only what changed — a slider for km driven,
              a tap for diet, a number for orders. Most days: under a minute.
            </p>
            <ul className="space-y-3">
              {['Pre-fills from your previous log', 'Sliders for fast numeric input', 'Live CO₂ total updates as you adjust'].map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
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
      <section className="border-t border-white/[0.04] w-full px-6 lg:px-16 py-24">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <SlideIn from="left">
            <ComparisonBars />
          </SlideIn>
          <SlideIn from="right" delay={0.1}>
            <p className="text-xs font-semibold text-teal-400 tracking-widest uppercase mb-4">Benchmarking</p>
            <h2 className="font-display text-4xl font-bold mb-5 leading-tight">
              See where you stand<br />against India.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-7">
              Your score is compared against real Indian demographics — not global averages that don't apply here.
              India's grid, roads, and food systems are different. Your benchmark should be too.
            </p>
            <ul className="space-y-3">
              {['CEA India 2023 grid emission factor', 'MoEFCC per-capita baseline', 'Live grid intensity via Electricity Maps API'].map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <CheckCircle2 size={15} className="text-teal-500 shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
          </SlideIn>
        </div>
      </section>

      {/* ── feature 3: AI tips ── */}
      <section className="border-t border-white/[0.04] w-full px-6 lg:px-16 py-24">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <SlideIn from="left">
            <p className="text-xs font-semibold text-lime-400 tracking-widest uppercase mb-4">AI-powered plan</p>
            <h2 className="font-display text-4xl font-bold mb-5 leading-tight">
              Six cuts, ranked<br />by kg saved.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-7">
              Claude AI reads your exact footprint breakdown and returns six specific actions — ordered by CO₂ impact,
              calibrated to your categories. Commit to one and track it over time.
            </p>
            <ul className="space-y-3">
              {['Ranked by kg CO₂ saved per month', 'Specific to your biggest categories', 'Difficulty-rated from Easy to Hard'].map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <CheckCircle2 size={15} className="text-lime-500 shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
          </SlideIn>
          <SlideIn from="right" delay={0.1}>
            <div className="space-y-3">
              {AI_TIPS.map((tip, i) => (
                <FadeUp key={tip.title} delay={i * 0.1}>
                  <div className="rounded-2xl p-4 border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-white leading-snug">{tip.title}</p>
                      <span className="shrink-0 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{tip.diff}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">{tip.cat}</span>
                      <span className="font-data text-xs font-semibold text-emerald-400">~{tip.kg} kg CO₂/mo</span>
                    </div>
                  </div>
                </FadeUp>
              ))}
              <FadeUp delay={0.35}>
                <p className="text-xs text-zinc-700 text-center pt-1">Generated by Claude AI · personalised to your footprint</p>
              </FadeUp>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* ── india context band ── */}
      <section className="relative overflow-hidden border-y border-emerald-500/10 py-20"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(8,12,10,1) 60%)' }}>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative w-full px-6 lg:px-16">
          <FadeUp className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={16} className="text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">Built for India</p>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold max-w-2xl leading-tight">
              Calibrated to India's grid, roads, and markets.
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {([
              { Icon: Car,       label: '0.716 kg CO₂/kWh', sub: 'India grid factor (CEA 2023)', c: 'text-emerald-400' },
              { Icon: Globe,     label: '3× below global',    sub: 'India avg vs world avg per capita', c: 'text-teal-400' },
              { Icon: TrendingDown, label: '30% cut possible', sub: 'Achievable with 3 behaviour changes', c: 'text-lime-400' },
            ] as const).map(({ Icon, label, sub, c }, i) => (
              <FadeUp key={label} delay={i * 0.1}>
                <div className="rounded-2xl p-5 border border-white/[0.05] bg-white/[0.02]">
                  <Icon size={18} className={`${c} mb-3`} />
                  <p className={`font-data font-bold text-xl ${c} mb-1`}>{label}</p>
                  <p className="text-xs text-zinc-600">{sub}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── final CTA ── */}
      <section className="w-full px-6 lg:px-16 py-28">
        <FadeUp>
          <div className="rounded-3xl p-12 md:p-20 text-center relative overflow-hidden border border-emerald-500/15"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(45,212,191,0.04) 50%, transparent 100%)' }}>
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/12 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="font-display text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                Five minutes.<br />
                <span className="gradient-text">Real numbers.</span>
              </h2>
              <p className="text-zinc-500 mb-10 max-w-xs mx-auto text-sm leading-relaxed">
                No account. No email. Your data stays in your browser. India-specific from day one.
              </p>
              <Link to={ctaProps.to}
                className="inline-flex items-center gap-2 font-semibold text-[#080c0a] bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 transition-all px-10 py-4 rounded-2xl focus-ring shadow-[0_0_40px_rgba(16,185,129,0.4)] text-base">
                <ctaProps.Icon size={18} /> {ctaProps.label}
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── footer ── */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="w-full px-6 lg:px-16 text-center space-y-1.5">
          <p className="text-xs text-zinc-800">Emission factors: CEA India 2023 · IPCC AR6 · DEFRA 2023 · Poore &amp; Nemecek 2018</p>
          <p className="text-xs text-zinc-800">India avg: 125 kg CO₂/mo (MoEFCC) · Global: 375 kg CO₂/mo (IEA 2022)</p>
          <p className="text-xs text-zinc-900 pt-1">Disclaimer: Calculations are estimates for informational purposes only. Not a substitute for professional carbon accounting.</p>
        </div>
      </footer>
    </div>
  )
}
