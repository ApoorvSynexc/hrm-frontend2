import { createContext, type ReactNode } from 'react'
import { useAccount, type Profile } from '../services/account'

export type SessionContextValue = {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { myProfile } = useAccount()
  const { data: user, isLoading, isError } = myProfile

  const value: SessionContextValue = {
    user: user ?? null,
    isAuthenticated: Boolean(user) && !isError,
    isLoading,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
