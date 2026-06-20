import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Lightbulb, TrendingUp, PenLine } from 'lucide-react'
import { useApp } from '../context/AppContext'
import QuickLogSheet from './QuickLogSheet'
import type { FootprintLog } from '../types'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/insights',  label: 'Actions',   Icon: Lightbulb },
  { to: '/progress',  label: 'Progress',  Icon: TrendingUp },
] as const

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

function calcStreak(logs: FootprintLog[]): number {
  const dates = new Set(logs.map((l) => l.date))
  let count = 0
  const d = new Date()
  while (dates.has(d.toISOString().slice(0, 10))) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

export default function Layout({ children }: { children: ReactNode }) {
  const { logSheetOpen, setLogSheetOpen, todayLog, allLogs } = useApp()

  const prefill =
    todayLog ??
    [...allLogs].sort((a, b) => b.date.localeCompare(a.date))[0] ??
    null

  const streak = calcStreak(allLogs)

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cl-base)' }}>

      {/* Ambient floating blobs — fixed, full-viewport */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{
          position: 'absolute', top: '-10%', left: '8%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.87 0.185 150 / 0.14), transparent 68%)',
          filter: 'blur(40px)',
          animation: 'cl-drift 18s ease-in-out infinite, cl-pulse 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '38%', right: '-6%',
          width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.83 0.105 205 / 0.12), transparent 68%)',
          filter: 'blur(44px)',
          animation: 'cl-drift2 22s ease-in-out infinite, cl-pulse 11s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-8%', left: '40%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.84 0.16 152 / 0.10), transparent 70%)',
          filter: 'blur(46px)',
          animation: 'cl-drift 26s ease-in-out infinite',
        }} />
      </div>

      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 py-6 px-4 gap-1 shrink-0 sticky top-0 h-screen z-10"
        style={{
          background: 'oklch(0.15 0.014 168 / 0.90)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid oklch(0.5 0.02 170 / 0.1)',
        }}
        aria-label="Main navigation"
      >
        <NavLink to="/" className="flex items-center gap-2.5 px-3 mb-7 focus-ring rounded-xl" style={{ textDecoration: 'none' }}>
          <RingLogo size={24} />
          <span className="font-display font-semibold text-sm tracking-tight" style={{ color: 'var(--cl-text)', letterSpacing: '-0.02em' }}>
            CarbonLens
          </span>
        </NavLink>

        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus-ring ${
                isActive ? '' : ''
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'oklch(0.87 0.185 150 / 0.12)', color: 'oklch(0.87 0.185 150)', border: '1px solid oklch(0.87 0.185 150 / 0.22)' }
              : { color: 'var(--cl-text-muted)', border: '1px solid transparent' }
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.75} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        <div className="mt-auto flex flex-col gap-3">
          {streak > 0 && (
            <div style={{
              borderRadius: 12, padding: '12px 14px',
              background: 'linear-gradient(150deg, oklch(0.83 0.105 205 / 0.12), oklch(0.235 0.018 172))',
              border: '1px solid oklch(0.5 0.02 170 / 0.14)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--cl-text-muted)', marginBottom: 3 }}>{streak}-day streak</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--cl-text)' }}>Keep logging 🌱</div>
            </div>
          )}
          <button
            onClick={() => setLogSheetOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold focus-ring transition-all hover:brightness-110"
            style={{
              background: 'oklch(0.87 0.185 150)',
              color: 'oklch(0.15 0.014 168)',
              boxShadow: '0 6px 20px oklch(0.87 0.185 150 / 0.30)',
            }}
            aria-label="Log today's footprint"
          >
            <PenLine size={15} /> Log today
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-24 md:pb-0 relative z-10" id="main-content">
        <header
          className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3"
          style={{
            background: 'oklch(0.15 0.014 168 / 0.90)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid oklch(0.5 0.02 170 / 0.1)',
          }}
        >
          <div className="flex items-center gap-2">
            <RingLogo size={20} />
            <span className="font-display font-semibold text-sm" style={{ color: 'var(--cl-text)', letterSpacing: '-0.02em' }}>CarbonLens</span>
          </div>
          <button
            onClick={() => setLogSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl focus-ring"
            style={{
              background: 'oklch(0.87 0.185 150)',
              color: 'oklch(0.15 0.014 168)',
              boxShadow: '0 4px 12px oklch(0.87 0.185 150 / 0.28)',
            }}
            aria-label="Log today's footprint"
          >
            <PenLine size={12} /> Log
          </button>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 flex items-center justify-around px-2 py-2 z-20"
        style={{
          background: 'oklch(0.15 0.014 168 / 0.94)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid oklch(0.5 0.02 170 / 0.1)',
        }}
        aria-label="Main navigation"
      >
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors focus-ring"
            style={({ isActive }) => ({ color: isActive ? 'oklch(0.87 0.185 150)' : 'var(--cl-text-subtle)' })}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {logSheetOpen && <QuickLogSheet prefill={prefill} onClose={() => setLogSheetOpen(false)} />}
    </div>
  )
}
