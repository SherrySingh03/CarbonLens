import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Lightbulb, TrendingUp, PenLine } from 'lucide-react'
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
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 bg-white/80 backdrop-blur-sm border-r border-[#D4E4CC] py-6 px-4 gap-1 shrink-0 sticky top-0 h-screen"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 mb-6">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">CL</span>
          </div>
          <span className="font-display font-bold text-[#1A2E1A]">CarbonLens</span>
        </div>

        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus-ring ${
                isActive
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'text-zinc-500 hover:text-[#1A2E1A] hover:bg-leaf-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setSheetOpen(true)}
          className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors focus-ring"
          aria-label="Log today's footprint"
        >
          <PenLine size={16} />
          Log today
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-24 md:pb-0" id="main-content">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[#D4E4CC] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">CL</span>
            </div>
            <span className="font-display font-bold text-sm text-[#1A2E1A]">CarbonLens</span>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-xl focus-ring"
            aria-label="Log today's footprint"
          >
            <PenLine size={13} />
            Log
          </button>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm border-t border-[#D4E4CC] flex items-center justify-around px-2 py-2 z-10"
        aria-label="Main navigation"
      >
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors focus-ring ${
                isActive ? 'text-green-700' : 'text-zinc-400'
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
