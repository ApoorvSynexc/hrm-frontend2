import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  CreateRoleInput,
  Role,
  RoleListMeta,
  RoleListParams,
  UpdateRoleInput,
} from './types'

export type {
  Role,
  RoleStatus,
  CreateRoleInput,
  UpdateRoleInput,
  RoleListMeta,
  RoleListParams,
} from './types'

export const roleKeys = {
  all: ['config', 'role'] as const,
  list: (params: RoleListParams) => [...roleKeys.all, 'list', params] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
}

type UseRoleOptions = {
  /** Provide to activate the paginated `getRoles` list query. */
  listParams?: RoleListParams
  /** Provide to activate the single-record `getRole` query. */
  roleId?: string
}

export function useRole({ listParams, roleId }: UseRoleOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: roleKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useRole() calls can share one cache entry, and React Query may run any
  // observer's queryFn on refetch — so it must never depend on this call
  // having received listParams.
  const params = listParams ?? { page: 1, limit: 10 }

  const getRoles = useQuery({
    queryKey: roleKeys.list(params),
    queryFn: async () => {
      const res = await http.get<Role[]>(
        `/v1/config/role/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { roles: res.data, meta: res.meta as RoleListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getRole = useQuery({
    queryKey: roleKeys.detail(roleId ?? ''),
    queryFn: async () => {
      const res = await http.get<Role>(`/v1/config/role?id=${roleId}`)
      return res.data
    },
    enabled: Boolean(roleId),
  })

  const createRole = useMutation({
    mutationFn: async (input: CreateRoleInput) => {
      const res = await http.post<Role>('/v1/config/role', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateRole = useMutation({
    mutationFn: async (input: UpdateRoleInput) => {
      const res = await http.put<Role>('/v1/config/role', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<Role>(`/v1/config/role?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return { getRoles, getRole, createRole, updateRole, deleteRole }
}
