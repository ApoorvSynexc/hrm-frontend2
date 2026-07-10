import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, ToggleButton, type TableColumn } from '../../../components'
import { useLeaveType, type LeaveType } from '../../../services'
import { ModuleHeader } from '../common'
import ManageLeaveTypeModal from './manage'

const PAGE_SIZE = 10

const GENDER_LABEL: Record<LeaveType['applicableGender'], string> = {
  BOTH: 'Both',
  MALE: 'Male',
  FEMALE: 'Female',
}

export default function LeaveTypeModule() {
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LeaveType | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { getLeaveTypes, deleteLeaveType, updateLeaveType } = useLeaveType({
    listParams: { page, limit: PAGE_SIZE },
  })

  const openCreate = () => {
    setEditingLeaveType(null)
    setManageOpen(true)
  }

  const openEdit = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType)
    setManageOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteLeaveType.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const toggleStatus = (leaveType: LeaveType) => {
    setTogglingId(leaveType.id)
    updateLeaveType.mutate(
      { id: leaveType.id, status: leaveType.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const columns: TableColumn<LeaveType>[] = [
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
          <span
            className="h-3 w-3 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: row.color ?? undefined }}
          />
          {row.name}
        </div>
      ),
    },
    { key: 'code', header: 'Code', width: '100px' },
    {
      key: 'applicableGender',
      header: 'Applicable Gender',
      width: '150px',
      render: (row) => GENDER_LABEL[row.applicableGender],
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
            className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-red-500"
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
        title="Leave Types"
        description="Set up the categories of leave employees can request, e.g. Sick, Casual, Earned."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Leave Type
          </Button>
        }
      />
      <Table
        columns={columns}
        data={getLeaveTypes.data?.leaveTypes ?? []}
        rowKey={(row) => row.id}
        loading={getLeaveTypes.isLoading}
        emptyMessage="No leave types added yet."
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalItems={getLeaveTypes.data?.meta.totalRecords ?? 0}
      />

      <ManageLeaveTypeModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        leaveType={editingLeaveType}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Leave Type"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteLeaveType.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
