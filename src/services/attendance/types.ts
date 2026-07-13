/** Mirrors backend Prisma `AttendanceStatus` enum. */
export type AttendanceStatus =
  | 'PENDING'
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'LEAVE'
  | 'HOLIDAY'
  | 'WEEK_OFF'
  | 'MISSING_CHECKIN'
  | 'MISSING_CHECKOUT'
  | 'DELETED'

export type AttendanceLog = {
  id: string
  attendanceId: string
  checkIn: string
  checkOut: string | null
  durationMinutes: number | null
  checkInMethod: string | null
  checkOutMethod: string | null
}

/** Mirrors backend Prisma `Attendance` — always scoped to the logged-in user. */
export type Attendance = {
  id: string
  userId: string
  date: string
  firstCheckIn: string | null
  lastCheckOut: string | null
  totalMinutes: number | null
  status: AttendanceStatus
  isFinalStatus: boolean
  isLate: boolean
  firstHalfStatus: AttendanceStatus
  secondHalfStatus: AttendanceStatus
  logs?: AttendanceLog[]
}

/** GET /v1/attendance/today — {} (empty object) when no attendance started yet today. */
export type TodayAttendance =
  | (Attendance & {
      summary: {
        totalSessions: number
        completedSessions: number
        activeSessions: number
        totalMinutesWorked: number
        currentSessionDuration: number
        currentStatus: 'IN_SESSION' | 'NOT_IN_SESSION'
      }
    })
  | Record<string, never>

/**
 * POST /v1/attendance/checkin — all fields optional; lat/long sent as strings
 * (backend parses to float).
 */
export type CheckInInput = {
  checkInIp?: string
  checkInLatitude?: string
  checkInLongitude?: string
  checkInMethod?: string
}

/** POST /v1/attendance/checkout — id (Attendance id) required. */
export type CheckOutInput = {
  id: string
  checkOutIp?: string
  checkOutLatitude?: string
  checkOutLongitude?: string
  checkOutMethod?: string
}

export type AttendanceListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

/**
 * GET /v1/attendance/list — no backend Joi validation exists on this route,
 * so params are typed here defensively but not guaranteed to be rejected if
 * malformed. Always implicitly scoped to the logged-in user server-side.
 */
export type AttendanceListParams = {
  page: number
  limit: number
  startDate?: string
  endDate?: string
  status?: AttendanceStatus
}
