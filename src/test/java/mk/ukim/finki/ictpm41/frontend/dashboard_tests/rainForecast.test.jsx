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

// MOCK_RAIN from DashboardPage (index 0-6: MON-SUN)
// [0] MON: mm=2.5, prob=30%, temp=20°, icon=🌤️
// [1] TUE: mm=8.1, prob=72%, temp=21°, icon=🌧️  ← default selected (selectedDay=1)
// [2] WED: mm=0.0, prob=5%,  temp=18°, icon=☀️
// [3] THU: mm=14.3,prob=85%, temp=20°, icon=⛈️
// [4] FRI: mm=3.2, prob=40%, temp=22°, icon=🌦️
// [5] SAT: mm=0.5, prob=12%, temp=24°, icon=🌤️
// [6] SUN: mm=6.7, prob=60%, temp=23°, icon=🌧️

describe('Rain Forecast Calendar', () => {
  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

  it('displays the "Rain Forecast" section heading', () => {
    renderDashboard()

    expect(screen.getByText('Rain Forecast')).toBeInTheDocument()
  })

  it('renders all 7 day labels in the forecast grid', () => {
    renderDashboard()

    for (const day of ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']) {
      expect(screen.getAllByText(day).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('renders all distinct weather icons across the 7 days', () => {
    renderDashboard()

    // 🌤️ appears for MON and SAT, 🌧️ for TUE and SUN
    expect(screen.getAllByText('🌤️').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('🌧️').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('☀️')).toBeInTheDocument()
    expect(screen.getByText('⛈️')).toBeInTheDocument()
    expect(screen.getByText('🌦️')).toBeInTheDocument()
  })

  it('displays rain probability percentages for all 7 days', () => {
    renderDashboard()

    expect(screen.getByText('30%')).toBeInTheDocument()  // MON
    expect(screen.getByText('5%')).toBeInTheDocument()   // WED
    expect(screen.getByText('85%')).toBeInTheDocument()  // THU
    expect(screen.getByText('40%')).toBeInTheDocument()  // FRI
    expect(screen.getByText('12%')).toBeInTheDocument()  // SAT
    expect(screen.getByText('60%')).toBeInTheDocument()  // SUN
    // TUE (72%) appears in both the card and the selected-day detail panel
    expect(screen.getAllByText('72%').length).toBeGreaterThanOrEqual(1)
  })

  it('displays temperatures for all 7 day cards', () => {
    renderDashboard()

    // Calendar cards show "{temp}°" (without C), detail panel shows "{temp}°C"
    expect(screen.getAllByText('20°').length).toBeGreaterThanOrEqual(2) // MON + THU both 20°
    expect(screen.getAllByText('21°').length).toBeGreaterThanOrEqual(1) // TUE
    expect(screen.getByText('18°')).toBeInTheDocument()                 // WED
    expect(screen.getByText('22°')).toBeInTheDocument()                 // FRI
    expect(screen.getByText('24°')).toBeInTheDocument()                 // SAT
    expect(screen.getByText('23°')).toBeInTheDocument()                 // SUN
  })

  it('detail panel shows TUE data by default (selectedDay starts at index 1)', () => {
    renderDashboard()

    // TUE: mm=8.1, temp=21°C, prob=72%
    expect(screen.getByText('8.1 mm')).toBeInTheDocument()
    expect(screen.getByText(/21°C/)).toBeInTheDocument()
    // 72% appears in both the TUE grid card and the detail panel
    expect(screen.getAllByText(/72%/).length).toBeGreaterThanOrEqual(2)
  })

  it('clicking a different day card updates the detail panel', async () => {
    const user = userEvent.setup()
    renderDashboard()

    // Default shows TUE (8.1 mm)
    expect(screen.getByText('8.1 mm')).toBeInTheDocument()

    // Click the WED card (WED is unique in the grid at this point since detail shows TUE)
    const wedCards = screen.getAllByText('WED')
    await user.click(wedCards[0])

    // After click: detail panel should show WED data (mm=0.0 renders as "0 mm")
    expect(screen.getByText('0 mm')).toBeInTheDocument()
  })

  it('clicking MON updates the detail panel to MON precipitation', async () => {
    const user = userEvent.setup()
    renderDashboard()

    const monCards = screen.getAllByText('MON')
    await user.click(monCards[0])

    // MON: mm=2.5
    expect(screen.getByText('2.5 mm')).toBeInTheDocument()
  })
})
