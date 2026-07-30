/** Mirrors backend Prisma `User` (employees are User records — no separate Employee model). */
export type Employee = {
  id: string
  tenantId: string
  email: string
  firstName: string
  lastName: string
  status: EmployeeStatus
  roleId: string | null
  employeeCode: string | null
  departmentId: string | null
  designationId: string | null
  joiningDate: string | null
  hireDate: string | null
  reportingManagerId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  /** Populated on list/detail via Prisma `include`. */
  role?: { id: string; name: string; type: 'SUPER_ADMIN' | 'ADMIN' | 'USER' } | null
  department?: { id: string; name: string } | null
  designation?: { id: string; name: string } | null
  reportingManager?: { id: string; firstName: string; lastName: string } | null
}

/** Backend joi: status must be ACTIVE | INACTIVE | DELETED. */
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/**
 * POST /v1/employee — firstName/lastName/email/password/roleId required.
 * Deliberately omits workScheduleId/attendancePolicyId/wfhApprovalWorkflowId:
 * the backend controller connects them via Prisma relation names that don't
 * exist on User (`workSchedule`, `wfhApprovalWorkflow`), so sending any of
 * them always 400s with "Unknown argument". attendancePolicyId is additionally
 * @unique on User in the schema, so only one employee could ever hold a given
 * policy even if the relation name were fixed.
 */
export type CreateEmployeeInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  hireDate?: string
  departmentId?: string
  designationId?: string
  roleId: string
  reportingManagerId?: string
}

/** PUT /v1/employee — id required, everything else optional. */
export type UpdateEmployeeInput = {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  hireDate?: string
  departmentId?: string
  designationId?: string
  roleId?: string
  reportingManagerId?: string
  status?: EmployeeStatus
}

/** meta returned by GET /v1/employee/list?pagination=true. */
export type EmployeeListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type EmployeeListParams = {
  page: number
  limit: number
}

/** Backend joi: dayPart must be FIRST_HALF | SECOND_HALF | FULL_DAY. */
export type TeamDayPart = 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY'

export type TeamMemberProfile = {
  id: string
  name: string
  url: string
  mimetype: string
  thumbnailUrl: string | null
}

/** The subset of employee fields the my-team/leave-wfh-today endpoint attaches to each entry. */
export type TeamMemberSummary = {
  id: string
  firstName: string
  lastName: string
  employeeCode: string | null
  profile: TeamMemberProfile | null
}

/**
 * GET /v1/employee/my-team/leave-wfh-today — "my team" means employees
 * whose reportingManagerId is the logged-in user (direct reports only, not
 * the whole org). The backend pre-filters to APPROVED requests whose
 * [startDate, endDate] window covers today in the tenant's timezone, so
 * `status` is always APPROVED here.
 */
export type TeamLeaveToday = {
  id: string
  userId: string
  leaveTypeId: string
  status: 'APPROVED'
  startDate: string
  endDate: string
  startDateDayPart: TeamDayPart
  endDateDayPart: TeamDayPart
  amount: number
  reason: string | null
  createdAt: string
  updatedAt: string
  employee: TeamMemberSummary
}

export type TeamWfhToday = {
  id: string
  userId: string
  status: 'APPROVED'
  startDate: string
  endDate: string
  startDateDayPart: TeamDayPart
  endDateDayPart: TeamDayPart
  amount: number
  reason: string | null
  createdAt: string
  updatedAt: string
  employee: TeamMemberSummary
}

export type TeamLeaveAndWfhToday = {
  leaves: TeamLeaveToday[]
  workFromHomes: TeamWfhToday[]
}
