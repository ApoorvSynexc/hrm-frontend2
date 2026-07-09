import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks'

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useSession()

  if (isAuthenticated) return <Navigate to="/home" replace />

  return children
}
