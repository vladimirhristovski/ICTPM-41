import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import FieldsPage from '@frontend/pages/FieldsPage'
import {
  getFields,
  createField,
  updateField,
  deleteField,
  importCSV,
  exportCSV,
} from '@frontend/services/fieldService'

vi.mock('@frontend/services/fieldService')

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => vi.fn() }
})

// Default fields matching fieldService DEFAULT_FIELDS:
//  id=1  North Field   Skopje Region  Wheat      Crops   HIGH     72%  42ha  38%  22km/h
//  id=2  South Field   Veles Region   Corn       Crops   EXTREME  25%  58ha  22%  31km/h
//  id=3  East Field    Shtip Region   Sunflower  Mixed   MEDIUM   48%  35ha  51%  14km/h

const FIELD_NORTH = {
  id: 1,
  name: 'North Field',
  location: 'Skopje Region',
  crop: 'Wheat',
  vegetationType: 'Crops',
  status: 'Monitored',
  fireRisk: 'HIGH',
  rainChance: '72%',
  areaHa: 42,
  soilMoisture: 38,
  windKmh: 22,
  lastReading: '12 min ago',
  notes: 'Vegetation moisture below seasonal average.',
}

const FIELD_SOUTH = {
  id: 2,
  name: 'South Field',
  location: 'Veles Region',
  crop: 'Corn',
  vegetationType: 'Crops',
  status: 'Stable',
  fireRisk: 'EXTREME',
  rainChance: '25%',
  areaHa: 58,
  soilMoisture: 22,
  windKmh: 31,
  lastReading: '8 min ago',
  notes: 'Dry spell extended.',
}

const FIELD_EAST = {
  id: 3,
  name: 'East Field',
  location: 'Shtip Region',
  crop: 'Sunflower',
  vegetationType: 'Mixed',
  status: 'Monitored',
  fireRisk: 'MEDIUM',
  rainChance: '48%',
  areaHa: 35,
  soilMoisture: 51,
  windKmh: 14,
  lastReading: '18 min ago',
  notes: 'Conditions within normal range.',
}

const DEFAULT_FIELDS = [FIELD_NORTH, FIELD_SOUTH, FIELD_EAST]

