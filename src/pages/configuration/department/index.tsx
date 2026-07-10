import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, ToggleButton, type TableColumn } from '../../../components'
import { useDepartment, type Department } from '../../../services'
import { ModuleHeader } from '../common'
import ManageDepartmentModal from './manage'

const PAGE_SIZE = 10

export default function DepartmentModule() {
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { getDepartments, deleteDepartment, updateDepartment } = useDepartment({
    listParams: { page, limit: PAGE_SIZE },
  })

  const openCreate = () => {
    setEditingDepartment(null)
    setManageOpen(true)
  }

  const openEdit = (department: Department) => {
    setEditingDepartment(department)
    setManageOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteDepartment.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const toggleStatus = (department: Department) => {
    setTogglingId(department.id)
    updateDepartment.mutate(
      { id: department.id, status: department.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const columns: TableColumn<Department>[] = [
    {
      key: 'serial',
      header: '#',
      width: '56px',
      render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    { key: 'name', header: 'Department' },
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
        title="Departments"
        description="Organize employees into departments across your company."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Department
          </Button>
        }
      />
      <Table
        columns={columns}
        data={getDepartments.data?.departments ?? []}
        rowKey={(row) => row.id}
        loading={getDepartments.isLoading}
        emptyMessage="No departments added yet."
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalItems={getDepartments.data?.meta.totalRecords ?? 0}
      />

      <ManageDepartmentModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        department={editingDepartment}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteDepartment.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
