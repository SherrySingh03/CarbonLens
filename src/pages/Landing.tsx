import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, CalendarDays, Sparkles, Leaf } from 'lucide-react'

// ~36.8 billion tonnes CO₂/year globally (IEA 2023)
const TONNES_PER_MS = 36_800_000_000 / (365.25 * 24 * 3600 * 1000)

function useLiveCO2(): number {
  const [tonnes, setTonnes] = useState(() => {
    const now = Date.now()
    const midnight = new Date()
    midnight.setUTCHours(0, 0, 0, 0)
    return Math.floor((now - midnight.getTime()) * TONNES_PER_MS)
  })

  useEffect(() => {
    const id = setInterval(
      () => setTonnes((t) => t + Math.round(TONNES_PER_MS * 250)),
      250
    )
    return () => clearInterval(id)
  }, [])

  return tonnes
}

function LiveCounter() {
  const tonnes = useLiveCO2()
  return (
    <div className="card p-6 text-center max-w-xs mx-auto">
      <p className="text-xs font-medium text-muted uppercase tracking-widest mb-3">
        CO₂ added globally today
      </p>
      <p
        className="font-data text-4xl font-medium text-[#1A2E1A] tabular-nums leading-none"
        aria-live="polite"
        aria-label={`${tonnes.toLocaleString()} tonnes of CO₂ added globally today`}
      >
        {tonnes.toLocaleString()}
      </p>
      <p className="text-sm text-muted mt-2">tonnes and counting</p>
      <div className="mt-3 pt-3 border-t border-[#D4E4CC]">
        <p className="text-xs text-muted">
          Source: IEA 2023 · ~36.8B tonnes/year
        </p>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    Icon: BarChart3,
    title: 'Understand',
    desc: 'See your monthly CO₂ score at a glance — colour-coded against India and global averages.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    Icon: CalendarDays,
    title: 'Track',
    desc: 'Log daily, watch your 12-week heatmap fill in, and spot trends in your 30-day chart.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    Icon: Sparkles,
    title: 'Reduce',
    desc: 'Get six AI-powered tips ranked by kg saved — personalised to your actual footprint data.',
    color: 'bg-amber-50 text-amber-700',
  },
]

const STEPS = [
  { n: '01', title: 'Answer a short quiz', desc: 'Four questions on transport, energy, diet, and purchases. Takes about five minutes.' },
  { n: '02', title: 'See your score',       desc: 'Your CO₂ is calculated instantly using CEA India 2023 and IPCC emission factors.' },
  { n: '03', title: 'Get AI tips',          desc: 'Claude analyses your data and suggests specific, ranked actions you can commit to.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-[#D4E4CC]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-[#1A2E1A]">CarbonLens</span>
          </div>
          <Link
            to="/onboarding"
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors px-4 py-2 rounded-xl focus-ring"
          >
            Get started <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1 mb-5">
              <Leaf size={11} /> Built for India · Powered by Claude AI
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-extrabold text-[#1A2E1A] leading-[1.05] tracking-tight">
              Know exactly<br />
              <span className="text-green-600">where your</span><br />
              carbon comes from.
            </h1>
            <p className="text-[#6B7E6B] text-lg mt-5 leading-relaxed max-w-sm">
              CarbonLens measures your monthly footprint, shows you where it comes from,
              and gives you AI-powered steps to cut it.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <Link
                to="/onboarding"
                className="flex items-center gap-2 font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors px-6 py-3 rounded-2xl shadow-sm focus-ring"
              >
                Calculate your footprint <ArrowRight size={16} />
              </Link>
            </div>
            <p className="text-xs text-muted mt-4">Free · No account required · 5 minutes</p>
          </div>

          {/* Live counter */}
          <div className="flex flex-col gap-4 items-center animate-fade-in">
            <LiveCounter />
            <div className="flex gap-6 text-center">
              {[
                { label: 'India avg', value: '125 kg', sub: 'per month' },
                { label: 'Global avg', value: '375 kg', sub: 'per month' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="card p-4 flex-1">
                  <p className="font-data text-2xl font-semibold text-[#1A2E1A]">{value}</p>
                  <p className="text-xs font-medium text-green-700 mt-0.5">{label}</p>
                  <p className="text-[11px] text-muted">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white/60 border-y border-[#D4E4CC] py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-[#1A2E1A] text-center mb-10">
              Three things CarbonLens does well
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {FEATURES.map(({ Icon, title, desc, color }) => (
                <div key={title} className="card p-6">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-[#1A2E1A] mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="font-display text-2xl font-bold text-[#1A2E1A] mb-10 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="flex gap-4">
                <div className="shrink-0 font-data text-xs font-semibold text-green-600 bg-green-50 border border-green-100 w-8 h-8 rounded-xl flex items-center justify-center">
                  {n}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[#1A2E1A] mb-1">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="card-raised p-10 text-center bg-gradient-to-b from-green-50 to-white">
            <h2 className="font-display text-3xl font-bold text-[#1A2E1A] mb-3">
              Start your audit. It takes 5 minutes.
            </h2>
            <p className="text-muted mb-7 max-w-md mx-auto">
              No account. No email. Your data stays in your browser.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors px-8 py-3.5 rounded-2xl shadow-sm focus-ring"
            >
              Calculate your footprint <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D4E4CC] py-6 text-center">
        <p className="text-xs text-muted">
          Emission factors: CEA India 2023 · IPCC · DEFRA 2023 · Poore &amp; Nemecek (2018)
        </p>
        <p className="text-xs text-muted mt-1">
          India average: 125 kg CO₂/month (MoEFCC) · Global: 375 kg CO₂/month (IEA 2022)
        </p>
      </footer>
    </div>
  )
}
