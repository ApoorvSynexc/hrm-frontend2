/** Mirrors backend Prisma `Designation` — the config endpoints return it without relations. */
export type Designation = {
  id: string
  tenantId: string
  name: string
  description: string | null
  status: DesignationStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Backend joi: status must be ACTIVE | INACTIVE | DELETED. */
export type DesignationStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/** POST /v1/config/designation — name required (max 100), description optional (max 500). */
export type CreateDesignationInput = {
  name: string
  description?: string
}

/** PUT /v1/config/designation — id required, everything else optional. */
export type UpdateDesignationInput = {
  id: string
  name?: string
  description?: string
  status?: DesignationStatus
}

/** meta returned by GET /v1/config/designation/list?pagination=true. */
export type DesignationListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type DesignationListParams = {
  page: number
  limit: number
}
