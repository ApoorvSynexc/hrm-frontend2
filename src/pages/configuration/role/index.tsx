import { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { useRole, type Role } from '../../../services'
import { ModuleHeader } from '../common'

const PAGE_SIZE = 10

const columns: TableColumn<Role>[] = [
  { key: 'name', header: 'Role' },
  {
    key: 'description',
    header: 'Description',
    render: (row) => row.description || '—',
  },
  {
    key: 'isSystem',
    header: 'System Role',
    width: '120px',
    render: (row) => (row.isSystem ? 'Yes' : 'No'),
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
        {row.status}
      </span>
    ),
  },
]

export default function RoleModule() {
  const [page, setPage] = useState(1)
  const { getRoles } = useRole({ listParams: { page, limit: PAGE_SIZE } })

  return (
    <div>
      <ModuleHeader
        title="Roles"
        description="Define roles like HR Manager or Employee that group a set of permissions."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
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
    </div>
  )
}
