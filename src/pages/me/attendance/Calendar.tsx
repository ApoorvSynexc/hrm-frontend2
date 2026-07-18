import { useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Button, Typography } from '../../../components'
import {
  useAttendance,
  type AttendanceStatus,
  type MonthlyCalendarDay,
  type MonthlySummary,
} from '../../../services'
import { STATUS_BADGE, STATUS_LABEL, formatMinutes } from './helpers'

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * Solid status colors applied via inline style (plain CSS) — same reasoning
 * as STATUS_GRADIENT in helpers: first-use-only Tailwind utilities in this
 * folder have failed to compile twice, so color that must render goes inline.
 */
const STATUS_HEX: Record<AttendanceStatus, string> = {
  PENDING: 'rgba(100,116,139,0.5)',
  PRESENT: '#22c55e',
  ABSENT: '#ef4444',
  HALF_DAY: '#f59e0b',
  LEAVE: 'var(--accent)',
  HOLIDAY: 'var(--accent)',
  WEEK_OFF: 'rgba(100,116,139,0.5)',
  MISSING_CHECKIN: '#ef4444',
  MISSING_CHECKOUT: '#f59e0b',
  DELETED: 'rgba(100,116,139,0.5)',
}

const SUMMARY_ITEMS: { key: keyof Omit<MonthlySummary, 'year' | 'month' | 'totalDays'>; label: string; hex: string }[] = [
  { key: 'presentDays', label: 'Present', hex: STATUS_HEX.PRESENT },
  { key: 'halfDays', label: 'Half Day', hex: STATUS_HEX.HALF_DAY },
  { key: 'absentDays', label: 'Absent', hex: STATUS_HEX.ABSENT },
  { key: 'onLeaveDays', label: 'Leave', hex: STATUS_HEX.LEAVE },
  { key: 'holidayDays', label: 'Holiday', hex: STATUS_HEX.HOLIDAY },
  { key: 'weekOffDays', label: 'Week Off', hex: STATUS_HEX.WEEK_OFF },
  { key: 'lateDays', label: 'Late', hex: STATUS_HEX.HALF_DAY },
]

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}

/** 0 = Monday … 6 = Sunday, matching WEEKDAY_HEADERS. */
function mondayFirstDay(date: Date) {
  return (date.getDay() + 6) % 7
}

export default function Calendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-12

  const { getMonthly } = useAttendance({ monthlyParams: { year, month } })

  const calendarByDate = useMemo(() => {
    const map = new Map<string, MonthlyCalendarDay>()
    ;(getMonthly.data?.calendar ?? []).forEach((day) => map.set(day.date.slice(0, 10), day))
    return map
  }, [getMonthly.data])

  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const leadingBlanks = mondayFirstDay(firstOfMonth)

    const items: { date: Date | null; iso: string | null }[] = []
    for (let i = 0; i < leadingBlanks; i++) items.push({ date: null, iso: null })
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d)
      items.push({ date, iso: toISODate(date) })
    }
    while (items.length % 7 !== 0) items.push({ date: null, iso: null })
    return items
  }, [year, month])

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const goToToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth() + 1)
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
  const todayISO = toISODate(now)
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const summary = getMonthly.data?.summary

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h6">Monthly Calendar</Typography>
          <Typography variant="body-sm" color="body">
            Your day-by-day attendance for the selected month.
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          )}
          <div className="flex items-center rounded-lg border border-border">
            <button
              type="button"
              aria-label="Previous month"
              onClick={goToPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-l-lg text-body transition-colors hover:bg-surface-2 hover:text-heading"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="min-w-36 border-x border-border px-3 text-center text-sm font-medium text-heading">
              {monthLabel}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={goToNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-r-lg text-body transition-colors hover:bg-surface-2 hover:text-heading"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {SUMMARY_ITEMS.map(({ key, label, hex }) => (
            <span key={key} className="inline-flex items-center gap-1.5 text-xs text-body">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hex }} />
              {label}
              <span className="font-semibold text-heading">{summary[key]}</span>
            </span>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-7 border-b border-border bg-surface-2">
          {WEEKDAY_HEADERS.map((label) => (
            <div key={label} className="px-2 py-2.5 text-center text-xs font-medium tracking-wide text-body uppercase">
              {label}
            </div>
          ))}
        </div>

        {getMonthly.isLoading ? (
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse border-r border-b border-border bg-surface" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((cell, index) => {
              const isWeekend = index % 7 >= 5

              // Blank leading/trailing cells (outside the month) blend into
              // the page — no tint — so weekend shading (below) reads as its
              // own distinct signal instead of looking identical to "empty".
              // Every cell draws its own border (rather than relying on a
              // background-color gap trick) so the grid stays crisp even
              // against the weekend tint, which would otherwise wash a
              // same-color gap line out to near-invisibility.
              if (!cell.date || !cell.iso) {
                return <div key={index} className="h-24 border-r border-b border-border bg-surface" />
              }
              const day = calendarByDate.get(cell.iso)
              const isToday = cell.iso === todayISO

              return (
                <div
                  key={index}
                  className={`flex h-24 flex-col gap-1.5 border-r border-b border-border p-2 transition-colors ${
                    isToday
                      ? 'bg-accent-bg ring-1 ring-inset ring-accent'
                      : isWeekend
                        ? 'bg-border/10'
                        : 'bg-surface hover:bg-surface-2/40'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? 'bg-accent text-accent-fg' : 'text-heading'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {day && (
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[day.status]}`}
                    >
                      {STATUS_LABEL[day.status]}
                      {day.isLate ? ' · Late' : ''}
                    </span>
                  )}
                  {day?.totalMinutes ? (
                    <span className="text-[11px] text-body">{formatMinutes(day.totalMinutes)}</span>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
