import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import type {
  ApproveRequestInput,
  PendingApproval,
  PendingApprovalMeta,
  RejectRequestInput,
} from './types'

export type {
  ApprovalModule,
  StepInstanceStatus,
  ApprovalRequester,
  ApprovalRequestDetails,
  PendingApproval,
  PendingApprovalMeta,
  ApproveRequestInput,
  RejectRequestInput,
} from './types'

export const approvalRequestKeys = {
  all: ['approval-request'] as const,
  pending: (page: number, limit: number) => [...approvalRequestKeys.all, 'pending', page, limit] as const,
}

type UseApprovalRequestOptions = {
  listParams?: { page: number; limit: number }
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
    queryKey: approvalRequestKeys.pending(params.page, params.limit),
    queryFn: async () => {
      // pagination=true always — the non-paginated backend path returns
      // request: null for WFH items (missing enrichment branch).
      const res = await http.get<PendingApproval[]>(
        `/v1/approval-request/pending?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { approvals: res.data, meta: res.meta as PendingApprovalMeta }
    },
    enabled: Boolean(listParams),
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
