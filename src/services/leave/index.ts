import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import type { CreateLeaveInput, Leave, LeaveBalance, LeaveListMeta, LeaveListParams } from './types'

export type {
  Leave,
  LeaveStatus,
  CreateLeaveInput,
  LeaveListMeta,
  LeaveListParams,
  LeaveBalance,
} from './types'

export const leaveKeys = {
  all: ['leave'] as const,
  balances: (year: number) => [...leaveKeys.all, 'balances', year] as const,
  list: (params: LeaveListParams) => [...leaveKeys.all, 'list', params] as const,
}

type UseLeaveOptions = {
  listParams?: LeaveListParams
  balanceYear?: number
}

export function useLeave({ listParams, balanceYear }: UseLeaveOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: leaveKeys.all })

  const year = balanceYear ?? new Date().getFullYear()

  const getBalances = useQuery({
    queryKey: leaveKeys.balances(year),
    queryFn: async () => {
      const res = await http.get<LeaveBalance[]>(`/v1/leave/balance/list?year=${year}`)
      return res.data
    },
  })

  const getLeaves = useQuery({
    queryKey: leaveKeys.list(listParams as LeaveListParams),
    queryFn: async () => {
      const p = listParams as LeaveListParams
      const query = new URLSearchParams({
        pagination: 'true',
        page: String(p.page),
        limit: String(p.limit),
        userId: p.userId,
      })
      if (p.status) query.set('status', p.status)
      if (p.startDate) query.set('startDate', p.startDate)
      if (p.endDate) query.set('endDate', p.endDate)

      const res = await http.get<Leave[]>(`/v1/leave/list?${query.toString()}`)
      return { leaves: res.data, meta: res.meta as LeaveListMeta }
    },
    enabled: Boolean(listParams?.userId),
  })

  const createLeave = useMutation({
    mutationFn: async (input: CreateLeaveInput) => {
      const res = await http.post<Leave>('/v1/leave', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const withdrawLeave = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<Leave>(`/v1/leave?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getBalances,
    getLeaves,
    createLeave,
    withdrawLeave,
  }
}
