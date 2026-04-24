import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('@frontend/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '@frontend/services/api'
import authService from '@frontend/services/authService'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login()', () => {
    it('saves JWT token to localStorage on successful login', async () => {
      api.post.mockResolvedValueOnce({
        data: { token: 'test-jwt-token', username: 'testuser', role: 'USER' },
      })

      await authService.login('testuser', 'password123')

      expect(localStorage.getItem('token')).toBe('test-jwt-token')
    })

    it('saves user info to localStorage on successful login', async () => {
      api.post.mockResolvedValueOnce({
        data: { token: 'jwt', username: 'alice', role: 'ADMIN' },
      })

      await authService.login('alice', 'secret')

      const stored = JSON.parse(localStorage.getItem('user'))
      expect(stored).toEqual({ username: 'alice', role: 'ADMIN' })
    })

    it('calls the login endpoint with correct credentials', async () => {
      api.post.mockResolvedValueOnce({
        data: { token: 'jwt', username: 'testuser', role: 'USER' },
      })

      await authService.login('testuser', 'mypassword')

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'mypassword',
      })
    })

    it('throws error and does not store token on failed login', async () => {
      api.post.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(authService.login('bad', 'creds')).rejects.toThrow()

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('logout()', () => {
    it('removes token from localStorage', () => {
      localStorage.setItem('token', 'some-token')

      authService.logout()

      expect(localStorage.getItem('token')).toBeNull()
    })

    it('removes user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify({ username: 'u', role: 'USER' }))

      authService.logout()

      expect(localStorage.getItem('user')).toBeNull()
    })

    it('redirects to /login after logout', () => {
      authService.logout()

      expect(window.location.href).toBe('/login')
    })
  })

  describe('isLoggedIn()', () => {
    it('returns true when token is present in localStorage', () => {
      localStorage.setItem('token', 'some-jwt-token')

      expect(authService.isLoggedIn()).toBe(true)
    })

    it('returns false when no token in localStorage', () => {
      expect(authService.isLoggedIn()).toBe(false)
    })
  })

  describe('getUser()', () => {
    it('returns parsed user object when stored', () => {
      localStorage.setItem('user', JSON.stringify({ username: 'alice', role: 'USER' }))

      expect(authService.getUser()).toEqual({ username: 'alice', role: 'USER' })
    })

    it('returns null when no user is stored', () => {
      expect(authService.getUser()).toBeNull()
    })
  })
})
