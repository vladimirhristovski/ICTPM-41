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

// Weather Summary Card (CR-001): the selected-day detail panel below the 7-day grid.
// Default selected day is TUE (index 1):
//   mm=8.1, temp=21, probability=72, icon=🌧️

describe('Weather Summary Card (CR-001)', () => {
  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

  it('displays the "Weather Overview" page heading', () => {
    renderDashboard()

    expect(screen.getByText('Weather Overview')).toBeInTheDocument()
  })

  it('displays the page subtitle for field management context', () => {
    renderDashboard()

    expect(
      screen.getByText(/Monitoring environmental conditions for optimal field management/i)
    ).toBeInTheDocument()
  })

  it('shows the selected day label in the summary card (TUE by default)', () => {
    renderDashboard()

    // Detail panel shows day name; TUE also appears in the grid card
    expect(screen.getAllByText(/TUE/).length).toBeGreaterThanOrEqual(2)
  })

  it('shows the selected day precipitation in mm (8.1 mm for TUE)', () => {
    renderDashboard()

    expect(screen.getByText('8.1 mm')).toBeInTheDocument()
  })

  it('shows the selected day temperature in °C (21°C for TUE)', () => {
    renderDashboard()

    // Detail panel: "<b> 21°C</b>" — regex matches regardless of leading whitespace
    expect(screen.getByText(/21°C/)).toBeInTheDocument()
  })

  it('shows the selected day rain probability (72% for TUE)', () => {
    renderDashboard()

    // 72% appears in both the TUE grid card and the detail panel
    expect(screen.getAllByText(/72%/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows the selected day icon in the summary area (🌧️ for TUE)', () => {
    renderDashboard()

    // 🌧️ appears in TUE's grid card and also in the detail panel
    expect(screen.getAllByText('🌧️').length).toBeGreaterThanOrEqual(2)
  })

  it('updates the summary card precipitation when a different day is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()

    // Default: TUE selected, shows 8.1 mm
    expect(screen.getByText('8.1 mm')).toBeInTheDocument()

    // Click THU (index 3, mm=14.3)
    const thuCards = screen.getAllByText('THU')
    await user.click(thuCards[0])

    expect(screen.getByText('14.3 mm')).toBeInTheDocument()
  })

  it('updates the summary card temperature when a different day is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()

    // Click SAT (index 5, temp=24°C)
    const satCards = screen.getAllByText('SAT')
    await user.click(satCards[0])

    expect(screen.getByText(/24°C/)).toBeInTheDocument()
  })

  it('updates the summary card probability when a different day is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()

    // Click FRI (index 4, probability=40%)
    const friCards = screen.getAllByText('FRI')
    await user.click(friCards[0])

    // 40% now appears in both FRI card and detail panel
    expect(screen.getAllByText(/40%/).length).toBeGreaterThanOrEqual(1)
  })
})
