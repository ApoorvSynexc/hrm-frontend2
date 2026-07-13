import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  CreateRequestPolicyInput,
  RequestPolicy,
  RequestPolicyDetail,
  RequestPolicyListMeta,
  RequestPolicyListParams,
} from './types'

export type {
  RequestPolicy,
  RequestPolicyDetail,
  RequestPolicyType,
  RequestPolicyStatus,
  WFHRuleType,
  WFHPolicyRule,
  RegularizationRuleType,
  RegularizationPolicyRule,
  FinancialYearType,
  LeavePolicyRule,
  CreateRequestPolicyInput,
  RequestPolicyListMeta,
  RequestPolicyListParams,
} from './types'

export const requestPolicyKeys = {
  all: ['config', 'request-policy'] as const,
  list: (params: RequestPolicyListParams) => [...requestPolicyKeys.all, 'list', params] as const,
  detail: (id: string) => [...requestPolicyKeys.all, 'detail', id] as const,
}

type UseRequestPolicyOptions = {
  listParams?: RequestPolicyListParams
  requestPolicyId?: string
}

/**
 * Backend note: PUT /v1/config/request-policy (rename/isDefault/status) always
 * 400s — the update Joi schema doesn't accept `id`, which the controller
 * nonetheless requires. So there's intentionally no updateRequestPolicy here;
 * only create/list/detail/delete, which are the endpoints that actually work.
 */
export function useRequestPolicy({ listParams, requestPolicyId }: UseRequestPolicyOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: requestPolicyKeys.all })

  const params = listParams ?? { page: 1, limit: 10 }

  const getRequestPolicies = useQuery({
    queryKey: requestPolicyKeys.list(params),
    queryFn: async () => {
      const res = await http.get<RequestPolicy[]>(
        `/v1/config/request-policy/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { requestPolicies: res.data, meta: res.meta as RequestPolicyListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getRequestPolicyDetail = useQuery({
    queryKey: requestPolicyKeys.detail(requestPolicyId ?? ''),
    queryFn: async () => {
      const res = await http.get<RequestPolicyDetail>(`/v1/config/request-policy?id=${requestPolicyId}`)
      return res.data
    },
    enabled: Boolean(requestPolicyId),
  })

  const createRequestPolicy = useMutation({
    mutationFn: async (input: CreateRequestPolicyInput) => {
      const res = await http.post<RequestPolicy>('/v1/config/request-policy', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteRequestPolicy = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<RequestPolicy>(`/v1/config/request-policy?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getRequestPolicies,
    getRequestPolicyDetail,
    createRequestPolicy,
    deleteRequestPolicy,
  }
}
