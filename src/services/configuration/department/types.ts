/** Mirrors backend Prisma `Department` — the config endpoints return it without relations. */
export type Department = {
  id: string
  tenantId: string
  name: string
  description: string | null
  workScheduleId: string | null
  attendancePolicyId: string | null
  wfhApprovalWorkflowId: string | null
  status: DepartmentStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Backend joi: status must be ACTIVE | INACTIVE | DELETED. */
export type DepartmentStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/** POST /v1/config/department — name required (max 100), description optional (max 500). */
export type CreateDepartmentInput = {
  name: string
  description?: string
}

/** PUT /v1/config/department — id required, everything else optional. */
export type UpdateDepartmentInput = {
  id: string
  name?: string
  description?: string
  status?: DepartmentStatus
}

/** meta returned by GET /v1/config/department/list?pagination=true. */
export type DepartmentListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type DepartmentListParams = {
  page: number
  limit: number
}
