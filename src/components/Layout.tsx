import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import QuickLogSheet from './QuickLogSheet'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/insights', label: 'Insights', icon: '💡' },
  { to: '/progress', label: 'Progress', icon: '📈' },
] as const

export default function Layout({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { todayLog, allLogs } = useApp()

  const prefill =
    todayLog ??
    [...allLogs].sort((a, b) => b.date.localeCompare(a.date))[0] ??
    null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-20 bg-white border-r border-gray-100 py-6 items-center gap-6 shrink-0"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-green-600 rounded p-1 ${
                isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <span className="text-2xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => setSheetOpen(true)}
          className="mt-auto bg-green-600 text-white rounded-xl px-3 py-2 text-xs font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
          aria-label="Log today's footprint"
        >
          + Log
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-24 md:pb-0" id="main-content">
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-10"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors px-3 py-1 focus-visible:ring-2 focus-visible:ring-green-600 rounded ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex flex-col items-center gap-0.5 text-xs font-medium text-green-600 focus-visible:ring-2 focus-visible:ring-green-600 rounded px-3 py-1"
          aria-label="Log today's footprint"
        >
          <span className="text-xl">✏️</span>
          Log
        </button>
      </nav>

      {sheetOpen && <QuickLogSheet prefill={prefill} onClose={() => setSheetOpen(false)} />}
    </div>
  )
}
