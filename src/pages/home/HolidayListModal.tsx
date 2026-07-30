import { useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Modal, Typography } from '../../components'
import type { Holiday } from '../../services'
import { dayjs } from '../../utils/date'

/**
 * One fixed color per calendar month (Jan..Dec) for the month/day badge —
 * solid hex so it stays legible against the badge's white-text header
 * regardless of light/dark theme (same reasoning as STATUS_HEX in the
 * Attendance calendar: Tailwind's palette-100/700 pairs don't adapt well
 * across themes, so colors that must render as-is go inline).
 */
const MONTH_HEX = [
  '#0d9488', // Jan
  '#0284c7', // Feb
  '#7c3aed', // Mar
  '#2563eb', // Apr
  '#d97706', // May
  '#059669', // Jun
  '#65a30d', // Jul
  '#0891b2', // Aug
  '#0d9488', // Sep
  '#e11d48', // Oct
  '#b45309', // Nov
  '#4f46e5', // Dec
]

type HolidayListModalProps = {
  open: boolean
  onClose: () => void
  holidays: Holiday[]
  loading: boolean
}

export function HolidayListModal({ open, onClose, holidays, loading }: HolidayListModalProps) {
  const [year, setYear] = useState(() => dayjs().year())

  const yearHolidays = useMemo(
    () => holidays.filter((h) => h.year === year).sort((a, b) => a.date.localeCompare(b.date)),
    [holidays, year],
  )
  const midpoint = Math.ceil(yearHolidays.length / 2)
  const leftColumn = yearHolidays.slice(0, midpoint)
  const rightColumn = yearHolidays.slice(midpoint)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Holidays"
      size="xl"
      headerExtra={
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous year"
            onClick={() => setYear((y) => y - 1)}
            className="flex h-6 w-6 items-center justify-center rounded text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiChevronLeft size={14} />
          </button>
          <Typography variant="body-sm" className="w-10 text-center font-medium text-heading">
            {year}
          </Typography>
          <button
            type="button"
            aria-label="Next year"
            onClick={() => setYear((y) => y + 1)}
            className="flex h-6 w-6 items-center justify-center rounded text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-surface-2" />
          ))}
        </div>
      ) : yearHolidays.length === 0 ? (
        <Typography variant="body-sm" color="body" className="py-6 text-center">
          No holidays recorded for {year}.
        </Typography>
      ) : (
        <div className="grid h-[420px] grid-cols-1 content-start gap-x-8 gap-y-4 overflow-y-auto sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            {leftColumn.map((holiday) => (
              <HolidayRow key={holiday.id} holiday={holiday} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {rightColumn.map((holiday) => (
              <HolidayRow key={holiday.id} holiday={holiday} />
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}

function HolidayRow({ holiday }: { holiday: Holiday }) {
  const date = dayjs(holiday.date)

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-14 shrink-0 flex-col overflow-hidden rounded-lg border border-border text-center">
        <div
          className="py-1 text-[10px] font-bold tracking-wide text-white uppercase"
          style={{ backgroundColor: MONTH_HEX[date.month()] }}
        >
          {date.format('MMM')}
        </div>
        <div className="bg-surface py-1.5 text-lg font-bold text-heading">{date.format('DD')}</div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="truncate text-sm font-semibold text-heading">{holiday.name}</p>
          {holiday.restrictionType === 'RESTRICTED' && (
            <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium tracking-wide text-body uppercase">
              Restricted
            </span>
          )}
        </div>
        <p className="text-xs text-body">{date.format('dddd')}</p>
      </div>
    </div>
  )
}
