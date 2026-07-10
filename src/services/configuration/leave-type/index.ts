import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  CreateLeaveTypeInput,
  LeaveType,
  LeaveTypeListMeta,
  LeaveTypeListParams,
  UpdateLeaveTypeInput,
} from './types'

export type {
  LeaveType,
  LeaveTypeGender,
  LeaveTypeStatus,
  CreateLeaveTypeInput,
  UpdateLeaveTypeInput,
  LeaveTypeListMeta,
  LeaveTypeListParams,
} from './types'

export const leaveTypeKeys = {
  all: ['config', 'leave-type'] as const,
  list: (params: LeaveTypeListParams) => [...leaveTypeKeys.all, 'list', params] as const,
  detail: (id: string) => [...leaveTypeKeys.all, 'detail', id] as const,
}

type UseLeaveTypeOptions = {
  listParams?: LeaveTypeListParams
  leaveTypeId?: string
}

export function useLeaveType({ listParams, leaveTypeId }: UseLeaveTypeOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: leaveTypeKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useLeaveType() calls can share one cache entry, and React Query may run any
  // observer's queryFn on refetch — so it must never depend on this call
  // having received listParams.
  const params = listParams ?? { page: 1, limit: 10 }

  const getLeaveTypes = useQuery({
    queryKey: leaveTypeKeys.list(params),
    queryFn: async () => {
      const res = await http.get<LeaveType[]>(
        `/v1/config/leave-type/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { leaveTypes: res.data, meta: res.meta as LeaveTypeListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getLeaveType = useQuery({
    queryKey: leaveTypeKeys.detail(leaveTypeId ?? ''),
    queryFn: async () => {
      const res = await http.get<LeaveType>(`/v1/config/leave-type?id=${leaveTypeId}`)
      return res.data
    },
    enabled: Boolean(leaveTypeId),
  })

  const createLeaveType = useMutation({
    mutationFn: async (input: CreateLeaveTypeInput) => {
      const res = await http.post<LeaveType>('/v1/config/leave-type', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateLeaveType = useMutation({
    mutationFn: async (input: UpdateLeaveTypeInput) => {
      const res = await http.put<LeaveType>('/v1/config/leave-type', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteLeaveType = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<LeaveType>(`/v1/config/leave-type?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getLeaveTypes,
    getLeaveType,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
  }
}
