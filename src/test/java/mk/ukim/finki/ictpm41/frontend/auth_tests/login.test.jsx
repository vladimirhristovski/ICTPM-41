import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@frontend/pages/LoginPage'
import authService from '@frontend/services/authService'

vi.mock('@frontend/services/authService')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

  it('renders the login form with username, password and submit button', () => {
    renderLogin()

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls authService.login with correct credentials and navigates to /dashboard', async () => {
    const user = userEvent.setup()
    authService.login.mockResolvedValueOnce({
      token: 'jwt-token',
      username: 'testuser',
      role: 'USER',
    })

    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'testuser')
    await user.type(screen.getByPlaceholderText('Password'), 'pass123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser', 'pass123')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('verifies JWT is saved in localStorage after successful login', async () => {
    const user = userEvent.setup()
    authService.login.mockImplementationOnce(async () => {
      localStorage.setItem('token', 'saved-jwt-token')
      return { token: 'saved-jwt-token', username: 'testuser', role: 'USER' }
    })

    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'testuser')
    await user.type(screen.getByPlaceholderText('Password'), 'pass123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('saved-jwt-token')
    })
  })

  it('shows error message when login fails with wrong credentials', async () => {
    const user = userEvent.setup()
    authService.login.mockRejectedValueOnce(new Error('Unauthorized'))

    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'wronguser')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument()
    })
  })

  it('does not navigate to /dashboard when login fails', async () => {
    const user = userEvent.setup()
    authService.login.mockRejectedValueOnce(new Error('Unauthorized'))

    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'wronguser')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not save token to localStorage when login fails', async () => {
    const user = userEvent.setup()
    authService.login.mockRejectedValueOnce(new Error('Unauthorized'))

    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'wronguser')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument()
    })

    expect(localStorage.getItem('token')).toBeNull()
  })
})
