import { useMemo, useState } from 'react'
import { FiEye, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, Tabs, type TableColumn } from '../../../components'
import { useRequestPolicy, type RequestPolicy, type RequestPolicyType } from '../../../services'
import { ModuleHeader } from '../common'
import ManageRequestPolicyModal from './manage'
import RequestPolicyDetailModal from './detail'

const PAGE_SIZE = 10

const TYPE_TABS = [
  { key: 'LEAVE' as const, label: 'Leave Policies' },
  { key: 'WFH' as const, label: 'WFH Policies' },
  { key: 'REGULARIZATION' as const, label: 'Regularization Policies' },
]

export default function RequestPolicyModule() {
  const [activeTab, setActiveTab] = useState<RequestPolicyType>('LEAVE')
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [viewingPolicy, setViewingPolicy] = useState<RequestPolicy | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RequestPolicy | null>(null)

  // Backend has no type filter on list, so pull a single large batch and split
  // it into Leave / WFH / Regularization tabs client-side, same pattern used
  // for Attendance/Work Schedule policies and Holiday Configuration.
  const { getRequestPolicies, deleteRequestPolicy } = useRequestPolicy({
    listParams: { page: 1, limit: 100 },
  })

  const policies = useMemo(
    () => (getRequestPolicies.data?.requestPolicies ?? []).filter((p) => p.type === activeTab),
    [getRequestPolicies.data, activeTab],
  )

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteRequestPolicy.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const columns: TableColumn<RequestPolicy>[] = [
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
      key: 'description',
      header: 'Description',
      render: (row) => row.description || '—',
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            row.status === 'ACTIVE' ? 'bg-accent-bg text-accent' : 'bg-surface-2 text-body'
          }`}
        >
          {row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
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
            aria-label={`View ${row.name}`}
            onClick={() => setViewingPolicy(row)}
            className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiEye size={15} />
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
        title="Request Policy"
        description="Configure Leave, WFH, and Regularization request rules for your organization."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={() => setManageOpen(true)}>
            Add Policy
          </Button>
        }
      />

      <Tabs
        items={TYPE_TABS}
        active={activeTab}
        onChange={(key) => {
          setActiveTab(key as RequestPolicyType)
          setPage(1)
        }}
        className="mb-4"
      />

      <Table
        columns={columns}
        data={policies}
        rowKey={(row) => row.id}
        loading={getRequestPolicies.isLoading}
        emptyMessage={`No ${TYPE_TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} added yet.`}
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
      />

      <ManageRequestPolicyModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        defaultType={activeTab}
      />

      <RequestPolicyDetailModal
        open={Boolean(viewingPolicy)}
        onClose={() => setViewingPolicy(null)}
        policy={viewingPolicy}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Request Policy"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteRequestPolicy.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
