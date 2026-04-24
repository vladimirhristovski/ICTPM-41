import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AlertsPage from '@frontend/pages/AlertsPage'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => vi.fn() }
})

// INITIAL_ALERTS from AlertsPage (all start with read: false):
//  id=1  High Fire Risk     HIGH     North Field  Today, 14:30
//  id=2  Extreme Fire Risk  EXTREME  South Field  Today, 13:10
//  id=3  Rain Forecast Update INFO   East Field   Today, 11:00

describe('AlertsPage', () => {
  const renderAlerts = () =>
    render(
      <MemoryRouter>
        <AlertsPage />
      </MemoryRouter>
    )

  // ─── Initial load ────────────────────────────────────────────────────────────

  describe('initial load', () => {
    it('renders the Alerts Center heading', () => {
      renderAlerts()

      expect(screen.getByRole('heading', { name: 'Alerts Center' })).toBeInTheDocument()
    })

    it('renders all 3 alert titles', () => {
      renderAlerts()

      expect(screen.getByText('High Fire Risk')).toBeInTheDocument()
      expect(screen.getByText('Extreme Fire Risk')).toBeInTheDocument()
      expect(screen.getByText('Rain Forecast Update')).toBeInTheDocument()
    })

    it('shows correct severity badges for all alerts', () => {
      renderAlerts()

      expect(screen.getByText('HIGH')).toBeInTheDocument()
      expect(screen.getByText('EXTREME')).toBeInTheDocument()
      expect(screen.getByText('INFO')).toBeInTheDocument()
    })

    it('shows all 3 alerts as unread initially', () => {
      renderAlerts()

      expect(screen.getAllByText('Unread')).toHaveLength(3)
      expect(screen.queryByText('Read')).not.toBeInTheDocument()
    })

    it('shows a "Mark as read" button for each of the 3 alerts', () => {
      renderAlerts()

      expect(screen.getAllByRole('button', { name: 'Mark as read' })).toHaveLength(3)
    })

    it('shows the correct field name for each alert', () => {
      renderAlerts()

      expect(screen.getByText('North Field')).toBeInTheDocument()
      expect(screen.getByText('South Field')).toBeInTheDocument()
      expect(screen.getByText('East Field')).toBeInTheDocument()
    })

    it('shows the description text for each alert', () => {
      renderAlerts()

      expect(screen.getByText(/Elevated fire risk detected/i)).toBeInTheDocument()
      expect(screen.getByText(/Critical alert triggered/i)).toBeInTheDocument()
      expect(screen.getByText(/Moderate rainfall expected/i)).toBeInTheDocument()
    })

    it('shows the timestamp for each alert', () => {
      renderAlerts()

      expect(screen.getByText('Today, 14:30')).toBeInTheDocument()
      expect(screen.getByText('Today, 13:10')).toBeInTheDocument()
      expect(screen.getByText('Today, 11:00')).toBeInTheDocument()
    })

    it('renders 3 alert list items', () => {
      renderAlerts()

      expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })
  })

  // ─── Mark single alert as read ───────────────────────────────────────────────

  describe('mark single alert as read', () => {
    it('changes the button label to "Already read" after clicking', async () => {
      const user = userEvent.setup()
      renderAlerts()

      const [firstBtn] = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(firstBtn)

      expect(screen.getByRole('button', { name: 'Already read' })).toBeInTheDocument()
    })

    it('disables the button after the alert is marked as read', async () => {
      const user = userEvent.setup()
      renderAlerts()

      const [firstBtn] = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(firstBtn)

      expect(screen.getByRole('button', { name: 'Already read' })).toBeDisabled()
    })

    it('updates the read badge from "Unread" to "Read" for the marked alert', async () => {
      const user = userEvent.setup()
      renderAlerts()

      const [firstBtn] = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(firstBtn)

      expect(screen.getByText('Read')).toBeInTheDocument()
    })

    it('leaves the other two alerts still unread', async () => {
      const user = userEvent.setup()
      renderAlerts()

      const [firstBtn] = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(firstBtn)

      // One "Read" badge, two "Unread" badges remain
      expect(screen.getAllByText('Unread')).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: 'Mark as read' })).toHaveLength(2)
    })

    it('can independently mark the second alert (Extreme Fire Risk)', async () => {
      const user = userEvent.setup()
      renderAlerts()

      const buttons = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(buttons[1])  // second alert

      expect(screen.getByText('Read')).toBeInTheDocument()
      expect(screen.getAllByText('Unread')).toHaveLength(2)
    })

    it('can independently mark the third alert (Rain Forecast Update)', async () => {
      const user = userEvent.setup()
      renderAlerts()

      const buttons = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(buttons[2])  // third alert

      expect(screen.getByText('Read')).toBeInTheDocument()
      expect(screen.getAllByText('Unread')).toHaveLength(2)
    })
  })

  // ─── Mark all alerts as read ─────────────────────────────────────────────────

  describe('mark all alerts as read', () => {
    const markAll = async (user) => {
      // Re-query after each click because the list shrinks
      let btns = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(btns[0])

      btns = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(btns[0])

      btns = screen.getAllByRole('button', { name: 'Mark as read' })
      await user.click(btns[0])
    }

    it('shows 3 "Already read" buttons after marking all alerts', async () => {
      const user = userEvent.setup()
      renderAlerts()

      await markAll(user)

      expect(screen.getAllByRole('button', { name: 'Already read' })).toHaveLength(3)
    })

    it('shows 3 "Read" badges and zero "Unread" badges after marking all', async () => {
      const user = userEvent.setup()
      renderAlerts()

      await markAll(user)

      expect(screen.getAllByText('Read')).toHaveLength(3)
      expect(screen.queryAllByText('Unread')).toHaveLength(0)
    })

    it('disables all buttons after marking all as read', async () => {
      const user = userEvent.setup()
      renderAlerts()

      await markAll(user)

      const allBtns = screen.getAllByRole('button', { name: 'Already read' })
      allBtns.forEach((btn) => expect(btn).toBeDisabled())
    })

    it('no "Mark as read" buttons remain after all are marked', async () => {
      const user = userEvent.setup()
      renderAlerts()

      await markAll(user)

      expect(screen.queryAllByRole('button', { name: 'Mark as read' })).toHaveLength(0)
    })
  })
})
