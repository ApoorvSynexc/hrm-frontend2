/** Mirrors backend Prisma `Holiday`. */
export type Holiday = {
  id: string
  tenantId: string
  userId: string
  year: number
  name: string
  date: string
  type: HolidayType
  restrictionType: HolidayRestrictionType
  status: HolidayStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Backend joi: type must be FIXED | FESTIVAL | NATIONAL. */
export type HolidayType = 'FIXED' | 'FESTIVAL' | 'NATIONAL'

/** Backend joi: restrictionType must be FIXED | RESTRICTED. */
export type HolidayRestrictionType = 'FIXED' | 'RESTRICTED'

/** Backend joi: status must be ACTIVE | INACTIVE | DELETED. */
export type HolidayStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/**
 * POST /v1/config/holiday — name/date/type/year/userId required, restrictionType optional.
 * userId is who the holiday is recorded against; the frontend sends the logged-in admin's id
 * since there's no per-employee holiday picker in this UI.
 */
export type CreateHolidayInput = {
  name: string
  date: string
  type: HolidayType
  restrictionType?: HolidayRestrictionType
  year: number
  userId: string
}

/** PUT /v1/config/holiday — id required, everything else optional. */
export type UpdateHolidayInput = {
  id: string
  name?: string
  date?: string
  type?: HolidayType
  restrictionType?: HolidayRestrictionType
  year?: number
  status?: HolidayStatus
}

/** meta returned by GET /v1/config/holiday/list?pagination=true. */
export type HolidayListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type HolidayListParams = {
  page: number
  limit: number
}
