import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/context/AppContext', () => ({
  useApp: vi.fn(),
}))

import { OnboardingRoute } from '../src/App'
import { useApp } from '../src/context/AppContext'

const mockUseApp = vi.mocked(useApp)

function LocationDisplay() {
  const loc = useLocation()
  return <div data-testid="location">{loc.pathname}</div>
}

describe('OnboardingRoute', () => {
  it('redirects to /dashboard when a profile exists', () => {
    mockUseApp.mockReturnValue({
      profile: { name: 'Alice', createdAt: '2026-01-01', monthlyGoalReductionPct: 10 },
    } as ReturnType<typeof useApp>)

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingRoute><div>Onboarding</div></OnboardingRoute>} />
          <Route path="/dashboard" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('location').textContent).toBe('/dashboard')
  })

  it('renders children when no profile exists', () => {
    mockUseApp.mockReturnValue({ profile: null } as ReturnType<typeof useApp>)

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingRoute><div>Onboarding</div></OnboardingRoute>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Onboarding')).toBeInTheDocument()
  })
})
