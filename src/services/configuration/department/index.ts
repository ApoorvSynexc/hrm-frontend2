import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  CreateDepartmentInput,
  Department,
  DepartmentListMeta,
  DepartmentListParams,
  UpdateDepartmentInput,
} from './types'

export type {
  Department,
  DepartmentStatus,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DepartmentListMeta,
  DepartmentListParams,
} from './types'

export const departmentKeys = {
  all: ['config', 'department'] as const,
  list: (params: DepartmentListParams) => [...departmentKeys.all, 'list', params] as const,
  detail: (id: string) => [...departmentKeys.all, 'detail', id] as const,
}

type UseDepartmentOptions = {
  listParams?: DepartmentListParams
  departmentId?: string
}

export function useDepartment({ listParams, departmentId }: UseDepartmentOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: departmentKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useDepartment() calls can share one cache entry, and React Query may run any
  // observer's queryFn on refetch — so it must never depend on this call
  // having received listParams.
  const params = listParams ?? { page: 1, limit: 10 }

  const getDepartments = useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: async () => {
      const res = await http.get<Department[]>(
        `/v1/config/department/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { departments: res.data, meta: res.meta as DepartmentListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getDepartment = useQuery({
    queryKey: departmentKeys.detail(departmentId ?? ''),
    queryFn: async () => {
      const res = await http.get<Department>(`/v1/config/department?id=${departmentId}`)
      return res.data
    },
    enabled: Boolean(departmentId),
  })

  const createDepartment = useMutation({
    mutationFn: async (input: CreateDepartmentInput) => {
      const res = await http.post<Department>('/v1/config/department', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateDepartment = useMutation({
    mutationFn: async (input: UpdateDepartmentInput) => {
      const res = await http.put<Department>('/v1/config/department', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteDepartment = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<Department>(`/v1/config/department?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment }
}
