import type { AttendanceStatus } from '../../../services'

export const DAILY_TARGET_MINUTES = 9 * 60

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  PENDING: 'Pending',
  PRESENT: 'Present',
  ABSENT: 'Absent',
  HALF_DAY: 'Half Day',
  LEAVE: 'Leave',
  HOLIDAY: 'Holiday',
  WEEK_OFF: 'Week Off',
  MISSING_CHECKIN: 'Missing Check-in',
  MISSING_CHECKOUT: 'Missing Check-out',
  DELETED: 'Deleted',
}

export const STATUS_BADGE: Record<AttendanceStatus, string> = {
  PENDING: 'bg-surface-2 text-body',
  PRESENT: 'bg-green-500/15 text-green-500',
  ABSENT: 'bg-red-500/15 text-red-500',
  HALF_DAY: 'bg-amber-500/15 text-amber-500',
  LEAVE: 'bg-accent-bg text-accent',
  HOLIDAY: 'bg-accent-bg text-accent',
  WEEK_OFF: 'bg-surface-2 text-body',
  MISSING_CHECKIN: 'bg-red-500/15 text-red-500',
  MISSING_CHECKOUT: 'bg-red-500/15 text-red-500',
  DELETED: 'bg-surface-2 text-body',
}

/**
 * Gradient fills for the per-row duration bar. Applied via inline `style`
 * (not Tailwind classes) — Tailwind's dev-server scanner has twice failed to
 * generate brand-new utility values/variants introduced only in this file
 * (see w-40 and lg:flex), so gradients that never appear elsewhere in the
 * codebase go through plain CSS instead of risking the same gap.
 */
export const STATUS_GRADIENT: Record<AttendanceStatus, string> = {
  PENDING: 'linear-gradient(to right, rgba(100,116,139,0.35), rgba(100,116,139,0.55))',
  PRESENT: 'linear-gradient(to right, #4ade80, #16a34a)',
  ABSENT: 'linear-gradient(to right, #f87171, #dc2626)',
  HALF_DAY: 'linear-gradient(to right, #fbbf24, #d97706)',
  LEAVE: 'linear-gradient(to right, var(--accent-hover), var(--accent))',
  HOLIDAY: 'linear-gradient(to right, var(--accent-hover), var(--accent))',
  WEEK_OFF: 'linear-gradient(to right, rgba(100,116,139,0.35), rgba(100,116,139,0.55))',
  MISSING_CHECKIN: 'linear-gradient(to right, #f87171, #dc2626)',
  MISSING_CHECKOUT: 'linear-gradient(to right, #fbbf24, #d97706)',
  DELETED: 'linear-gradient(to right, rgba(100,116,139,0.35), rgba(100,116,139,0.55))',
}

/** Gradient for the single "today" duration bar (Timings card) — always accent-colored. */
export const DURATION_GRADIENT = 'linear-gradient(to right, var(--accent-hover), var(--accent))'
