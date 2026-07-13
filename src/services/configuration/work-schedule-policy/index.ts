import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  CreateWorkSchedulePolicyInput,
  UpdateWorkSchedulePolicyInput,
  WorkSchedulePolicy,
  WorkSchedulePolicyListMeta,
  WorkSchedulePolicyListParams,
} from './types'

export type {
  WorkSchedulePolicy,
  WorkingDay,
  WorkSchedulePolicyStatus,
  CreateWorkSchedulePolicyInput,
  UpdateWorkSchedulePolicyInput,
  WorkSchedulePolicyListMeta,
  WorkSchedulePolicyListParams,
} from './types'

export const workSchedulePolicyKeys = {
  all: ['config', 'work-schedule-policy'] as const,
  list: (params: WorkSchedulePolicyListParams) => [...workSchedulePolicyKeys.all, 'list', params] as const,
  detail: (id: string) => [...workSchedulePolicyKeys.all, 'detail', id] as const,
}

type UseWorkSchedulePolicyOptions = {
  listParams?: WorkSchedulePolicyListParams
  workSchedulePolicyId?: string
}

export function useWorkSchedulePolicy({
  listParams,
  workSchedulePolicyId,
}: UseWorkSchedulePolicyOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: workSchedulePolicyKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useWorkSchedulePolicy() calls can share one cache entry, and React Query may run any
  // observer's queryFn on refetch — so it must never depend on this call
  // having received listParams.
  const params = listParams ?? { page: 1, limit: 10 }

  const getWorkSchedulePolicies = useQuery({
    queryKey: workSchedulePolicyKeys.list(params),
    queryFn: async () => {
      const res = await http.get<WorkSchedulePolicy[]>(
        `/v1/config/work-schedule-policy/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { policies: res.data, meta: res.meta as WorkSchedulePolicyListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getWorkSchedulePolicy = useQuery({
    queryKey: workSchedulePolicyKeys.detail(workSchedulePolicyId ?? ''),
    queryFn: async () => {
      const res = await http.get<WorkSchedulePolicy>(
        `/v1/config/work-schedule-policy?id=${workSchedulePolicyId}`,
      )
      return res.data
    },
    enabled: Boolean(workSchedulePolicyId),
  })

  const createWorkSchedulePolicy = useMutation({
    mutationFn: async (input: CreateWorkSchedulePolicyInput) => {
      const res = await http.post<WorkSchedulePolicy>('/v1/config/work-schedule-policy', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateWorkSchedulePolicy = useMutation({
    mutationFn: async (input: UpdateWorkSchedulePolicyInput) => {
      const res = await http.put<WorkSchedulePolicy>('/v1/config/work-schedule-policy', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteWorkSchedulePolicy = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<WorkSchedulePolicy>(`/v1/config/work-schedule-policy?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getWorkSchedulePolicies,
    getWorkSchedulePolicy,
    createWorkSchedulePolicy,
    updateWorkSchedulePolicy,
    deleteWorkSchedulePolicy,
  }
}
