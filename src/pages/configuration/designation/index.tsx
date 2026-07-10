import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, ToggleButton, type TableColumn } from '../../../components'
import { useDesignation, type Designation } from '../../../services'
import { ModuleHeader } from '../common'
import ManageDesignationModal from './manage'

const PAGE_SIZE = 10

export default function DesignationModule() {
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Designation | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { getDesignations, deleteDesignation, updateDesignation } = useDesignation({
    listParams: { page, limit: PAGE_SIZE },
  })

  const openCreate = () => {
    setEditingDesignation(null)
    setManageOpen(true)
  }

  const openEdit = (designation: Designation) => {
    setEditingDesignation(designation)
    setManageOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteDesignation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const toggleStatus = (designation: Designation) => {
    setTogglingId(designation.id)
    updateDesignation.mutate(
      { id: designation.id, status: designation.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const columns: TableColumn<Designation>[] = [
    {
      key: 'serial',
      header: '#',
      width: '56px',
      render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    { key: 'name', header: 'Designation' },
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
        title="Designations"
        description="Define job titles like Software Engineer or HR Manager for your organization."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Designation
          </Button>
        }
      />
      <Table
        columns={columns}
        data={getDesignations.data?.designations ?? []}
        rowKey={(row) => row.id}
        loading={getDesignations.isLoading}
        emptyMessage="No designations added yet."
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalItems={getDesignations.data?.meta.totalRecords ?? 0}
      />

      <ManageDesignationModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        designation={editingDesignation}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Designation"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteDesignation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
