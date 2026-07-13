import { useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Typography } from '../../../components'
import { useAttendance, type MonthlyCalendarDay } from '../../../services'
import { STATUS_BADGE, STATUS_LABEL, formatMinutes } from './helpers'

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SUMMARY_ROWS: { key: 'presentDays' | 'halfDays' | 'absentDays' | 'onLeaveDays' | 'holidayDays' | 'weekOffDays' | 'lateDays'; label: string }[] = [
  { key: 'presentDays', label: 'Present' },
  { key: 'halfDays', label: 'Half Day' },
  { key: 'absentDays', label: 'Absent' },
  { key: 'onLeaveDays', label: 'Leave' },
  { key: 'holidayDays', label: 'Holiday' },
  { key: 'weekOffDays', label: 'Week Off' },
  { key: 'lateDays', label: 'Late' },
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

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
  const todayISO = toISODate(now)
  const summary = getMonthly.data?.summary

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Typography variant="h6">{monthLabel}</Typography>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={goToPrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={goToNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {summary && (
        <div className="flex flex-wrap gap-2">
          {SUMMARY_ROWS.map(({ key, label }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-body"
            >
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
          <div className="grid grid-cols-7 gap-px bg-border p-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-surface" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-border p-px">
            {cells.map((cell, index) => {
              if (!cell.date || !cell.iso) {
                return <div key={index} className="h-20 bg-surface/40" />
              }
              const day = calendarByDate.get(cell.iso)
              const isToday = cell.iso === todayISO

              return (
                <div
                  key={index}
                  className={`flex h-20 flex-col gap-1 bg-surface p-2 ${isToday ? 'ring-2 ring-inset ring-accent' : ''}`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-accent' : 'text-heading'}`}>
                    {cell.date.getDate()}
                  </span>
                  {day && (
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[day.status]}`}
                    >
                      {STATUS_LABEL[day.status]}
                    </span>
                  )}
                  {day?.totalMinutes ? (
                    <span className="text-[11px] text-body">{formatMinutes(day.totalMinutes)}</span>
                  ) : null}
                  {day?.isLate && (
                    <span className="text-[11px] font-medium text-amber-500">Late</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
