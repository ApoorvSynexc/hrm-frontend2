import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  AttendancePolicy,
  AttendancePolicyListMeta,
  AttendancePolicyListParams,
  CreateAttendancePolicyInput,
  UpdateAttendancePolicyInput,
} from './types'

export type {
  AttendancePolicy,
  AttendancePolicyType,
  AttendancePolicyStatus,
  CreateAttendancePolicyInput,
  UpdateAttendancePolicyInput,
  AttendancePolicyListMeta,
  AttendancePolicyListParams,
} from './types'

export const attendancePolicyKeys = {
  all: ['config', 'attendance-policy'] as const,
  list: (params: AttendancePolicyListParams) => [...attendancePolicyKeys.all, 'list', params] as const,
  detail: (id: string) => [...attendancePolicyKeys.all, 'detail', id] as const,
}

type UseAttendancePolicyOptions = {
  listParams?: AttendancePolicyListParams
  attendancePolicyId?: string
}

export function useAttendancePolicy({
  listParams,
  attendancePolicyId,
}: UseAttendancePolicyOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: attendancePolicyKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useAttendancePolicy() calls can share one cache entry, and React Query may run any
  // observer's queryFn on refetch — so it must never depend on this call
  // having received listParams.
  const params = listParams ?? { page: 1, limit: 10 }

  const getAttendancePolicies = useQuery({
    queryKey: attendancePolicyKeys.list(params),
    queryFn: async () => {
      const res = await http.get<AttendancePolicy[]>(
        `/v1/config/attendance-policy/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { policies: res.data, meta: res.meta as AttendancePolicyListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getAttendancePolicy = useQuery({
    queryKey: attendancePolicyKeys.detail(attendancePolicyId ?? ''),
    queryFn: async () => {
      const res = await http.get<AttendancePolicy>(
        `/v1/config/attendance-policy?id=${attendancePolicyId}`,
      )
      return res.data
    },
    enabled: Boolean(attendancePolicyId),
  })

  const createAttendancePolicy = useMutation({
    mutationFn: async (input: CreateAttendancePolicyInput) => {
      const res = await http.post<AttendancePolicy>('/v1/config/attendance-policy', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateAttendancePolicy = useMutation({
    mutationFn: async (input: UpdateAttendancePolicyInput) => {
      const res = await http.put<AttendancePolicy>('/v1/config/attendance-policy', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteAttendancePolicy = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<AttendancePolicy>(`/v1/config/attendance-policy?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getAttendancePolicies,
    getAttendancePolicy,
    createAttendancePolicy,
    updateAttendancePolicy,
    deleteAttendancePolicy,
  }
}
