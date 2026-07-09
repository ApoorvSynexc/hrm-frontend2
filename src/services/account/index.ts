import { useQuery } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks/useHttpClient'
import type { Profile } from './types'

export type { Profile, Role, RolePermission, PermissionSummary, Department, Designation } from './types'

export const accountKeys = {
  all: ['account'] as const,
  myProfile: () => [...accountKeys.all, 'my-profile'] as const,
}

export function useAccount() {
  const http = useHttpClient()

  const myProfile = useQuery({
    queryKey: accountKeys.myProfile(),
    queryFn: async () => {
      const res = await http.get<Profile>('/v1/account/my-profile')
      return res.data
    },
    retry: false,
  })

  return { myProfile }
}
