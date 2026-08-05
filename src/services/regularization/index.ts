import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import { currentYear } from '../../utils/date'
import { toNumber } from '../../utils/helper'
import type {
  CreateRegularizationInput,
  Regularization,
  RegularizationBalance,
  RegularizationListMeta,
  RegularizationListParams,
} from './types'

/** Normalizes the Decimal-as-string fields on a balance response and its embedded ledger entries. */
function normalizeRegularizationBalance(balance: RegularizationBalance): RegularizationBalance {
  if (!balance) return balance
  return {
    ...balance,
    totalDays: toNumber(balance.totalDays),
    usedDays: toNumber(balance.usedDays),
    remainingDays: toNumber(balance.remainingDays),
    ledger: balance.ledger.map((entry) => ({
      ...entry,
      amount: toNumber(entry.amount),
      balanceBeforeTransaction: toNumber(entry.balanceBeforeTransaction),
      balanceAfterTransaction: toNumber(entry.balanceAfterTransaction),
    })),
  }
}

export type {
  Regularization,
  RegularizationStatus,
  DayPart,
  CreateRegularizationInput,
  RegularizationListMeta,
  RegularizationListParams,
  RegularizationBalance,
  RegularizationBalanceLedger,
  RegularizationBalanceLedgerTransactionType,
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

  const year = balanceYear ?? currentYear()

  const getBalance = useQuery({
    queryKey: regularizationKeys.balance(year),
    queryFn: async () => {
      const res = await http.get<RegularizationBalance>(`/v1/regularization/balance?year=${year}`)
      return normalizeRegularizationBalance(res.data)
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
