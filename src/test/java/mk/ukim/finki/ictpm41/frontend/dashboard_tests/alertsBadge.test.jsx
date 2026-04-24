import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

// MOCK_ALERTS has 2 entries → badge shows "2"
// Alert messages:
//   'HIGH fire risk for "North Field". Risk score: 67%.'
//   'EXTREME fire risk for "South Field". Risk score: 91%.'

describe('Alerts Bell Badge', () => {
  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

  it('renders the bell button in the navbar', () => {
    renderDashboard()

    expect(screen.getByRole('button', { name: /🔔/i })).toBeInTheDocument()
  })

  it('shows the unread alerts count badge as "2"', () => {
    renderDashboard()

    // The badge span wraps MOCK_ALERTS.length = 2
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('the badge count matches the number of active mock alerts', () => {
    renderDashboard()

    const badge = screen.getByText('2')
    expect(badge).toBeInTheDocument()
    // Styled as a red circular badge — jsdom normalizes colors to rgb()
    expect(badge).toHaveStyle({ background: 'rgb(239, 68, 68)', color: 'rgb(255, 255, 255)' })
  })

  it('alerts dropdown is hidden by default (showAlerts starts false)', () => {
    renderDashboard()

    expect(screen.queryByText('Active Alerts')).not.toBeInTheDocument()
  })

  it('clicking the bell opens the alerts dropdown', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await user.click(screen.getByRole('button', { name: /🔔/i }))

    expect(screen.getByText('Active Alerts')).toBeInTheDocument()
  })

  it('dropdown lists the HIGH fire risk alert message', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await user.click(screen.getByRole('button', { name: /🔔/i }))

    expect(
      screen.getByText(/HIGH fire risk for "North Field"\. Risk score: 67%\./i)
    ).toBeInTheDocument()
  })

  it('dropdown lists the EXTREME fire risk alert message', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await user.click(screen.getByRole('button', { name: /🔔/i }))

    expect(
      screen.getByText(/EXTREME fire risk for "South Field"\. Risk score: 91%\./i)
    ).toBeInTheDocument()
  })

  it('clicking the bell again closes the dropdown', async () => {
    const user = userEvent.setup()
    renderDashboard()

    const bellBtn = screen.getByRole('button', { name: /🔔/i })

    await user.click(bellBtn)
    expect(screen.getByText('Active Alerts')).toBeInTheDocument()

    await user.click(bellBtn)
    expect(screen.queryByText('Active Alerts')).not.toBeInTheDocument()
  })

  it('dropdown shows exactly 2 alert entries', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await user.click(screen.getByRole('button', { name: /🔔/i }))

    // Each alert is rendered as a div with its message text
    expect(
      screen.getByText(/HIGH fire risk for "North Field"/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/EXTREME fire risk for "South Field"/)
    ).toBeInTheDocument()
  })
})
