/** Mirrors backend Prisma `RequestStatus` enum. */
export type RegularizationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED' | 'DELETED'

/** Mirrors backend Prisma `DayPartStatus` enum. */
export type DayPart = 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY'

/** Mirrors backend Prisma `AttendanceRegularization`. */
export type Regularization = {
  id: string
  userId: string
  attendanceId: string | null
  date: string
  dayPart: DayPart
  requestedCheckIn: string
  requestedCheckOut: string
  reason: string
  status: RegularizationStatus
  createdAt: string
  updatedAt: string
}

/**
 * POST /v1/regularization — backend Joi marks requestedCheckIn/requestedCheckOut
 * as optional, but the Prisma model requires both (non-nullable DateTime); omitting
 * them throws an unhandled Prisma error instead of a clean 400. Both are required here.
 * Backend also hard-requires the caller's own reportingManagerId to be set, and a
 * REGULARIZATION-type RequestPolicy with at least one rule to exist, or it 400s.
 */
export type CreateRegularizationInput = {
  date: string
  dayPart?: DayPart
  requestedCheckIn: string
  requestedCheckOut: string
  reason: string
  attendanceId?: string
}

export type RegularizationListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

/**
 * GET /v1/regularization/list — NOT self-scoped server-side unless userId is
 * passed explicitly (unlike Attendance's /list), so callers on a "Me" page
 * must always send the logged-in user's own id.
 */
export type RegularizationListParams = {
  userId: string
  page: number
  limit: number
  status?: RegularizationStatus
  startDate?: string
  endDate?: string
}

/** Mirrors backend Prisma `TransactionType` enum. */
export type RegularizationBalanceLedgerTransactionType = 'CREDIT' | 'DEBIT' | 'ADJUSTMENT' | 'CARRY_FORWARD'

/**
 * Mirrors backend Prisma `RegularizationBalanceLedger`. `amount` is always a
 * positive count regardless of transactionType — CREDIT/DEBIT direction has
 * to be read from transactionType. A DEBIT row starts status: INACTIVE while
 * its regularization request is pending approval, then flips to ACTIVE on
 * approval or gets deleted on rejection/withdrawal — so status: 'ACTIVE' is
 * what actually happened to the balance.
 */
export type RegularizationBalanceLedger = {
  id: string
  tenantId: string
  userId: string
  regularizationBalanceId: string
  transactionType: RegularizationBalanceLedgerTransactionType
  amount: number
  description: string
  attendanceRegularizationId: string | null
  balanceBeforeTransaction: number
  balanceAfterTransaction: number
  createdBy: string | null
  reason: string | null
  remarks: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  createdAt: string
  updatedAt: string
}

/**
 * GET /v1/regularization/balance — `ledger` is included directly on this
 * response (no separate ledger endpoint) — filter to status: 'ACTIVE'
 * entries to see finalized balance movements only (INACTIVE entries are
 * holds for still-pending regularization requests).
 */
export type RegularizationBalance = {
  id: string
  userId: string
  year: number
  totalDays: number
  usedDays: number
  remainingDays: number
  ledger: RegularizationBalanceLedger[]
} | null
