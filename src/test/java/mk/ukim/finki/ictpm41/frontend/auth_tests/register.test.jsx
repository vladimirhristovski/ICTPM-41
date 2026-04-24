import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from '@frontend/pages/RegisterPage'
import authService from '@frontend/services/authService'

vi.mock('@frontend/services/authService')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderRegister = () =>
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

  const fillForm = async (user, username, email, password, confirm) => {
    await user.type(screen.getByPlaceholderText('Username'), username)
    await user.type(screen.getByPlaceholderText('Email'), email)
    await user.type(screen.getByPlaceholderText('Password'), password)
    await user.type(screen.getByPlaceholderText('Confirm password'), confirm)
  }

  it('renders all registration form fields', () => {
    renderRegister()

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('calls authService.register and navigates to /login on valid data', async () => {
    const user = userEvent.setup()
    authService.register.mockResolvedValueOnce({ message: 'User registered successfully' })

    renderRegister()
    await fillForm(user, 'newuser', 'new@example.com', 'password123', 'password123')
    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith(
        'newuser',
        'new@example.com',
        'password123'
      )
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('shows server error when username or email is already taken', async () => {
    const user = userEvent.setup()
    authService.register.mockRejectedValueOnce({
      response: { data: { message: 'Username already exists' } },
    })

    renderRegister()
    await fillForm(user, 'existinguser', 'taken@example.com', 'password123', 'password123')
    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows server error when email is already registered', async () => {
    const user = userEvent.setup()
    authService.register.mockRejectedValueOnce({
      response: { data: { message: 'Email already in use' } },
    })

    renderRegister()
    await fillForm(user, 'uniqueuser', 'duplicate@example.com', 'password123', 'password123')
    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows generic error message when registration fails without specific message', async () => {
    const user = userEvent.setup()
    authService.register.mockRejectedValueOnce(new Error('Network Error'))

    renderRegister()
    await fillForm(user, 'user', 'user@example.com', 'pass123', 'pass123')
    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Registration failed. Please try again.')
      ).toBeInTheDocument()
    })
  })

  it('shows password mismatch error and does not call the API', async () => {
    const user = userEvent.setup()

    renderRegister()
    await fillForm(user, 'user', 'user@example.com', 'password123', 'different456')
    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    })

    expect(authService.register).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
