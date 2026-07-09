import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}
