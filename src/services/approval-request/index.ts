import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import { toNumber } from '../../utils/helper'
import type {
  ApproveRequestInput,
  PendingApproval,
  PendingApprovalListParams,
  PendingApprovalMeta,
  PendingApprovalsCount,
  RejectRequestInput,
} from './types'

/** Normalizes the embedded request's Decimal-as-string `amount` (Leave only — WFH/Regularization don't have one). */
function normalizePendingApproval(approval: PendingApproval): PendingApproval {
  if (!approval.request || approval.request.amount === undefined) return approval
  return { ...approval, request: { ...approval.request, amount: toNumber(approval.request.amount) } }
}

export type {
  ApprovalModule,
  StepInstanceStatus,
  ApprovalRequester,
  ApprovalRequestDetails,
  PendingApproval,
  PendingApprovalMeta,
  PendingApprovalListParams,
  PendingApprovalsCount,
  ApproveRequestInput,
  RejectRequestInput,
} from './types'

export const approvalRequestKeys = {
  all: ['approval-request'] as const,
  pending: (params: PendingApprovalListParams) => [...approvalRequestKeys.all, 'pending', params] as const,
  pendingCount: ['approval-request', 'pending-count'] as const,
}

/**
 * GET /v1/approval-request/pending/count — dedicated lightweight count used
 * for the Sidebar/Inbox tab badges, instead of fetching a full (if capped)
 * pending list just to read meta.totalRecords.
 */
export function usePendingApprovalsCount() {
  const http = useHttpClient()
  return useQuery({
    queryKey: approvalRequestKeys.pendingCount,
    queryFn: async () => {
      const res = await http.get<PendingApprovalsCount>('/v1/approval-request/pending/count')
      return res.data.count
    },
    staleTime: 0,
  })
}

type UseApprovalRequestOptions = {
  listParams?: PendingApprovalListParams
}

export function useApprovalRequest({ listParams }: UseApprovalRequestOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: approvalRequestKeys.all })
    // Approving/rejecting changes the underlying leave/regularization rows
    // and their balances, so those caches are stale too.
    queryClient.invalidateQueries({ queryKey: ['leave'] })
    queryClient.invalidateQueries({ queryKey: ['regularization'] })
    queryClient.invalidateQueries({ queryKey: ['attendance'] })
  }

  const params = listParams ?? { page: 1, limit: 10 }

  const getPendingApprovals = useQuery({
    queryKey: approvalRequestKeys.pending(params),
    queryFn: async () => {
      // pagination=true always — the non-paginated backend path returns
      // request: null for WFH items (missing enrichment branch).
      const query = new URLSearchParams({
        pagination: 'true',
        page: String(params.page),
        limit: String(params.limit),
      })
      if (params.module) query.set('module', params.module)

      const res = await http.get<PendingApproval[]>(`/v1/approval-request/pending?${query.toString()}`)
      return { approvals: res.data.map(normalizePendingApproval), meta: res.meta as PendingApprovalMeta }
    },
    enabled: Boolean(listParams),
    // Pending approvals change frequently and drive an action queue, so every
    // param change (e.g. switching the Inbox module filter) must hit the API
    // live instead of serving the global 60s cache.
    staleTime: 0,
  })

  const approveRequest = useMutation({
    mutationFn: async (input: ApproveRequestInput) => {
      const res = await http.post<PendingApproval>('/v1/approval-request/approve', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const rejectRequest = useMutation({
    mutationFn: async (input: RejectRequestInput) => {
      const res = await http.post<PendingApproval>('/v1/approval-request/reject', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getPendingApprovals,
    approveRequest,
    rejectRequest,
  }
}
