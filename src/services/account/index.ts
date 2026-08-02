import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks/useHttpClient'
import type { Profile, UpdateAccountInput } from './types'

export type { Profile, Contact, MobileNumber, Gender, UpdateAccountInput } from './types'

export const accountKeys = {
  all: ['account'] as const,
  myProfile: () => [...accountKeys.all, 'my-profile'] as const,
}

export function useAccount() {
  const http = useHttpClient()
  const queryClient = useQueryClient()

  const myProfile = useQuery({
    queryKey: accountKeys.myProfile(),
    queryFn: async () => {
      const res = await http.get<Profile>('/v1/account/my-profile')
      return res.data
    },
    retry: false,
  })

  // Invalidating accountKeys.all refetches myProfile, which SessionContext
  // reads directly — so a successful save updates the Navbar/sidebar/etc.
  // everywhere `useSession()` is used, not just this page.
  const updateAccount = useMutation({
    mutationFn: async (input: UpdateAccountInput) => {
      const res = await http.put<Profile>('/v1/account/my-profile', input)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.all }),
  })

  return { myProfile, updateAccount }
}
