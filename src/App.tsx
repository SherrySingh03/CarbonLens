import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'

const Progress = lazy(() => import('./pages/Progress'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useApp()
  return profile ? <>{children}</> : <Navigate to="/onboarding" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Landing always shown; returning users see a dashboard link */}
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected app routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <Layout><Insights /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<div className="p-6 text-sm text-muted">Loading…</div>}>
                <Progress />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
