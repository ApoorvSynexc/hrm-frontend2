import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import { currentYear } from '../../utils/date'
import type {
  CreateWorkFromHomeInput,
  WithdrawWorkFromHomeResult,
  WorkFromHome,
  WorkFromHomeBalance,
  WorkFromHomeListMeta,
  WorkFromHomeListParams,
} from './types'

export type {
  WorkFromHome,
  WorkFromHomeStatus,
  WorkFromHomeDayPart,
  CreateWorkFromHomeInput,
  WorkFromHomeListMeta,
  WorkFromHomeListParams,
  WorkFromHomeBalance,
} from './types'

export const workFromHomeKeys = {
  all: ['work-from-home'] as const,
  balance: (year: number) => [...workFromHomeKeys.all, 'balance', year] as const,
  list: (params: WorkFromHomeListParams) => [...workFromHomeKeys.all, 'list', params] as const,
}

type UseWorkFromHomeOptions = {
  listParams?: WorkFromHomeListParams
  balanceYear?: number
}

export function useWorkFromHome({ listParams, balanceYear }: UseWorkFromHomeOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: workFromHomeKeys.all })

  const year = balanceYear ?? currentYear()

  const getBalance = useQuery({
    queryKey: workFromHomeKeys.balance(year),
    queryFn: async () => {
      const res = await http.get<WorkFromHomeBalance>(`/v1/wfh/balance?year=${year}`)
      return res.data
    },
  })

  const getWorkFromHomes = useQuery({
    queryKey: workFromHomeKeys.list(listParams as WorkFromHomeListParams),
    queryFn: async () => {
      const p = listParams as WorkFromHomeListParams
      const query = new URLSearchParams({
        pagination: 'true',
        page: String(p.page),
        limit: String(p.limit),
        userId: p.userId,
      })
      if (p.status) query.set('status', p.status)

      const res = await http.get<WorkFromHome[]>(`/v1/wfh/list?${query.toString()}`)
      return { requests: res.data, meta: res.meta as WorkFromHomeListMeta }
    },
    enabled: Boolean(listParams?.userId),
  })

  const createWorkFromHome = useMutation({
    mutationFn: async (input: CreateWorkFromHomeInput) => {
      const res = await http.post<WorkFromHome>('/v1/wfh', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const withdrawWorkFromHome = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<WithdrawWorkFromHomeResult>(`/v1/wfh?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return { getBalance, getWorkFromHomes, createWorkFromHome, withdrawWorkFromHome }
}
