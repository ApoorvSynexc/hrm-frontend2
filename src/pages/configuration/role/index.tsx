import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, ToggleButton, type TableColumn } from '../../../components'
import { useRole, type Role } from '../../../services'
import { ModuleHeader } from '../common'
import ManageRoleModal from './manage'

const PAGE_SIZE = 10

export default function RoleModule() {
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { getRoles, deleteRole, updateRole } = useRole({ listParams: { page, limit: PAGE_SIZE } })

  const toggleStatus = (role: Role) => {
    setTogglingId(role.id)
    updateRole.mutate(
      { id: role.id, status: role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const openCreate = () => {
    setEditingRole(null)
    setManageOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditingRole(role)
    setManageOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteRole.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const columns: TableColumn<Role>[] = [
    { key: 'name', header: 'Role' },
    {
      key: 'description',
      header: 'Description',
      render: (row) => row.description || '—',
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
        title="Roles"
        description="Define roles like HR Manager or Employee that group a set of permissions."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Role
          </Button>
        }
      />
      <Table
        columns={columns}
        data={getRoles.data?.roles ?? []}
        rowKey={(row) => row.id}
        loading={getRoles.isLoading}
        emptyMessage="No roles added yet."
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalItems={getRoles.data?.meta.totalRecords ?? 0}
      />

      <ManageRoleModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        role={editingRole}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Role"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteRole.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
