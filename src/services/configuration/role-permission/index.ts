import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type { Permission, RolePermissionEntry, UpdateRolePermissionsInput } from './types'

export type { Permission, RolePermissionEntry, UpdateRolePermissionsInput } from './types'

export const rolePermissionKeys = {
  all: ['config', 'role-permission'] as const,
  permissions: () => [...rolePermissionKeys.all, 'permissions'] as const,
  byRole: (roleId: string) => [...rolePermissionKeys.all, 'by-role', roleId] as const,
}

type UseRolePermissionOptions = {
  /** Provide once a role is selected to activate `getRolePermissions`. */
  roleId?: string
}

export function useRolePermission({ roleId }: UseRolePermissionOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()

  // Neither GET here supports pagination — the backend always returns the
  // full set, so no page/limit params.
  const getPermissions = useQuery({
    queryKey: rolePermissionKeys.permissions(),
    queryFn: async () => {
      const res = await http.get<Permission[]>('/v1/config/role-permission/permission/list')
      return res.data
    },
  })

  const getRolePermissions = useQuery({
    queryKey: rolePermissionKeys.byRole(roleId ?? ''),
    queryFn: async () => {
      const res = await http.get<RolePermissionEntry[]>(
        `/v1/config/role-permission/list?roleId=${roleId}`,
      )
      return res.data
    },
    enabled: Boolean(roleId),
  })

  const updatePermissions = useMutation({
    mutationFn: async (input: UpdateRolePermissionsInput) => {
      const res = await http.put<RolePermissionEntry[]>('/v1/config/role-permission', input)
      return res.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: rolePermissionKeys.byRole(variables.roleId) })
    },
  })

  return { getPermissions, getRolePermissions, updatePermissions }
}
