import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, ToggleButton, type TableColumn } from '../../../components'
import { useAttendancePolicy, type AttendancePolicy } from '../../../services'
import { ModuleHeader } from '../common'
import ManageAttendancePolicyModal from './manage'

const PAGE_SIZE = 10

const POLICY_TYPE_LABEL: Record<AttendancePolicy['policyType'], string> = {
  STRICT: 'Strict',
  FLEXIBLE: 'Flexible',
}

export default function AttendancePolicyModule() {
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AttendancePolicy | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { getAttendancePolicies, deleteAttendancePolicy, updateAttendancePolicy } =
    useAttendancePolicy({ listParams: { page, limit: PAGE_SIZE } })

  const openCreate = () => {
    setEditingPolicy(null)
    setManageOpen(true)
  }

  const openEdit = (policy: AttendancePolicy) => {
    setEditingPolicy(policy)
    setManageOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteAttendancePolicy.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const toggleStatus = (policy: AttendancePolicy) => {
    setTogglingId(policy.id)
    updateAttendancePolicy.mutate(
      { id: policy.id, status: policy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const columns: TableColumn<AttendancePolicy>[] = [
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
      key: 'policyType',
      header: 'Type',
      width: '100px',
      render: (row) => POLICY_TYPE_LABEL[row.policyType],
    },
    {
      key: 'radiusMeters',
      header: 'Radius',
      width: '100px',
      render: (row) => `${row.radiusMeters} m`,
    },
    {
      key: 'wifiSsids',
      header: 'WiFi SSIDs',
      render: (row) => (row.wifiSsids.length > 0 ? row.wifiSsids.join(', ') : '—'),
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
        title="Attendance Policies"
        description="Define geofencing, WiFi, and clock-in rules for attendance tracking."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Policy
          </Button>
        }
      />
      <Table
        columns={columns}
        data={getAttendancePolicies.data?.policies ?? []}
        rowKey={(row) => row.id}
        loading={getAttendancePolicies.isLoading}
        emptyMessage="No attendance policies added yet."
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalItems={getAttendancePolicies.data?.meta.totalRecords ?? 0}
      />

      <ManageAttendancePolicyModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        policy={editingPolicy}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Attendance Policy"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteAttendancePolicy.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
