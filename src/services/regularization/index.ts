import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import type {
  CreateRegularizationInput,
  Regularization,
  RegularizationBalance,
  RegularizationListMeta,
  RegularizationListParams,
} from './types'

export type {
  Regularization,
  RegularizationStatus,
  DayPart,
  CreateRegularizationInput,
  RegularizationListMeta,
  RegularizationListParams,
  RegularizationBalance,
} from './types'

export const regularizationKeys = {
  all: ['regularization'] as const,
  balance: (year: number) => [...regularizationKeys.all, 'balance', year] as const,
  list: (params: RegularizationListParams) => [...regularizationKeys.all, 'list', params] as const,
}

type UseRegularizationOptions = {
  listParams?: RegularizationListParams
  balanceYear?: number
}

export function useRegularization({ listParams, balanceYear }: UseRegularizationOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: regularizationKeys.all })

  const year = balanceYear ?? new Date().getFullYear()

  const getBalance = useQuery({
    queryKey: regularizationKeys.balance(year),
    queryFn: async () => {
      const res = await http.get<RegularizationBalance>(`/v1/regularization/balance?year=${year}`)
      return res.data
    },
  })

  const getRegularizations = useQuery({
    queryKey: regularizationKeys.list(listParams as RegularizationListParams),
    queryFn: async () => {
      const p = listParams as RegularizationListParams
      const query = new URLSearchParams({
        pagination: 'true',
        page: String(p.page),
        limit: String(p.limit),
        userId: p.userId,
      })
      if (p.status) query.set('status', p.status)
      if (p.startDate) query.set('startDate', p.startDate)
      if (p.endDate) query.set('endDate', p.endDate)

      const res = await http.get<Regularization[]>(`/v1/regularization/list?${query.toString()}`)
      return { requests: res.data, meta: res.meta as RegularizationListMeta }
    },
    enabled: Boolean(listParams?.userId),
  })

  const createRegularization = useMutation({
    mutationFn: async (input: CreateRegularizationInput) => {
      const res = await http.post<Regularization>('/v1/regularization', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const withdrawRegularization = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<Regularization>(`/v1/regularization?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getBalance,
    getRegularizations,
    createRegularization,
    withdrawRegularization,
  }
}
