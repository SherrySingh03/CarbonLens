import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'

const Progress = lazy(() => import('./pages/Progress'))

export default function App() {
  const { profile } = useApp()

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/*"
        element={
          profile ? (
            <Layout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="insights" element={<Insights />} />
                <Route
                  path="progress"
                  element={
                    <Suspense fallback={<div className="p-6 text-gray-500 text-sm">Loading…</div>}>
                      <Progress />
                    </Suspense>
                  }
                />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/onboarding" replace />
          )
        }
      />
    </Routes>
  )
}
