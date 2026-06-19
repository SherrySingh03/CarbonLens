import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Lightbulb, TrendingUp, PenLine, Leaf } from 'lucide-react'
import { useApp } from '../context/AppContext'
import QuickLogSheet from './QuickLogSheet'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/insights',  label: 'Insights',  Icon: Lightbulb },
  { to: '/progress',  label: 'Progress',  Icon: TrendingUp },
] as const

export default function Layout({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { todayLog, allLogs } = useApp()

  const prefill =
    todayLog ??
    [...allLogs].sort((a, b) => b.date.localeCompare(a.date))[0] ??
    null

  return (
    <div className="min-h-screen flex bg-[#080c0a]">
      {/* desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 border-r border-white/5 py-6 px-4 gap-1 shrink-0 sticky top-0 h-screen"
        style={{ background: 'rgba(8,12,10,0.95)', backdropFilter: 'blur(16px)' }}
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2 px-3 mb-7">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Leaf size={13} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-white">CarbonLens</span>
        </div>

        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus-ring ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-600 hover:text-zinc-200 hover:bg-white/5'
              }`
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

        <button
          onClick={() => setSheetOpen(true)}
          className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#080c0a] bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 transition-all focus-ring shadow-[0_0_20px_rgba(16,185,129,0.25)]"
          aria-label="Log today's footprint"
        >
          <PenLine size={15} /> Log today
        </button>
      </nav>

      {/* main */}
      <main className="flex-1 pb-24 md:pb-0" id="main-content">
        <header className="md:hidden sticky top-0 z-10 border-b border-white/5 px-4 py-3 flex items-center justify-between"
          style={{ background: 'rgba(8,12,10,0.95)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Leaf size={11} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm text-white">CarbonLens</span>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[#080c0a] bg-gradient-to-r from-emerald-400 to-teal-400 text-xs font-semibold rounded-xl focus-ring"
            aria-label="Log today's footprint"
          >
            <PenLine size={12} /> Log
          </button>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 border-t border-white/5 flex items-center justify-around px-2 py-2 z-10"
        style={{ background: 'rgba(8,12,10,0.96)', backdropFilter: 'blur(12px)' }}
        aria-label="Main navigation"
      >
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors focus-ring ${
                isActive ? 'text-emerald-400' : 'text-zinc-700'
              }`
            }
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

      {sheetOpen && <QuickLogSheet prefill={prefill} onClose={() => setSheetOpen(false)} />}
    </div>
  )
}
