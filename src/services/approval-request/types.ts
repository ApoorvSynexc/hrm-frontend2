/** Mirrors backend Prisma `RequestPolicyType` (HOLIDAY exists but is never enriched/inboxed). */
export type ApprovalModule = 'LEAVE' | 'WFH' | 'REGULARIZATION' | 'HOLIDAY'

/** Mirrors backend Prisma `StepInstanceStatus`. */
export type StepInstanceStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED' | 'DELETED'

export type ApprovalRequester = {
  id: string
  firstName: string
  lastName: string
  email: string
}

/**
 * The underlying request row attached to a pending approval, shape varying
 * by `instance.module` — LEAVE has startDate/endDate/amount, REGULARIZATION
 * has date/requestedCheckIn/requestedCheckOut, WFH has startDate/endDate.
 * All fields the UI reads are optional so one type covers the union.
 */
export type ApprovalRequestDetails = {
  id: string
  reason?: string | null
  status?: string
  /** Decimal column server-side (Leave.amount) — arrives as a string over JSON; getPendingApprovals() normalizes it via toNumber(). */
  amount?: number
  startDate?: string
  endDate?: string
  date?: string
  dayPart?: string
  requestedCheckIn?: string
  requestedCheckOut?: string
  user?: ApprovalRequester | null
} | null

/**
 * GET /v1/approval-request/pending — one entry per approval step instance
 * assigned to the logged-in user with status PENDING. Always call with
 * pagination=true: the non-paginated backend path skips enriching WFH
 * requests (returns request: null for them).
 */
export type PendingApproval = {
  id: string
  instanceId: string
  stepNumber: number
  approverId: string | null
  status: StepInstanceStatus
  pendingSince: string | null
  createdAt: string
  instance: {
    id: string
    module: ApprovalModule
    requestId: string
    status: string
    workflow?: { id: string; name: string } | null
  }
  request: ApprovalRequestDetails
}

export type PendingApprovalMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

/**
 * GET /v1/approval-request/pending — `module` filters server-side
 * (case-insensitive, upper-cased before matching) when provided; omit it to
 * get pending approvals across every module.
 */
export type PendingApprovalListParams = {
  page: number
  limit: number
  module?: ApprovalModule
}

/**
 * GET /v1/approval-request/pending/count — total pending approvals across
 * every module for the logged-in approver (no module filter supported).
 */
export type PendingApprovalsCount = {
  count: number
}

/** POST /v1/approval-request/approve */
export type ApproveRequestInput = {
  stepInstanceId: string
  comment?: string
}

/** POST /v1/approval-request/reject — rejectionReason is required (max 500). */
export type RejectRequestInput = {
  stepInstanceId: string
  rejectionReason: string
}
