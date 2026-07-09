import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useHttpClient } from '../../hooks'
import { accountKeys } from '../account'
import type { AuthResponse, LoginCredentials } from './types'

export type { User, LoginCredentials, AuthResponse } from './types'

export function useAuth() {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      http.post<AuthResponse>('/v1/auth/login', credentials),
    // Session auth: the backend sets an httpOnly cookie on login, so there's
    // nothing for the frontend to store. Just refetch my-profile — this time
    // the cookie is present and it succeeds with the real user. Awaiting it
    // here means Login's own onSuccess (which navigates to "/home") only
    // fires once SessionContext is actually authenticated, avoiding a
    // ProtectedRoute bounce back to "/login".
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountKeys.myProfile() })
    },
  })

  const logout = useMutation({
    mutationFn: () => http.post<void>('/v1/auth/logout'),
    onSuccess: () => {
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })

  return { login, logout }
}
