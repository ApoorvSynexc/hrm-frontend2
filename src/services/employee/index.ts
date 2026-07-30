import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeListMeta,
  EmployeeListParams,
  TeamLeaveAndWfhToday,
  UpdateEmployeeInput,
} from './types'

export type {
  Employee,
  EmployeeStatus,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeListMeta,
  EmployeeListParams,
  TeamDayPart,
  TeamMemberProfile,
  TeamMemberSummary,
  TeamLeaveToday,
  TeamWfhToday,
  TeamLeaveAndWfhToday,
} from './types'

export const employeeKeys = {
  all: ['employee'] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.all, 'list', params] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
  teamLeaveAndWfhToday: () => [...employeeKeys.all, 'team-leave-wfh-today'] as const,
}

type UseEmployeeOptions = {
  listParams?: EmployeeListParams
  employeeId?: string
}

export function useEmployee({ listParams, employeeId }: UseEmployeeOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: employeeKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useEmployee() calls can share one cache entry, and React Query may run any
  // observer's queryFn on refetch — so it must never depend on this call
  // having received listParams.
  const params = listParams ?? { page: 1, limit: 10 }

  const getEmployees = useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: async () => {
      const res = await http.get<Employee[]>(
        `/v1/employee/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { employees: res.data, meta: res.meta as EmployeeListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getEmployeeDetail = useQuery({
    queryKey: employeeKeys.detail(employeeId ?? ''),
    queryFn: async () => {
      const res = await http.get<Employee>(`/v1/employee?id=${employeeId}`)
      return res.data
    },
    enabled: Boolean(employeeId),
  })

  const getTeamLeaveAndWfhToday = useQuery({
    queryKey: employeeKeys.teamLeaveAndWfhToday(),
    queryFn: async () => {
      const res = await http.get<TeamLeaveAndWfhToday>('/v1/employee/my-team/leave-wfh-today')
      return res.data
    },
  })

  const createEmployee = useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      const res = await http.post<Employee>('/v1/employee', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateEmployee = useMutation({
    mutationFn: async (input: UpdateEmployeeInput) => {
      const res = await http.put<Employee>('/v1/employee', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<Employee>(`/v1/employee?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getEmployees,
    getEmployeeDetail,
    getTeamLeaveAndWfhToday,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
