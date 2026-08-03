import { FiCalendar } from 'react-icons/fi'
import { useSession } from '../../hooks'
import { useLeave, useRegularization, useWorkFromHome } from '../../services'
import { formatDate } from '../../utils/date'
import { Modal } from '../Modal'
import { Typography } from '../Typography'

export type LedgerType = 'leave' | 'wfh' | 'regularization'

export type BalanceLedgerConfig = {
  type: LedgerType
  title: string
  /** Leave only — scopes the ledger to a single leave type instead of all of them. */
  leaveTypeId?: string
}

type LedgerTransactionType = 'CREDIT' | 'DEBIT' | 'ADJUSTMENT' | 'CARRY_FORWARD'

type LedgerRow = {
  id: string
  dateLabel: string
  amount: number
  detail: string
  reason: string | null
  /** WFH/Regularization only — real ledger entries carry a CREDIT/DEBIT direction; Leave rows are always usage (debit-like). */
  transactionType?: LedgerTransactionType
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

/**
 * Read-only ledger for a Leave/WFH/Regularization balance — "where did my
 * days go." WFH and Regularization balances come back with their ledger
 * embedded (`getBalance().ledger`) — no separate ledger endpoint — so those
 * two just read off the same balance query every other display on the page
 * already uses (shared cache, no extra request). Leave balances don't carry
 * an embedded ledger, so that one is still derived from the APPROVED-status
 * leave list. Fetches only while open, so it can be dropped anywhere a
 * balance number is shown (Home's My Balances card, the
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
  const { getBalance: getWfhBalance } = useWorkFromHome()
  const { getBalance: getRegularizationBalance } = useRegularization()

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
    isLoading = getWfhBalance.isLoading
    rows = (getWfhBalance.data?.ledger ?? [])
      .filter((entry) => entry.status === 'ACTIVE')
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((entry) => ({
        id: entry.id,
        dateLabel: formatDate(entry.createdAt),
        amount: entry.amount,
        detail: entry.description,
        reason: entry.reason,
        transactionType: entry.transactionType,
      }))
  } else {
    isLoading = getRegularizationBalance.isLoading
    rows = (getRegularizationBalance.data?.ledger ?? [])
      .filter((entry) => entry.status === 'ACTIVE')
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((entry) => ({
        id: entry.id,
        dateLabel: formatDate(entry.createdAt),
        amount: entry.amount,
        detail: entry.description,
        reason: entry.reason,
        transactionType: entry.transactionType,
      }))
  }

  const isCredit = (row: LedgerRow) => row.transactionType === 'CREDIT'
  const totalUsed = rows.filter((row) => !isCredit(row)).reduce((sum, row) => sum + row.amount, 0)
  const totalCredited = rows.filter(isCredit).reduce((sum, row) => sum + row.amount, 0)

  return (
    <Modal open={open} onClose={onClose} title={config.title} size="lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center justify-between rounded-lg bg-surface-2 px-4 py-2.5">
            <Typography variant="body-sm" color="body">
              Total used
            </Typography>
            <Typography variant="h6">{formatDays(totalUsed)} days</Typography>
          </div>
          {totalCredited > 0 && (
            <div className="flex flex-1 items-center justify-between rounded-lg bg-surface-2 px-4 py-2.5">
              <Typography variant="body-sm" color="body">
                Total allocated
              </Typography>
              <Typography variant="h6">{formatDays(totalCredited)} days</Typography>
            </div>
          )}
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
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isCredit(row) ? 'bg-green-500/15 text-green-500' : 'bg-accent-bg text-accent'
                  }`}
                >
                  {isCredit(row) ? '+' : '-'}
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