describe('FieldsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    getFields.mockResolvedValue([...DEFAULT_FIELDS])
    createField.mockResolvedValue({})
    updateField.mockResolvedValue({})
    deleteField.mockResolvedValue()
    importCSV.mockResolvedValue({ message: 'Imported' })
    exportCSV.mockImplementation(() => {})
  })

  const renderFields = () =>
    render(
      <MemoryRouter>
        <FieldsPage />
      </MemoryRouter>
    )

  // ─── Initial load ────────────────────────────────────────────────────────────

  describe('initial load', () => {
    it('renders the Fields Overview heading', async () => {
      renderFields()

      expect(await screen.findByRole('heading', { name: 'Fields Overview' })).toBeInTheDocument()
    })

    it('renders all 3 default field cards', async () => {
      renderFields()

      await waitFor(() => {
        expect(screen.getByText('North Field')).toBeInTheDocument()
        expect(screen.getByText('South Field')).toBeInTheDocument()
        expect(screen.getByText('East Field')).toBeInTheDocument()
      })
    })

    it('renders all 4 vegetation type filter buttons', async () => {
      renderFields()

      await screen.findByText('North Field')

      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Crops' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Mixed' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Forest' })).toBeInTheDocument()
    })

    it('shows an Edit and a Delete button for each field card', async () => {
      renderFields()

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(3)
        expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(3)
      })
    })

    it('shows the Add Field and Export CSV action buttons', async () => {
      renderFields()

      await screen.findByText('North Field')

      expect(screen.getByRole('button', { name: /add field/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    })
  })

  // ─── Add new field ────────────────────────────────────────────────────────────

  describe('add new field', () => {
    it('opens the Add New Field modal when Add Field is clicked', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: /add field/i }))

      expect(screen.getByRole('heading', { name: /add new field/i })).toBeInTheDocument()
    })

    it('calls createField with the entered name and location on submit', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: /add field/i }))
      await user.type(screen.getByPlaceholderText('Field Name *'), 'West Field')
      await user.type(screen.getByPlaceholderText('Location *'), 'Bitola Region')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(createField).toHaveBeenCalledTimes(1)
        const arg = createField.mock.calls[0][0]
        expect(arg.name).toBe('West Field')
        expect(arg.location).toBe('Bitola Region')
      })
    })

    it('closes the modal after the new field is saved', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: /add field/i }))
      await user.type(screen.getByPlaceholderText('Field Name *'), 'West Field')
      await user.type(screen.getByPlaceholderText('Location *'), 'Bitola Region')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /add new field/i })).not.toBeInTheDocument()
      })
    })

    it('new field card appears in the list after saving', async () => {
      const user = userEvent.setup()
      const NEW_FIELD = {
        id: 4, name: 'West Field', location: 'Bitola Region', crop: 'Barley',
        vegetationType: 'Crops', status: 'Monitored', fireRisk: 'LOW',
        rainChance: '60%', areaHa: 20, soilMoisture: 65, windKmh: 10,
        lastReading: 'Just now', notes: '',
      }
      getFields
        .mockResolvedValueOnce([...DEFAULT_FIELDS])
        .mockResolvedValueOnce([...DEFAULT_FIELDS, NEW_FIELD])

      renderFields()

      await user.click(await screen.findByRole('button', { name: /add field/i }))
      await user.type(screen.getByPlaceholderText('Field Name *'), 'West Field')
      await user.type(screen.getByPlaceholderText('Location *'), 'Bitola Region')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('West Field')).toBeInTheDocument()
      })
    })

    it('does not call createField and closes the modal when Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: /add field/i }))
      await user.type(screen.getByPlaceholderText('Field Name *'), 'Draft Field')
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(screen.queryByRole('heading', { name: /add new field/i })).not.toBeInTheDocument()
      expect(createField).not.toHaveBeenCalled()
    })
  })

  // ─── Edit field ───────────────────────────────────────────────────────────────

  describe('edit field', () => {
    it('opens the Edit Field modal pre-filled with the field data', async () => {
      const user = userEvent.setup()
      renderFields()

      const [firstEditBtn] = await screen.findAllByRole('button', { name: /edit/i })
      await user.click(firstEditBtn)

      expect(screen.getByRole('heading', { name: /edit field/i })).toBeInTheDocument()
      expect(screen.getByDisplayValue('North Field')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Skopje Region')).toBeInTheDocument()
    })

    it('calls updateField with the correct id and modified data on save', async () => {
      const user = userEvent.setup()
      renderFields()

      const [firstEditBtn] = await screen.findAllByRole('button', { name: /edit/i })
      await user.click(firstEditBtn)

      const nameInput = screen.getByDisplayValue('North Field')
      await user.clear(nameInput)
      await user.type(nameInput, 'North Field Updated')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(updateField).toHaveBeenCalledWith(
          FIELD_NORTH.id,
          expect.objectContaining({ name: 'North Field Updated' })
        )
      })
    })

    it('closes the modal after the edit is saved', async () => {
      const user = userEvent.setup()
      renderFields()

      const [firstEditBtn] = await screen.findAllByRole('button', { name: /edit/i })
      await user.click(firstEditBtn)
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /edit field/i })).not.toBeInTheDocument()
      })
    })

    it('updated field name appears in the list after saving', async () => {
      const user = userEvent.setup()
      const updatedNorth = { ...FIELD_NORTH, name: 'North Field Updated' }
      getFields
        .mockResolvedValueOnce([...DEFAULT_FIELDS])
        .mockResolvedValueOnce([updatedNorth, FIELD_SOUTH, FIELD_EAST])

      renderFields()

      const [firstEditBtn] = await screen.findAllByRole('button', { name: /edit/i })
      await user.click(firstEditBtn)

      const nameInput = screen.getByDisplayValue('North Field')
      await user.clear(nameInput)
      await user.type(nameInput, 'North Field Updated')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('North Field Updated')).toBeInTheDocument()
      })
    })
  })

  // ─── Delete field ─────────────────────────────────────────────────────────────

  describe('delete field', () => {
    it('shows a confirmation dialog before deleting', async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      renderFields()

      const [firstDeleteBtn] = await screen.findAllByRole('button', { name: /delete/i })
      await user.click(firstDeleteBtn)

      expect(confirmSpy).toHaveBeenCalled()
    })

    it('calls deleteField with the correct id when the user confirms', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      renderFields()

      const [firstDeleteBtn] = await screen.findAllByRole('button', { name: /delete/i })
      await user.click(firstDeleteBtn)

      await waitFor(() => {
        expect(deleteField).toHaveBeenCalledWith(FIELD_NORTH.id)
      })
    })

    it('does not call deleteField when the user cancels the confirmation', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      renderFields()

      const [firstDeleteBtn] = await screen.findAllByRole('button', { name: /delete/i })
      await user.click(firstDeleteBtn)

      expect(deleteField).not.toHaveBeenCalled()
    })

    it('deleted field disappears from the list', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      getFields
        .mockResolvedValueOnce([...DEFAULT_FIELDS])
        .mockResolvedValueOnce([FIELD_SOUTH, FIELD_EAST])

      renderFields()

      const [firstDeleteBtn] = await screen.findAllByRole('button', { name: /delete/i })
      await user.click(firstDeleteBtn)

      await waitFor(() => {
        expect(screen.queryByText('North Field')).not.toBeInTheDocument()
      })
    })

    it('remaining fields are still visible after one deletion', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      getFields
        .mockResolvedValueOnce([...DEFAULT_FIELDS])
        .mockResolvedValueOnce([FIELD_SOUTH, FIELD_EAST])

      renderFields()

      const [firstDeleteBtn] = await screen.findAllByRole('button', { name: /delete/i })
      await user.click(firstDeleteBtn)

      await waitFor(() => {
        expect(screen.getByText('South Field')).toBeInTheDocument()
        expect(screen.getByText('East Field')).toBeInTheDocument()
      })
    })
  })

  // ─── Vegetation type filter (CR-002) ─────────────────────────────────────────

  describe('vegetation type filter (CR-002)', () => {
    // North: Crops, South: Crops, East: Mixed — no Forest in default data

    it('shows all 3 fields when the "All" filter is active', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: 'All' }))

      expect(screen.getByText('North Field')).toBeInTheDocument()
      expect(screen.getByText('South Field')).toBeInTheDocument()
      expect(screen.getByText('East Field')).toBeInTheDocument()
    })

    it('shows only Crops fields when "Crops" filter is selected', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: 'Crops' }))

      expect(screen.getByText('North Field')).toBeInTheDocument()
      expect(screen.getByText('South Field')).toBeInTheDocument()
      expect(screen.queryByText('East Field')).not.toBeInTheDocument()
    })

    it('shows only Mixed fields when "Mixed" filter is selected', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: 'Mixed' }))

      expect(screen.queryByText('North Field')).not.toBeInTheDocument()
      expect(screen.queryByText('South Field')).not.toBeInTheDocument()
      expect(screen.getByText('East Field')).toBeInTheDocument()
    })

    it('shows the empty-state message when "Forest" filter is selected', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: 'Forest' }))

      expect(screen.getByText(/No fields match the selected vegetation type/i)).toBeInTheDocument()
    })

    it('shows the "X of N fields" count hint when a non-All filter is active', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: 'Crops' }))

      expect(screen.getByText(/2 of 3 fields/i)).toBeInTheDocument()
    })

    it('hides the count hint when switching back to "All"', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: 'Crops' }))
      await user.click(screen.getByRole('button', { name: 'All' }))

      expect(screen.queryByText(/of 3 fields/i)).not.toBeInTheDocument()
    })
  })

  // ─── Fire risk badge color (CR-003) ──────────────────────────────────────────

  describe('fire risk badge color (CR-003)', () => {
    it('EXTREME badge has red background (#ef4444)', async () => {
      renderFields()

      const badge = await screen.findByText('EXTREME')

      expect(badge).toHaveStyle({ background: '#ef4444' })
    })

    it('HIGH badge has orange background (#f97316)', async () => {
      renderFields()

      const badge = await screen.findByText('HIGH')

      expect(badge).toHaveStyle({ background: '#f97316' })
    })

    it('MEDIUM badge has yellow background (#eab308)', async () => {
      renderFields()

      const badge = await screen.findByText('MEDIUM')

      expect(badge).toHaveStyle({ background: '#eab308' })
    })

    it('LOW badge has green background (#10b981)', async () => {
      const LOW_FIELD = {
        id: 4, name: 'West Field', location: 'Bitola Region', crop: 'Barley',
        vegetationType: 'Crops', status: 'Monitored', fireRisk: 'LOW',
        rainChance: '90%', areaHa: 20, soilMoisture: 70, windKmh: 8,
        lastReading: 'Just now', notes: '',
      }
      getFields.mockResolvedValueOnce([LOW_FIELD])

      renderFields()

      const badge = await screen.findByText('LOW')

      expect(badge).toHaveStyle({ background: '#10b981' })
    })

    it('all visible fire risk badges have white text', async () => {
      renderFields()

      await waitFor(() => {
        ['EXTREME', 'HIGH', 'MEDIUM'].forEach((level) => {
          expect(screen.getByText(level)).toHaveStyle({ color: '#ffffff' })
        })
      })
    })
  })

  // ─── CSV import ───────────────────────────────────────────────────────────────

  describe('CSV import', () => {
    it('calls importCSV with the uploaded CSV file', async () => {
      const user = userEvent.setup()
      const { container } = renderFields()
      await screen.findByText('North Field')

      const csvFile = new File(
        ['name,location\n"West Field","Bitola Region"'],
        'fields.csv',
        { type: 'text/csv' }
      )
      const fileInput = container.querySelector('input[type="file"]')
      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(importCSV).toHaveBeenCalledWith(csvFile)
      })
    })

    it('reloads the field list and shows imported fields after upload', async () => {
      const user = userEvent.setup()
      const IMPORTED_FIELD = {
        id: 4, name: 'Imported Field', location: 'Ohrid Region', crop: 'Rye',
        vegetationType: 'Forest', status: 'Monitored', fireRisk: 'LOW',
        rainChance: '55%', areaHa: 30, soilMoisture: 60, windKmh: 12,
        lastReading: 'Just now', notes: '',
      }
      getFields
        .mockResolvedValueOnce([...DEFAULT_FIELDS])
        .mockResolvedValueOnce([...DEFAULT_FIELDS, IMPORTED_FIELD])

      const { container } = renderFields()
      await screen.findByText('North Field')

      const csvFile = new File(['name,location'], 'fields.csv', { type: 'text/csv' })
      const fileInput = container.querySelector('input[type="file"]')
      await user.upload(fileInput, csvFile)

      await waitFor(() => {
        expect(screen.getByText('Imported Field')).toBeInTheDocument()
      })
    })

    it('does not call importCSV when a non-CSV file is uploaded', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'alert').mockImplementation(() => {})
      const { container } = renderFields()
      await screen.findByText('North Field')

      const txtFile = new File(['some content'], 'data.txt', { type: 'text/plain' })
      const fileInput = container.querySelector('input[type="file"]')
      await user.upload(fileInput, txtFile)

      expect(importCSV).not.toHaveBeenCalled()
    })
  })

  // ─── CSV export ───────────────────────────────────────────────────────────────

  describe('CSV export', () => {
    it('calls exportCSV when the Export CSV button is clicked', async () => {
      const user = userEvent.setup()
      renderFields()

      await user.click(await screen.findByRole('button', { name: /export csv/i }))

      expect(exportCSV).toHaveBeenCalledTimes(1)
    })

    it('does not call exportCSV before the button is clicked', async () => {
      renderFields()

      await screen.findByText('North Field')

      expect(exportCSV).not.toHaveBeenCalled()
    })

    it('triggers a separate export call for each button click', async () => {
      const user = userEvent.setup()
      renderFields()

      const exportBtn = await screen.findByRole('button', { name: /export csv/i })
      await user.click(exportBtn)
      await user.click(exportBtn)

      expect(exportCSV).toHaveBeenCalledTimes(2)
    })
  })
})
