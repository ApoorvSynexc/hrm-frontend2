import { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import {
  BalanceLedgerModal,
  Button,
  Card,
  ConfirmDialog,
  Table,
  Typography,
  type BalanceLedgerConfig,
  type TableColumn,
} from '../../../components'
import { useSession } from '../../../hooks'
import { useLeave, type Leave } from '../../../services'
import { formatDate } from '../../../utils/date'
import ManageLeaveModal from './manage'

const PAGE_SIZE = 10

const STATUS_LABEL: Record<Leave['status'], string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Cancelled',
  DELETED: 'Deleted',
}

const STATUS_COLOR: Record<Leave['status'], string> = {
  PENDING: 'bg-amber-500/15 text-amber-500',
  APPROVED: 'bg-green-500/15 text-green-500',
  REJECTED: 'bg-red-500/15 text-red-500',
  WITHDRAWN: 'bg-surface-2 text-body',
  CANCELLED: 'bg-surface-2 text-body',
  DELETED: 'bg-surface-2 text-body',
}

export default function Leave() {
  const { user } = useSession()
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState<Leave | null>(null)
  const [ledgerConfig, setLedgerConfig] = useState<BalanceLedgerConfig | null>(null)

  const { getBalances, getLeaves, withdrawLeave } = useLeave({
    listParams: user ? { userId: user.id, page, limit: PAGE_SIZE } : undefined,
  })

  const balances = getBalances.data ?? []
  const leaveTypeName = (leave: Leave) =>
    leave.leaveType?.name ?? balances.find((b) => b.leaveTypeId === leave.leaveTypeId)?.leaveType?.name ?? '—'

  const confirmWithdraw = () => {
    if (!withdrawTarget) return
    withdrawLeave.mutate(withdrawTarget.id, { onSuccess: () => setWithdrawTarget(null) })
  }

  const columns: TableColumn<Leave>[] = [
    {
      key: 'type',
      header: 'Leave Type',
      render: (row) => leaveTypeName(row),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (row) =>
        row.startDate.slice(0, 10) === row.endDate.slice(0, 10)
          ? formatDate(row.startDate)
          : `${formatDate(row.startDate)} – ${formatDate(row.endDate)}`,
    },
    {
      key: 'amount',
      header: 'Days',
      render: (row) => row.amount,
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

  return (
    <div className="flex flex-col gap-4">
      <Card
        title="Leave Balance"
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={() => setManageOpen(true)}>
            Apply Leave
          </Button>
        }
      >
        {balances.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {balances.map((balance) => (
              <button
                key={balance.id}
                type="button"
                onClick={() =>
                  setLedgerConfig({
                    type: 'leave',
                    leaveTypeId: balance.leaveTypeId,
                    title: `${balance.leaveType?.name ?? 'Leave'} Usage`,
                  })
                }
                className="rounded-lg border border-border p-3 text-left transition-colors hover:border-accent"
              >
                <Typography variant="body-sm" color="body" className="truncate">
                  {balance.leaveType?.name ?? balance.leaveTypeId}
                </Typography>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <Typography variant="h5">{balance.remainingDays}</Typography>
                  <Typography variant="caption" color="body">
                    / {balance.totalDays} days
                  </Typography>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Typography variant="body-sm" color="body">
            No leave balances set up for this year yet.
          </Typography>
        )}
      </Card>

      <Card title="My Requests">
        <Table
          columns={columns}
          data={getLeaves.data?.leaves ?? []}
          rowKey={(row) => row.id}
          loading={getLeaves.isLoading}
          emptyMessage="No leave requests yet."
          pagination
          page={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={getLeaves.data?.meta.totalRecords ?? 0}
        />
      </Card>

      <ManageLeaveModal open={manageOpen} onClose={() => setManageOpen(false)} balances={balances} />

      <BalanceLedgerModal open={Boolean(ledgerConfig)} onClose={() => setLedgerConfig(null)} config={ledgerConfig} />

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        title="Withdraw Leave Request"
        message={`Are you sure you want to withdraw your leave request starting ${
          withdrawTarget ? formatDate(withdrawTarget.startDate) : ''
        }?`}
        confirmLabel="Withdraw"
        loading={withdrawLeave.isPending}
        onConfirm={confirmWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />
    </div>
  )
}
