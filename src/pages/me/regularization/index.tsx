import { useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { Button, Card, ConfirmDialog, Table, Typography, type TableColumn } from '../../../components'
import { useSession } from '../../../hooks'
import { useRegularization, type Regularization } from '../../../services'
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
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
      render: (row) => formatDate(row.date),
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
          <button
            type="button"
            aria-label={`Withdraw regularization request for ${formatDate(row.date)}`}
            onClick={() => setWithdrawTarget(row)}
            className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-red-500"
          >
            <FiX size={15} />
          </button>
        ) : null,
    },
  ]

  const balance = getBalance.data

  return (
    <div className="flex flex-col gap-4">
      <Card
        title="Regularization Balance"
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={() => setManageOpen(true)}>
            Request Regularization
          </Button>
        }
      >
        {balance ? (
          <div className="flex gap-8">
            <div>
              <Typography variant="body-sm" color="body">
                Remaining
              </Typography>
              <Typography variant="h5">{balance.remainingDays}</Typography>
            </div>
            <div>
              <Typography variant="body-sm" color="body">
                Used
              </Typography>
              <Typography variant="h5">{balance.usedDays}</Typography>
            </div>
            <div>
              <Typography variant="body-sm" color="body">
                Total
              </Typography>
              <Typography variant="h5">{balance.totalDays}</Typography>
            </div>
          </div>
        ) : (
          <Typography variant="body-sm" color="body">
            No regularization balance set up for this year yet.
          </Typography>
        )}
      </Card>

      <Card title="My Requests">
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
      </Card>

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
