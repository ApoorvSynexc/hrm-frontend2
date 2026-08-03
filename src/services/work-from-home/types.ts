/** Mirrors backend Prisma `RequestStatus` enum. */
export type WorkFromHomeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED' | 'DELETED'

/** Mirrors backend Prisma `DayPartStatus` enum. */
export type WorkFromHomeDayPart = 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY'

/** Mirrors backend Prisma `WorkFromHome`. */
export type WorkFromHome = {
  id: string
  userId: string
  startDate: string
  endDate: string
  startDateDayPart: WorkFromHomeDayPart
  endDateDayPart: WorkFromHomeDayPart
  /**
   * Backend bug: the create handler computes the requested day count but
   * never persists it onto the row — this stays at the Prisma default of 0
   * forever. Don't render it as "days requested"; derive that from
   * startDate/endDate + the day-parts instead (see computeRequestedDays in
   * pages/me/work-from-home).
   */
  amount: number
  reason: string | null
  status: WorkFromHomeStatus
  createdAt: string
  updatedAt: string
}

/**
 * POST /v1/wfh — backend Joi marks every field optional, but startDate/endDate
 * are non-nullable on the Prisma model — omitting them 500s instead of a clean
 * 400, so both are required here. Note: if the employee's WFH policy has
 * requiresApproval=false, the backend auto-approves the request immediately —
 * don't assume a freshly created request is always PENDING.
 */
export type CreateWorkFromHomeInput = {
  startDate: string
  endDate: string
  startDateDayPart?: WorkFromHomeDayPart
  endDateDayPart?: WorkFromHomeDayPart
  reason?: string
}

export type WorkFromHomeListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

/**
 * GET /v1/wfh/list — NOT self-scoped server-side unless userId is passed
 * explicitly (same flaw as Leave/Regularization's list), so callers on a
 * "Me" page must always send the logged-in user's own id. startDate/endDate
 * filters are deliberately not exposed here — sending both together 500s
 * server-side (it filters on a `date` column that doesn't exist on this
 * model).
 */
export type WorkFromHomeListParams = {
  userId: string
  page: number
  limit: number
  status?: Exclude<WorkFromHomeStatus, 'CANCELLED' | 'DELETED'>
}

/** Mirrors backend Prisma `TransactionType` enum. */
export type WorkFromHomeBalanceLedgerTransactionType = 'CREDIT' | 'DEBIT' | 'ADJUSTMENT' | 'CARRY_FORWARD'

/**
 * Mirrors backend Prisma `WorkFromHomeBalanceLedger`. `amount` is always a
 * positive day count regardless of transactionType — CREDIT/DEBIT direction
 * has to be read from transactionType, not the sign of amount (the schema
 * comment claims debits are stored negative, but the create call-sites all
 * pass a positive value). A DEBIT row starts status: INACTIVE while its WFH
 * request is pending approval, then flips to ACTIVE on approval or gets
 * deleted on rejection/withdrawal — so status: 'ACTIVE' is what actually
 * happened to the balance (the monthly CREDIT allocation + approved-usage
 * DEBITs); INACTIVE rows are still-pending holds.
 */
export type WorkFromHomeBalanceLedger = {
  id: string
  tenantId: string
  userId: string
  workFromHomeBalanceId: string
  transactionType: WorkFromHomeBalanceLedgerTransactionType
  amount: number
  description: string
  workFromHomeId: string | null
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
 * GET /v1/wfh/balance — always scoped to the caller (no userId override
 * possible). Withdrawing a request does not release its held balance back
 * (backend gap, not something the frontend can work around), so remainingDays
 * may under-report after a withdrawal. `ledger` is included directly on this
 * response (no separate ledger endpoint) — filter to status: 'ACTIVE' entries
 * to see finalized balance movements only (INACTIVE entries are holds for
 * still-pending WFH requests).
 */
export type WorkFromHomeBalance = {
  id: string
  userId: string
  year: number
  totalDays: number
  usedDays: number
  remainingDays: number
  ledger: WorkFromHomeBalanceLedger[]
} | null

/** DELETE /v1/wfh — the backend returns a synthetic object, not the full row. */
export type WithdrawWorkFromHomeResult = {
  id: string
  status: 'WITHDRAWN'
  message: string
}
