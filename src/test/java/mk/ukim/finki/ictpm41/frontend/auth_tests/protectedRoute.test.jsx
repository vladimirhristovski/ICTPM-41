import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@frontend/utils/ProtectedRoute'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const renderWithRouter = (initialPath = '/dashboard') =>
    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

  it('redirects unauthenticated user from /dashboard to /login', () => {
    renderWithRouter('/dashboard')

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument()
  })

  it('renders protected content when user is authenticated with a valid token', () => {
    localStorage.setItem('token', 'valid-jwt-token')

    renderWithRouter('/dashboard')

    expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('redirects to /login when token is missing even if user object is present', () => {
    localStorage.setItem('user', JSON.stringify({ username: 'alice', role: 'USER' }))

    renderWithRouter('/dashboard')

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument()
  })

  it('redirects to /login after token is removed (simulates logout effect)', () => {
    localStorage.setItem('token', 'valid-jwt-token')

    const { rerender } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument()

    localStorage.removeItem('token')

    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
