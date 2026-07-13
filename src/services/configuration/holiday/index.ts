import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  CreateHolidayInput,
  Holiday,
  HolidayListMeta,
  HolidayListParams,
  UpdateHolidayInput,
} from './types'

export type {
  Holiday,
  HolidayType,
  HolidayRestrictionType,
  HolidayStatus,
  CreateHolidayInput,
  UpdateHolidayInput,
  HolidayListMeta,
  HolidayListParams,
} from './types'

export const holidayKeys = {
  all: ['config', 'holiday'] as const,
  list: (params: HolidayListParams) => [...holidayKeys.all, 'list', params] as const,
  detail: (id: string) => [...holidayKeys.all, 'detail', id] as const,
}

type UseHolidayOptions = {
  listParams?: HolidayListParams
  holidayId?: string
}

export function useHoliday({ listParams, holidayId }: UseHolidayOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: holidayKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useHoliday() calls can share one cache entry, and React Query may run any
  // observer's queryFn on refetch — so it must never depend on this call
  // having received listParams.
  const params = listParams ?? { page: 1, limit: 10 }

  const getHolidays = useQuery({
    queryKey: holidayKeys.list(params),
    queryFn: async () => {
      const res = await http.get<Holiday[]>(
        `/v1/config/holiday/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { holidays: res.data, meta: res.meta as HolidayListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getHolidayDetail = useQuery({
    queryKey: holidayKeys.detail(holidayId ?? ''),
    queryFn: async () => {
      const res = await http.get<Holiday>(`/v1/config/holiday?id=${holidayId}`)
      return res.data
    },
    enabled: Boolean(holidayId),
  })

  const createHoliday = useMutation({
    mutationFn: async (input: CreateHolidayInput) => {
      const res = await http.post<Holiday>('/v1/config/holiday', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateHoliday = useMutation({
    mutationFn: async (input: UpdateHolidayInput) => {
      const res = await http.put<Holiday>('/v1/config/holiday', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteHoliday = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<Holiday>(`/v1/config/holiday?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getHolidays,
    getHolidayDetail,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  }
}
