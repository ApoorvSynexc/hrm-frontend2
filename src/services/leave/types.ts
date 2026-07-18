/** Mirrors backend Prisma `RequestStatus` enum. */
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED' | 'DELETED'

/** Mirrors backend Prisma `Leave`. */
export type Leave = {
  id: string
  userId: string
  leaveTypeId: string
  status: LeaveStatus
  startDate: string
  endDate: string
  startDateDayPart: 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY'
  endDateDayPart: 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY'
  amount: number
  reason: string | null
  createdAt: string
  updatedAt: string
  /** Populated when the backend includes the relation. */
  leaveType?: { id: string; name: string } | null
}

/**
 * POST /v1/leave — half-day leave is currently impossible through the API:
 * the controller reads `startDateDayPart`/`endDateDayPart` from the body,
 * but the Joi schema only allows a single `dayPart` key (and rejects unknown
 * keys), so the day-part fields can never reach the controller. The form
 * therefore only supports full-day leave and this input omits day parts.
 */
export type CreateLeaveInput = {
  leaveTypeId: string
  startDate: string
  endDate: string
  reason: string
}

export type LeaveListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

/**
 * GET /v1/leave/list — NOT self-scoped server-side unless userId is passed
 * explicitly (same flaw as regularization's list), so callers on a "Me" page
 * must always send the logged-in user's own id.
 */
export type LeaveListParams = {
  userId: string
  page: number
  limit: number
  status?: Exclude<LeaveStatus, 'DELETED'>
  startDate?: string
  endDate?: string
}

/** GET /v1/leave/balance/list — one row per leave type for the year. */
export type LeaveBalance = {
  id: string
  userId: string
  leaveTypeId: string
  year: number
  totalDays: number
  usedDays: number
  remainingDays: number
  leaveType?: { id: string; name: string } | null
}
