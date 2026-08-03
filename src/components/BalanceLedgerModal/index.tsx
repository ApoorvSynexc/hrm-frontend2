import { FiCalendar } from 'react-icons/fi'
import { useSession } from '../../hooks'
import { useLeave, useRegularization, useWorkFromHome, type WorkFromHomeDayPart } from '../../services'
import { dayjs, formatDate } from '../../utils/date'
import { Modal } from '../Modal'
import { Typography } from '../Typography'

export type LedgerType = 'leave' | 'wfh' | 'regularization'

export type BalanceLedgerConfig = {
  type: LedgerType
  title: string
  /** Leave only — scopes the ledger to a single leave type instead of all of them. */
  leaveTypeId?: string
}

type LedgerRow = {
  id: string
  dateLabel: string
  amount: number
  detail: string
  reason: string | null
}

/** "1" / "0.5" — day amounts are always in half-day increments here. */
function formatDays(amount: number): string {
  return amount % 1 === 0 ? String(amount) : amount.toFixed(1)
}

function dateRangeLabel(startDate: string, endDate: string): string {
  return startDate.slice(0, 10) === endDate.slice(0, 10)
    ? formatDate(startDate)
    : `${formatDate(startDate)} – ${formatDate(endDate)}`
}

const DAY_PART_FRACTION: Record<'FIRST_HALF' | 'SECOND_HALF' | 'FULL_DAY', number> = {
  FULL_DAY: 1,
  FIRST_HALF: 0.5,
  SECOND_HALF: 0.5,
}

/**
 * Mirrors computeRequestedDays in pages/me/work-from-home/helpers.ts — the
 * backend never persists WorkFromHome.amount (see WorkFromHome type), so the
 * day count has to be derived from the range + day-parts here too. Kept as a
 * local copy rather than importing across the pages→components boundary.
 */
function computeWfhDays(
  startDate: string,
  endDate: string,
  startDateDayPart: WorkFromHomeDayPart,
  endDateDayPart: WorkFromHomeDayPart,
): number {
  const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1
  if (totalDays <= 1) {
    return startDateDayPart !== 'FULL_DAY' || endDateDayPart !== 'FULL_DAY' ? 0.5 : 1
  }
  let days = totalDays
  if (startDateDayPart !== 'FULL_DAY') days -= 0.5
  if (endDateDayPart !== 'FULL_DAY') days -= 0.5
  return days
}

/**
 * Read-only usage history for a Leave/WFH/Regularization balance — "where did
 * my used days go." Fetches its own APPROVED-status data (each request type's
 * own list endpoint) scoped to the logged-in user, only while open, so it can
 * be dropped anywhere a balance number is shown (Home's My Balances card, the
 * Leave/WFH/Regularization tabs) without callers managing the fetch.
 */
export function BalanceLedgerModal({
  open,
  onClose,
  config,
}: {
  open: boolean
  onClose: () => void
  config: BalanceLedgerConfig | null
}) {
  const { user } = useSession()
  const userId = user?.id
  const isActive = open && Boolean(userId) && Boolean(config)

  const { getLeaves } = useLeave({
    listParams:
      isActive && config?.type === 'leave' && userId
        ? { userId, page: 1, limit: 100, status: 'APPROVED' }
        : undefined,
  })
  const { getWorkFromHomes } = useWorkFromHome({
    listParams:
      isActive && config?.type === 'wfh' && userId
        ? { userId, page: 1, limit: 100, status: 'APPROVED' }
        : undefined,
  })
  const { getRegularizations } = useRegularization({
    listParams:
      isActive && config?.type === 'regularization' && userId
        ? { userId, page: 1, limit: 100, status: 'APPROVED' }
        : undefined,
  })

  if (!config) return null

  let rows: LedgerRow[] = []
  let isLoading = false

  if (config.type === 'leave') {
    isLoading = getLeaves.isLoading
    rows = (getLeaves.data?.leaves ?? [])
      .filter((leave) => !config.leaveTypeId || leave.leaveTypeId === config.leaveTypeId)
      .map((leave) => ({
        id: leave.id,
        dateLabel: dateRangeLabel(leave.startDate, leave.endDate),
        amount: leave.amount,
        detail: leave.leaveType?.name ?? 'Leave',
        reason: leave.reason,
      }))
  } else if (config.type === 'wfh') {
    isLoading = getWorkFromHomes.isLoading
    rows = (getWorkFromHomes.data?.requests ?? []).map((wfh) => ({
      id: wfh.id,
      dateLabel: dateRangeLabel(wfh.startDate, wfh.endDate),
      amount: computeWfhDays(wfh.startDate, wfh.endDate, wfh.startDateDayPart, wfh.endDateDayPart),
      detail: 'Work From Home',
      reason: wfh.reason,
    }))
  } else {
    isLoading = getRegularizations.isLoading
    rows = (getRegularizations.data?.requests ?? []).map((reg) => ({
      id: reg.id,
      dateLabel: formatDate(reg.date),
      amount: DAY_PART_FRACTION[reg.dayPart],
      detail: reg.dayPart === 'FULL_DAY' ? 'Full Day' : reg.dayPart === 'FIRST_HALF' ? 'First Half' : 'Second Half',
      reason: reg.reason,
    }))
  }

  const totalUsed = rows.reduce((sum, row) => sum + row.amount, 0)

  return (
    <Modal open={open} onClose={onClose} title={config.title} size="lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-2.5">
          <Typography variant="body-sm" color="body">
            Total used
          </Typography>
          <Typography variant="h6">{formatDays(totalUsed)} days</Typography>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-surface-2" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-bg text-accent">
              <FiCalendar size={22} />
            </span>
            <Typography variant="h6">No usage yet</Typography>
            <Typography variant="body-sm" color="body">
              Approved requests will show up here.
            </Typography>
          </div>
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {rows.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Typography variant="body-sm" className="font-medium text-heading">
                    {row.dateLabel}
                  </Typography>
                  <Typography variant="caption" color="body" className="mt-0.5 block">
                    {row.detail}
                    {row.reason ? ` · ${row.reason}` : ''}
                  </Typography>
                </div>
                <span className="shrink-0 rounded-full bg-accent-bg px-2.5 py-1 text-xs font-semibold text-accent">
                  {formatDays(row.amount)} {row.amount === 1 ? 'day' : 'days'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
