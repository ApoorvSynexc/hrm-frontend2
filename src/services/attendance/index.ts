import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import type {
  Attendance,
  AttendanceListMeta,
  AttendanceListParams,
  CheckInInput,
  CheckOutInput,
  TodayAttendance,
} from './types'

export type {
  Attendance,
  AttendanceStatus,
  AttendanceLog,
  TodayAttendance,
  CheckInInput,
  CheckOutInput,
  AttendanceListMeta,
  AttendanceListParams,
} from './types'

export const attendanceKeys = {
  all: ['attendance'] as const,
  today: () => [...attendanceKeys.all, 'today'] as const,
  list: (params: AttendanceListParams) => [...attendanceKeys.all, 'list', params] as const,
}

type UseAttendanceOptions = {
  listParams?: AttendanceListParams
}

export function useAttendance({ listParams }: UseAttendanceOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all })

  // Defaulted once and used for BOTH key and fn — see services/employee for
  // why this must not depend on listParams having been passed by this call.
  const params = listParams ?? { page: 1, limit: 10 }

  const getToday = useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: async () => {
      const res = await http.get<TodayAttendance>('/v1/attendance/today')
      return res.data
    },
  })

  const getAttendanceList = useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: async () => {
      const query = new URLSearchParams({
        pagination: 'true',
        page: String(params.page),
        limit: String(params.limit),
      })
      if (params.startDate) query.set('startDate', params.startDate)
      if (params.endDate) query.set('endDate', params.endDate)
      if (params.status) query.set('status', params.status)

      const res = await http.get<Attendance[]>(`/v1/attendance/list?${query.toString()}`)
      return { records: res.data, meta: res.meta as AttendanceListMeta }
    },
    enabled: Boolean(listParams),
  })

  const checkIn = useMutation({
    mutationFn: async (input: CheckInInput) => {
      const res = await http.post<Attendance>('/v1/attendance/checkin', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const checkOut = useMutation({
    mutationFn: async (input: CheckOutInput) => {
      const res = await http.post<Attendance>('/v1/attendance/checkout', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getToday,
    getAttendanceList,
    checkIn,
    checkOut,
  }
}
