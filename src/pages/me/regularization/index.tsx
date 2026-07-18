import { useState } from 'react'
import { FiCheckCircle, FiClock, FiPieChart, FiPlus } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, Typography, type TableColumn } from '../../../components'
import { useSession } from '../../../hooks'
import { useRegularization, type Regularization } from '../../../services'
import { formatDate, formatTime } from '../../../utils/date'
import ManageRegularizationModal from './manage'

const PAGE_SIZE = 10

const STATUS_LABEL: Record<Regularization['status'], string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Cancelled',
  DELETED: 'Deleted',
}

const STATUS_COLOR: Record<Regularization['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-500',
  APPROVED: 'bg-green-500/15 text-green-500',
  REJECTED: 'bg-red-500/15 text-red-500',
  WITHDRAWN: 'bg-surface-2 text-body',
  CANCELLED: 'bg-surface-2 text-body',
  DELETED: 'bg-surface-2 text-body',
}

const DAY_PART_LABEL: Record<Regularization['dayPart'], string> = {
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

export default function Regularization() {
  const { user } = useSession()
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState<Regularization | null>(null)

  const { getBalance, getRegularizations, withdrawRegularization } = useRegularization({
    listParams: user ? { userId: user.id, page, limit: PAGE_SIZE } : undefined,
  })

  const confirmWithdraw = () => {
    if (!withdrawTarget) return
    withdrawRegularization.mutate(withdrawTarget.id, { onSuccess: () => setWithdrawTarget(null) })
  }

  const columns: TableColumn<Regularization>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="font-medium text-heading">{formatDate(row.date)}</span>,
    },
    {
      key: 'dayPart',
      header: 'Day Part',
      render: (row) => DAY_PART_LABEL[row.dayPart],
    },
    {
      key: 'requested',
      header: 'Requested Time',
      render: (row) => `${formatTime(row.requestedCheckIn)} – ${formatTime(row.requestedCheckOut)}`,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => <span className="line-clamp-2 max-w-xs">{row.reason}</span>,
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
          <Typography variant="h6">Regularization</Typography>
          <Typography variant="body-sm" color="body">
            Request corrections for missed or incorrect check-ins and check-outs.
          </Typography>
        </div>
        <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={() => setManageOpen(true)}>
          Request Regularization
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
          No regularization balance set up for this year yet.
        </Typography>
      )}

      <div>
        <Typography
          variant="overline"
          color="body"
          className="mb-2 block"
        >
          My Requests
        </Typography>
        <Table
          columns={columns}
          data={getRegularizations.data?.requests ?? []}
          rowKey={(row) => row.id}
          loading={getRegularizations.isLoading}
          emptyMessage="No regularization requests yet."
          pagination
          page={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={getRegularizations.data?.meta.totalRecords ?? 0}
        />
      </div>

      <ManageRegularizationModal open={manageOpen} onClose={() => setManageOpen(false)} />

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        title="Withdraw Request"
        message={`Are you sure you want to withdraw your regularization request for ${
          withdrawTarget ? formatDate(withdrawTarget.date) : ''
        }?`}
        confirmLabel="Withdraw"
        loading={withdrawRegularization.isPending}
        onConfirm={confirmWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />
    </div>
  )
}
