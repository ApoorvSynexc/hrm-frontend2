import { useQuery } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks/useHttpClient'
import type { Profile } from './types'

export type { Profile } from './types'

export const accountKeys = {
  all: ['account'] as const,
  myProfile: () => [...accountKeys.all, 'my-profile'] as const,
}

export function useAccount() {
  const http = useHttpClient()

  const myProfile = useQuery({
    queryKey: accountKeys.myProfile(),
    queryFn: () => http.get<Profile>('/v1/account/my-profile'),
    retry: false,
  })

  return { myProfile }
}
