import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'

dayjs.extend(isoWeek)
dayjs.extend(duration)

/**
 * All date handling in this app goes through dayjs — import `dayjs` from
 * here (not directly from the package) so plugins stay registered exactly
 * once, and prefer the named helpers below for anything formatted in more
 * than one place.
 */
export { dayjs }
export type { Dayjs } from 'dayjs'

type DateInput = string | number | Date | dayjs.Dayjs | null | undefined

/** "15 Jul 2026" — the app's standard date display. */
export function formatDate(value: DateInput): string {
  if (!value) return '—'
  return dayjs(value).format('DD MMM YYYY')
}

/** "Jul 15, 2026" — US-style, for the few places already displaying it that way. */
export function formatDateUS(value: DateInput): string {
  if (!value) return '—'
  return dayjs(value).format('MMM D, YYYY')
}

/** "02:30 PM" */
export function formatTime(value: DateInput): string {
  if (!value) return '—'
  return dayjs(value).format('hh:mm A')
}

/** "2h 5m" from a minute count. */
export function formatMinutes(value: number | null | undefined): string {
  if (!value) return '0h 0m'
  const d = dayjs.duration(value, 'minutes')
  return `${Math.floor(d.asHours())}h ${d.minutes()}m`
}

/** "YYYY-MM-DD" */
export function toISODate(value: DateInput = dayjs()): string {
  return dayjs(value).format('YYYY-MM-DD')
}

/** Monday-based start of the week containing `value` (defaults to today). */
export function startOfWeek(value: DateInput = dayjs()) {
  return dayjs(value).startOf('isoWeek')
}

/** 0 (Mon) … 6 (Sun) — for computing a calendar grid's leading blank cells. */
export function mondayFirstWeekday(value: DateInput): number {
  return dayjs(value).isoWeekday() - 1
}

/** Number of days in `month` (1-12) of `year`. */
export function daysInMonth(year: number, month: number): number {
  return dayjs().year(year).month(month - 1).daysInMonth()
}

/** "July 2026" */
export function monthLabel(year: number, month: number): string {
  return dayjs().year(year).month(month - 1).format('MMMM YYYY')
}

/** Current calendar year — for defaulting balance/summary lookups. */
export function currentYear(): number {
  return dayjs().year()
}
