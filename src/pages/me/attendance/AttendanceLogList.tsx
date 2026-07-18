import { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiLogIn, FiLogOut } from 'react-icons/fi'
import { Pagination, Typography } from '../../../components'
import type { Attendance } from '../../../services'
import { dayjs, formatMinutes, formatTime } from '../../../utils/date'
import { DAILY_TARGET_MINUTES, STATUS_BADGE, STATUS_GRADIENT, STATUS_LABEL } from './helpers'

type AttendanceLogListProps = {
  records: Attendance[]
  loading: boolean
  emptyMessage: string
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function AttendanceLogList({
  records,
  loading,
  emptyMessage,
  page,
  pageSize,
  totalItems,
  onPageChange,
}: AttendanceLogListProps) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="hidden items-center gap-4 border-b border-border bg-surface-2 px-4 py-2.5 text-xs font-medium tracking-wide text-body uppercase sm:flex">
          <span className="w-14 shrink-0">Date</span>
          <span className="w-44 shrink-0">Sessions</span>
          <span className="hidden flex-1 md:block">Hours Worked</span>
          <span className="w-24 shrink-0 text-right">Hours</span>
          <span className="hidden w-28 shrink-0 text-right md:block">Arrival</span>
          <span className="w-28 shrink-0 text-center">Status</span>
          <span className="w-5 shrink-0" />
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-surface-2" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-body">{emptyMessage}</p>
        ) : (
          records.map((row) => <AttendanceDayRow key={row.id} row={row} />)
        )}
      </div>

      {totalItems > 0 && (
        <Pagination className="mt-3" page={page} pageSize={pageSize} totalItems={totalItems} onPageChange={onPageChange} />
      )}
    </div>
  )
}

function AttendanceDayRow({ row }: { row: Attendance }) {
  const [expanded, setExpanded] = useState(false)
  const logs = [...(row.logs ?? [])].sort((a, b) => dayjs(a.checkIn).diff(dayjs(b.checkIn)))
  const hasSessions = logs.length > 0

  const dateObj = dayjs(row.firstCheckIn || row.date)
  const day = dateObj.date()
  const month = dateObj.format('MMM')
  const weekday = dateObj.format('ddd')

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => hasSessions && setExpanded((v) => !v)}
        disabled={!hasSessions}
        className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors ${
          hasSessions ? 'cursor-pointer hover:bg-surface-2' : 'cursor-default'
        }`}
      >
        <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-surface-2 py-1.5">
          <span className="text-lg leading-none font-semibold text-heading">{day}</span>
          <span className="mt-0.5 text-[10px] font-medium text-body uppercase">{month}</span>
        </div>

        <div className="w-44 min-w-0 shrink-0">
          <div className="flex items-center gap-2">
            <Typography variant="body-sm" className="font-medium text-heading">
              {weekday}
            </Typography>
            {logs.length > 1 && (
              <span className="shrink-0 rounded-full bg-accent-bg px-2 py-0.5 text-[11px] font-medium text-accent">
                {logs.length}×
              </span>
            )}
          </div>
          <Typography variant="caption" color="body" className="block truncate">
            {row.firstCheckIn
              ? `${formatTime(row.firstCheckIn)} → ${row.lastCheckOut ? formatTime(row.lastCheckOut) : 'Ongoing'}`
              : 'No check-in'}
          </Typography>
        </div>

        <div className="hidden flex-1 items-center md:flex">
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-2">
            {row.totalMinutes ? (
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${Math.min(100, Math.round((row.totalMinutes / DAILY_TARGET_MINUTES) * 100))}%`,
                  background: STATUS_GRADIENT[row.status],
                }}
              />
            ) : null}
          </div>
        </div>

        <div className="w-24 shrink-0 text-right">
          <Typography variant="body-sm" className="font-medium text-heading">
            {formatMinutes(row.totalMinutes)}
          </Typography>
        </div>

        <div className="hidden w-28 shrink-0 text-right md:block">
          {row.firstCheckIn ? (
            <span className={`text-sm font-medium ${row.isLate ? 'text-amber-500' : 'text-body'}`}>
              {formatTime(row.firstCheckIn)}
              {row.isLate ? ' · Late' : ''}
            </span>
          ) : (
            <span className="text-sm text-body">—</span>
          )}
        </div>

        <span
          className={`w-28 shrink-0 rounded-full px-2.5 py-1 text-center text-xs font-medium ${STATUS_BADGE[row.status]}`}
        >
          {STATUS_LABEL[row.status]}
        </span>

        <span className="w-5 shrink-0 text-body">
          {hasSessions ? expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} /> : null}
        </span>
      </button>

      {expanded && hasSessions && (
        <div className="border-t border-border bg-surface-2/40 px-4 py-3 pl-[4.75rem]">
          <ul className="flex flex-col gap-2.5">
            {logs.map((log, index) => (
              <li key={log.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-bg text-[11px] font-semibold text-accent">
                  {index + 1}
                </span>
                <FiLogIn size={13} className="shrink-0 text-body" />
                <span className="text-heading">{formatTime(log.checkIn)}</span>
                <span className="text-body">→</span>
                {log.checkOut ? (
                  <>
                    <FiLogOut size={13} className="shrink-0 text-body" />
                    <span className="text-heading">{formatTime(log.checkOut)}</span>
                  </>
                ) : (
                  <span className="font-medium text-accent">Ongoing</span>
                )}
                {log.durationMinutes != null && (
                  <span className="text-body">· {formatMinutes(log.durationMinutes)}</span>
                )}
                {log.checkInMethod && (
                  <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-xs text-body">
                    via {log.checkInMethod}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
