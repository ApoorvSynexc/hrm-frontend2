/** Mirrors backend Prisma `LeaveType`. */
export type LeaveType = {
  id: string
  tenantId: string
  name: string
  code: string
  color: string | null
  applicableGender: LeaveTypeGender
  status: LeaveTypeStatus
  createdAt: string
  updatedAt: string
}

/** Backend joi: applicableGender must be MALE | FEMALE | BOTH. */
export type LeaveTypeGender = 'MALE' | 'FEMALE' | 'BOTH'

/** Backend joi: status must be ACTIVE | INACTIVE (soft-delete sets DELETED directly, not via update). */
export type LeaveTypeStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/** POST /v1/config/leave-type — name & code required, color/applicableGender optional. */
export type CreateLeaveTypeInput = {
  name: string
  code: string
  color?: string
  applicableGender?: LeaveTypeGender
}

/** PUT /v1/config/leave-type — id required, everything else optional. */
export type UpdateLeaveTypeInput = {
  id: string
  name?: string
  code?: string
  color?: string
  applicableGender?: LeaveTypeGender
  status?: LeaveTypeStatus
}

/** meta returned by GET /v1/config/leave-type/list?pagination=true. */
export type LeaveTypeListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type LeaveTypeListParams = {
  page: number
  limit: number
}
