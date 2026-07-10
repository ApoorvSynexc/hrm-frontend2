import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  CreateDesignationInput,
  Designation,
  DesignationListMeta,
  DesignationListParams,
  UpdateDesignationInput,
} from './types'

export type {
  Designation,
  DesignationStatus,
  CreateDesignationInput,
  UpdateDesignationInput,
  DesignationListMeta,
  DesignationListParams,
} from './types'

export const designationKeys = {
  all: ['config', 'designation'] as const,
  list: (params: DesignationListParams) => [...designationKeys.all, 'list', params] as const,
  detail: (id: string) => [...designationKeys.all, 'detail', id] as const,
}

type UseDesignationOptions = {
  listParams?: DesignationListParams
  designationId?: string
}

export function useDesignation({ listParams, designationId }: UseDesignationOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: designationKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useDesignation() calls can share one cache entry, and React Query may run any
  // observer's queryFn on refetch — so it must never depend on this call
  // having received listParams.
  const params = listParams ?? { page: 1, limit: 10 }

  const getDesignations = useQuery({
    queryKey: designationKeys.list(params),
    queryFn: async () => {
      const res = await http.get<Designation[]>(
        `/v1/config/designation/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { designations: res.data, meta: res.meta as DesignationListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getDesignation = useQuery({
    queryKey: designationKeys.detail(designationId ?? ''),
    queryFn: async () => {
      const res = await http.get<Designation>(`/v1/config/designation?id=${designationId}`)
      return res.data
    },
    enabled: Boolean(designationId),
  })

  const createDesignation = useMutation({
    mutationFn: async (input: CreateDesignationInput) => {
      const res = await http.post<Designation>('/v1/config/designation', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateDesignation = useMutation({
    mutationFn: async (input: UpdateDesignationInput) => {
      const res = await http.put<Designation>('/v1/config/designation', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteDesignation = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<Designation>(`/v1/config/designation?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getDesignations,
    getDesignation,
    createDesignation,
    updateDesignation,
    deleteDesignation,
  }
}
