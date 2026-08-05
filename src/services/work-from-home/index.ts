import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import { currentYear } from '../../utils/date'
import { toNumber } from '../../utils/helper'
import type {
  CreateWorkFromHomeInput,
  WithdrawWorkFromHomeResult,
  WorkFromHome,
  WorkFromHomeBalance,
  WorkFromHomeListMeta,
  WorkFromHomeListParams,
} from './types'

/** Normalizes the Decimal-as-string fields on a balance response and its embedded ledger entries. */
function normalizeWorkFromHomeBalance(balance: WorkFromHomeBalance): WorkFromHomeBalance {
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
  WorkFromHome,
  WorkFromHomeStatus,
  WorkFromHomeDayPart,
  CreateWorkFromHomeInput,
  WorkFromHomeListMeta,
  WorkFromHomeListParams,
  WorkFromHomeBalance,
  WorkFromHomeBalanceLedger,
  WorkFromHomeBalanceLedgerTransactionType,
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
      return normalizeWorkFromHomeBalance(res.data)
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
      return {
        requests: res.data.map((wfh) => ({ ...wfh, amount: toNumber(wfh.amount) })),
        meta: res.meta as WorkFromHomeListMeta,
      }
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
