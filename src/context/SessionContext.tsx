import { createContext, type ReactNode } from 'react'
import { useAccount, type Profile } from '../services/account'
import { SplashScreen } from '../components'

export type SessionContextValue = {
  user: Profile | null
  isAuthenticated: boolean
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { myProfile } = useAccount()
  const { data: user, isLoading, isError } = myProfile

  // Block the whole app on the initial session check — no route (protected
  // or public) should render until we know whether my-profile succeeds.
  if (isLoading) return <SplashScreen />

  const value: SessionContextValue = {
    user: user ?? null,
    isAuthenticated: Boolean(user) && !isError,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
