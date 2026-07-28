import { useState } from 'react'
import { FiEdit2, FiFile, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, ToggleButton, type TableColumn } from '../../../components'
import { useDocumentPolicy, type DocumentPolicy } from '../../../services'
import { ModuleHeader } from '../common'
import ManageDocumentPolicyModal from './manage'

const PAGE_SIZE = 10

/** "2.3 MB" / "512 B" */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentPolicyModule() {
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<DocumentPolicy | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentPolicy | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { getDocumentPolicies, deleteDocumentPolicy, updateDocumentPolicy } = useDocumentPolicy({
    listParams: { page, limit: PAGE_SIZE },
  })

  const openCreate = () => {
    setEditingPolicy(null)
    setManageOpen(true)
  }

  const openEdit = (policy: DocumentPolicy) => {
    setEditingPolicy(policy)
    setManageOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteDocumentPolicy.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const toggleStatus = (policy: DocumentPolicy) => {
    setTogglingId(policy.id)
    updateDocumentPolicy.mutate(
      { id: policy.id, status: policy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const columns: TableColumn<DocumentPolicy>[] = [
    {
      key: 'serial',
      header: '#',
      width: '56px',
      render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    { key: 'name', header: 'Name' },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="line-clamp-2 max-w-xs">{row.description ?? '—'}</span>,
    },
    {
      key: 'file',
      header: 'File',
      render: (row) => (
        <a
          href={row.media.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-1.5 text-body transition-colors hover:text-accent"
        >
          <FiFile size={14} className="shrink-0" />
          <span className="truncate">{row.media.name}</span>
          <span className="shrink-0 text-xs text-body/70">({formatFileSize(row.media.size)})</span>
        </a>
      ),
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
        title="Document Policies"
        description="Upload and manage policy documents shared with the organization."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Document Policy
          </Button>
        }
      />
      <Table
        columns={columns}
        data={getDocumentPolicies.data?.documentPolicies ?? []}
        rowKey={(row) => row.id}
        loading={getDocumentPolicies.isLoading}
        emptyMessage="No document policies added yet."
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalItems={getDocumentPolicies.data?.meta.totalRecords ?? 0}
      />

      <ManageDocumentPolicyModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        documentPolicy={editingPolicy}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Document Policy"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteDocumentPolicy.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
