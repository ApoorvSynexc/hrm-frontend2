import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, ToggleButton, type TableColumn } from '../../../components'
import { useWorkSchedulePolicy, type WorkSchedulePolicy } from '../../../services'
import { ModuleHeader } from '../common'
import ManageWorkSchedulePolicyModal from './manage'

const PAGE_SIZE = 10

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function WorkSchedulePolicyModule() {
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<WorkSchedulePolicy | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkSchedulePolicy | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { getWorkSchedulePolicies, deleteWorkSchedulePolicy, updateWorkSchedulePolicy } =
    useWorkSchedulePolicy({ listParams: { page, limit: PAGE_SIZE } })

  const openCreate = () => {
    setEditingPolicy(null)
    setManageOpen(true)
  }

  const openEdit = (policy: WorkSchedulePolicy) => {
    setEditingPolicy(policy)
    setManageOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteWorkSchedulePolicy.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const toggleStatus = (policy: WorkSchedulePolicy) => {
    setTogglingId(policy.id)
    updateWorkSchedulePolicy.mutate(
      { id: policy.id, status: policy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const columns: TableColumn<WorkSchedulePolicy>[] = [
    {
      key: 'serial',
      header: '#',
      width: '56px',
      render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.name}
          {row.isDefault && (
            <span className="rounded-full bg-accent-bg px-2 py-0.5 text-xs font-medium text-accent">
              Default
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'workingDays',
      header: 'Working Days',
      render: (row) =>
        [...row.workingDays].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)).join(', '),
    },
    {
      key: 'hours',
      header: 'Hours',
      width: '120px',
      render: (row) => `${row.startTime} – ${row.endTime}`,
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (row) => (
        <ToggleButton
          size="sm"
          checked={row.status === 'ACTIVE'}
          loading={togglingId === row.id}
          onChange={() => toggleStatus(row)}
          label={`Toggle status for ${row.name}`}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '110px',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit ${row.name}`}
            onClick={() => openEdit(row)}
            className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${row.name}`}
            onClick={() => setDeleteTarget(row)}
            disabled={row.isDefault}
            className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-body"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <ModuleHeader
        title="Work Schedule Policies"
        description="Configure standard working days and hours for employee groups."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Policy
          </Button>
        }
      />
      <Table
        columns={columns}
        data={getWorkSchedulePolicies.data?.policies ?? []}
        rowKey={(row) => row.id}
        loading={getWorkSchedulePolicies.isLoading}
        emptyMessage="No work schedule policies added yet."
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalItems={getWorkSchedulePolicies.data?.meta.totalRecords ?? 0}
      />

      <ManageWorkSchedulePolicyModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        policy={editingPolicy}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Work Schedule Policy"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteWorkSchedulePolicy.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
