import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '@frontend/pages/DashboardPage'

vi.mock('recharts', () => ({
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  Cell: () => null,
  LabelList: () => null,
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => vi.fn() }
})

// MOCK_FIRE = { riskScore: 0.67, riskLevel: 'HIGH' }
// pct = Math.round(0.67 * 100) = 67
// Colors: LOW=#10b981, MEDIUM=#eab308, HIGH=#f97316, EXTREME=#ef4444

describe('Fire Risk Gauge', () => {
  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

  it('displays the "Fire Risk Index" section heading', () => {
    renderDashboard()

    expect(screen.getByText('Fire Risk Index')).toBeInTheDocument()
  })

  it('shows the correct risk score as a percentage (67%)', () => {
    renderDashboard()

    // MOCK_FIRE.riskScore = 0.67 → Math.round(67) → displayed as "67%"
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('renders all four risk level labels', () => {
    renderDashboard()

    expect(screen.getByText('LOW')).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('EXTREME')).toBeInTheDocument()
  })

  it('highlights the HIGH label as the active risk level (white text on orange)', () => {
    renderDashboard()

    const highLabel = screen.getByText('HIGH')
    // Active label gets white text (#ffffff) and orange background (#f97316)
    expect(highLabel).toHaveStyle({ color: '#ffffff', background: '#f97316' })
  })

  it('does not highlight the LOW label', () => {
    renderDashboard()

    const lowLabel = screen.getByText('LOW')
    // Inactive labels get grey text (#64748b) and light background (#f1f5f9)
    expect(lowLabel).toHaveStyle({ color: '#64748b', background: '#f1f5f9' })
  })

  it('does not highlight the MEDIUM label', () => {
    renderDashboard()

    const mediumLabel = screen.getByText('MEDIUM')
    expect(mediumLabel).toHaveStyle({ color: '#64748b', background: '#f1f5f9' })
  })

  it('does not highlight the EXTREME label', () => {
    renderDashboard()

    const extremeLabel = screen.getByText('EXTREME')
    expect(extremeLabel).toHaveStyle({ color: '#64748b', background: '#f1f5f9' })
  })

  it('renders the SVG gauge element', () => {
    const { container } = renderDashboard()

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders the gauge percentage inside a styled element', () => {
    renderDashboard()

    const pctEl = screen.getByText('67%')
    // Should be rendered as a large bold number
    expect(pctEl).toBeInTheDocument()
    expect(pctEl.tagName).not.toBe('svg')
  })
})
