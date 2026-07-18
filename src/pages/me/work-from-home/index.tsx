import { useState } from 'react'
import { FiCheckCircle, FiClock, FiPieChart, FiPlus } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, Typography, type TableColumn } from '../../../components'
import { useSession } from '../../../hooks'
import { useWorkFromHome, type WorkFromHome } from '../../../services'
import { formatDate } from '../../../utils/date'
import { computeRequestedDays } from './helpers'
import ManageWorkFromHomeModal from './manage'

const PAGE_SIZE = 10

const STATUS_LABEL: Record<WorkFromHome['status'], string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Cancelled',
  DELETED: 'Deleted',
}

const STATUS_COLOR: Record<WorkFromHome['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-500',
  APPROVED: 'bg-green-500/15 text-green-500',
  REJECTED: 'bg-red-500/15 text-red-500',
  WITHDRAWN: 'bg-surface-2 text-body',
  CANCELLED: 'bg-surface-2 text-body',
  DELETED: 'bg-surface-2 text-body',
}

const DAY_PART_LABEL: Record<WorkFromHome['startDateDayPart'], string> = {
  FULL_DAY: 'Full Day',
  FIRST_HALF: 'First Half',
  SECOND_HALF: 'Second Half',
}

function BalanceTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent}`}>
        {icon}
      </div>
      <div>
        <Typography variant="caption" color="body" className="block">
          {label}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </div>
    </div>
  )
}

export default function WorkFromHomePage() {
  const { user } = useSession()
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState<WorkFromHome | null>(null)

  const { getBalance, getWorkFromHomes, withdrawWorkFromHome } = useWorkFromHome({
    listParams: user ? { userId: user.id, page, limit: PAGE_SIZE } : undefined,
  })

  const confirmWithdraw = () => {
    if (!withdrawTarget) return
    withdrawWorkFromHome.mutate(withdrawTarget.id, { onSuccess: () => setWithdrawTarget(null) })
  }

  const columns: TableColumn<WorkFromHome>[] = [
    {
      key: 'dates',
      header: 'Dates',
      render: (row) => (
        <span className="font-medium text-heading">
          {row.startDate.slice(0, 10) === row.endDate.slice(0, 10)
            ? formatDate(row.startDate)
            : `${formatDate(row.startDate)} – ${formatDate(row.endDate)}`}
        </span>
      ),
    },
    {
      key: 'dayPart',
      header: 'Day Part',
      render: (row) =>
        row.startDateDayPart === row.endDateDayPart
          ? DAY_PART_LABEL[row.startDateDayPart]
          : `${DAY_PART_LABEL[row.startDateDayPart]} → ${DAY_PART_LABEL[row.endDateDayPart]}`,
    },
    {
      key: 'days',
      header: 'Days',
      render: (row) => computeRequestedDays(row.startDate, row.endDate, row.startDateDayPart, row.endDateDayPart),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => <span className="line-clamp-2 max-w-xs">{row.reason ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[row.status]}`}>
          {STATUS_LABEL[row.status]}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) =>
        row.status === 'PENDING' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setWithdrawTarget(row)}
            className="!border-red-500/40 !text-red-500 hover:!bg-red-500/10"
          >
            Withdraw
          </Button>
        ) : null,
    },
  ]

  const balance = getBalance.data

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h6">Work From Home</Typography>
          <Typography variant="body-sm" color="body">
            Request to work remotely for a day or a date range.
          </Typography>
        </div>
        <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={() => setManageOpen(true)}>
          Request Work From Home
        </Button>
      </div>

      {balance ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BalanceTile
            icon={<FiCheckCircle size={18} />}
            label="Remaining"
            value={balance.remainingDays}
            accent="bg-green-500/15 text-green-500"
          />
          <BalanceTile
            icon={<FiClock size={18} />}
            label="Used"
            value={balance.usedDays}
            accent="bg-amber-500/15 text-amber-500"
          />
          <BalanceTile
            icon={<FiPieChart size={18} />}
            label="Total Allowance"
            value={balance.totalDays}
            accent="bg-accent-bg text-accent"
          />
        </div>
      ) : (
        <Typography variant="body-sm" color="body">
          No work-from-home balance set up for this year yet.
        </Typography>
      )}

      <div>
        <Typography variant="overline" color="body" className="mb-2 block">
          My Requests
        </Typography>
        <Table
          columns={columns}
          data={getWorkFromHomes.data?.requests ?? []}
          rowKey={(row) => row.id}
          loading={getWorkFromHomes.isLoading}
          emptyMessage="No work-from-home requests yet."
          pagination
          page={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={getWorkFromHomes.data?.meta.totalRecords ?? 0}
        />
      </div>

      <ManageWorkFromHomeModal open={manageOpen} onClose={() => setManageOpen(false)} balance={balance ?? null} />

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        title="Withdraw Request"
        message={`Are you sure you want to withdraw your work-from-home request starting ${
          withdrawTarget ? formatDate(withdrawTarget.startDate) : ''
        }?`}
        confirmLabel="Withdraw"
        loading={withdrawWorkFromHome.isPending}
        onConfirm={confirmWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />
    </div>
  )
}
