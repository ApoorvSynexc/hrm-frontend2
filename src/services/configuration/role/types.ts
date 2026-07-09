/** Mirrors backend Prisma `Role` — the config endpoints return it without relations. */
export type Role = {
  id: string
  tenantId: string
  name: string
  description: string | null
  isSystem: boolean
  status: RoleStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Backend joi: status must be ACTIVE | INACTIVE | DELETED. */
export type RoleStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/** POST /v1/config/role — name required (max 100, not "admin"), description optional (max 500). */
export type CreateRoleInput = {
  name: string
  description?: string
}

/** PUT /v1/config/role — id required, everything else optional. */
export type UpdateRoleInput = {
  id: string
  name?: string
  description?: string
  status?: RoleStatus
}

/** meta returned by GET /v1/config/role/list?pagination=true. */
export type RoleListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type RoleListParams = {
  page: number
  limit: number
}
