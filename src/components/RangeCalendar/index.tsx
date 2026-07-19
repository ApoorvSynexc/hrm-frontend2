import { useEffect, useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Typography } from '../Typography'
import { dayjs, daysInMonth, monthLabel, toISODate } from '../../utils/date'

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export type RangeCalendarProps = {
  startDate: string
  endDate: string
  /**
   * Airbnb-style two-click range select: call this on every day click and
   * let the caller decide anchor/reset logic (see selectDate in the Leave /
   * Work From Home modals) — the calendar itself is presentation-only.
   */
  onSelect: (iso: string) => void
  /** Re-anchors the visible month to `startDate` each time this flips true. */
  open: boolean
}

/**
 * Shared range-select month calendar used by the Leave and Work From Home
 * request modals — a start/end date pair with a connecting band, distinct
 * from Regularization's single-date MiniCalendar (which also overlays
 * per-day attendance status and has no range concept).
 */
export function RangeCalendar({ startDate, endDate, onSelect, open }: RangeCalendarProps) {
  const now = dayjs()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1) // 1-12

  // Re-anchor to the picked range's month each time the modal opens.
  useEffect(() => {
    if (!open) return
    const d = dayjs(startDate || now)
    setYear(d.year())
    setMonth(d.month() + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const cells = useMemo(() => {
    const firstOfMonth = dayjs().year(year).month(month - 1).date(1)
    const totalDays = daysInMonth(year, month)
    const leadingBlanks = firstOfMonth.day() // 0 (Sun) … 6 (Sat)

    const items: { iso: string | null; day: number | null }[] = []
    for (let i = 0; i < leadingBlanks; i++) items.push({ iso: null, day: null })
    for (let d = 1; d <= totalDays; d++) {
      items.push({ iso: toISODate(firstOfMonth.date(d)), day: d })
    }
    while (items.length % 7 !== 0) items.push({ iso: null, day: null })
    return items
  }, [year, month])

  const goToPrevMonth = () => {
    const prev = dayjs().year(year).month(month - 1).subtract(1, 'month')
    setYear(prev.year())
    setMonth(prev.month() + 1)
  }

  const goToNextMonth = () => {
    const next = dayjs().year(year).month(month - 1).add(1, 'month')
    setYear(next.year())
    setMonth(next.month() + 1)
  }

  const todayISO = toISODate(now)
  const hasRange = Boolean(startDate && endDate)

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={goToPrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition-colors hover:bg-surface-2 hover:text-heading"
        >
          <FiChevronLeft size={18} />
        </button>
        <Typography variant="h6" className="font-semibold text-heading">
          {monthLabel(year, month)}
        </Typography>
        <button
          type="button"
          aria-label="Next month"
          onClick={goToNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition-colors hover:bg-surface-2 hover:text-heading"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_HEADERS.map((label, i) => (
          <span key={i} className="pb-2 text-center text-xs font-medium text-body">
            {label}
          </span>
        ))}
        {cells.map((cell, index) => {
          if (!cell.iso) return <span key={index} />
          const isStart = cell.iso === startDate
          const isEnd = cell.iso === endDate
          const isToday = cell.iso === todayISO
          const isInBand = hasRange && cell.iso >= startDate && cell.iso <= endDate && startDate !== endDate
          const isRowStart = index % 7 === 0
          const isRowEnd = index % 7 === 6

          return (
            <div key={index} className="relative flex h-10 items-center justify-center">
              {isInBand && (
                <span
                  className={`absolute inset-y-1 left-0 right-0 bg-accent/15 ${
                    isStart || isRowStart ? 'rounded-l-full' : ''
                  } ${isEnd || isRowEnd ? 'rounded-r-full' : ''}`}
                />
              )}
              <button
                type="button"
                onClick={() => onSelect(cell.iso!)}
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                  isStart || isEnd
                    ? 'bg-accent font-semibold text-accent-fg'
                    : isToday
                      ? 'font-semibold text-accent ring-1 ring-accent'
                      : 'text-heading hover:bg-surface-2'
                }`}
              >
                {cell.day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
