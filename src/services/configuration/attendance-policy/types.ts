/** Mirrors backend Prisma `AttendancePolicy`. */
export type AttendancePolicy = {
  id: string
  tenantId: string
  name: string
  description: string | null
  isDefault: boolean
  policyType: AttendancePolicyType
  ipRanges: unknown
  radiusMeters: number
  wifiSsids: string[]
  status: AttendancePolicyStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  createdBy: string | null
}

/** Backend joi: policyType must be STRICT | FLEXIBLE. */
export type AttendancePolicyType = 'STRICT' | 'FLEXIBLE'

/** Backend joi: status must be ACTIVE | INACTIVE | DELETED. */
export type AttendancePolicyStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/** POST /v1/config/attendance-policy — name & policyType required, rest optional. */
export type CreateAttendancePolicyInput = {
  name: string
  description?: string
  policyType: AttendancePolicyType
  radiusMeters?: number
  wifiSsids?: string[]
}

/** PUT /v1/config/attendance-policy — id required, everything else optional. */
export type UpdateAttendancePolicyInput = {
  id: string
  name?: string
  description?: string
  policyType?: AttendancePolicyType
  radiusMeters?: number
  wifiSsids?: string[]
  status?: AttendancePolicyStatus
}

/** meta returned by GET /v1/config/attendance-policy/list?pagination=true. */
export type AttendancePolicyListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type AttendancePolicyListParams = {
  page: number
  limit: number
}
