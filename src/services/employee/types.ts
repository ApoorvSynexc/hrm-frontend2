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
