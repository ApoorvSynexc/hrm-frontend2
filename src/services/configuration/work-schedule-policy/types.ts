/** Mirrors backend Prisma `WorkSchedulePolicy`. */
export type WorkSchedulePolicy = {
  id: string
  tenantId: string
  name: string
  workingDays: WorkingDay[]
  startTime: string
  endTime: string
  breakDurationMinutes: number
  fullDayMinimumMinutes: number
  halfDayMinimumMinutes: number
  lateMarkAfter: string | null
  graceTimeInMinutes: number
  maxRegularizationsAllowed: number
  isDefault: boolean
  timezone: string
  status: WorkSchedulePolicyStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Backend joi: workingDays items must be MON..SUN. */
export type WorkingDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

/** Backend joi: status must be ACTIVE | INACTIVE | DELETED. */
export type WorkSchedulePolicyStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/** POST /v1/config/work-schedule-policy — name/workingDays/startTime/endTime required, rest optional. */
export type CreateWorkSchedulePolicyInput = {
  name: string
  workingDays: WorkingDay[]
  startTime: string
  endTime: string
  breakDurationMinutes?: number
  fullDayMinimumMinutes?: number
  halfDayMinimumMinutes?: number
  lateMarkAfter?: string | null
  graceTimeInMinutes?: number
  maxRegularizationsAllowed?: number
  timezone?: string
}

/** PUT /v1/config/work-schedule-policy — id required, everything else optional. */
export type UpdateWorkSchedulePolicyInput = {
  id: string
  name?: string
  workingDays?: WorkingDay[]
  startTime?: string
  endTime?: string
  breakDurationMinutes?: number
  fullDayMinimumMinutes?: number
  halfDayMinimumMinutes?: number
  lateMarkAfter?: string | null
  graceTimeInMinutes?: number
  maxRegularizationsAllowed?: number
  timezone?: string
  status?: WorkSchedulePolicyStatus
}

/** meta returned by GET /v1/config/work-schedule-policy/list?pagination=true. */
export type WorkSchedulePolicyListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type WorkSchedulePolicyListParams = {
  page: number
  limit: number
}
