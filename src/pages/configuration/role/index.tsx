import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import type { Role } from '../../../services'
import { ModuleHeader } from '../common'

const columns: TableColumn<Role>[] = [
  { key: 'name', header: 'Role' },
  { key: 'description', header: 'Description' },
  {
    key: 'isSystem',
    header: 'System Role',
    align: 'center',
    width: '120px',
    render: (row) => (row.isSystem ? 'Yes' : 'No'),
  },
  {
    key: 'permissions',
    header: 'Permissions',
    align: 'right',
    width: '110px',
    render: (row) => row.rolePermissions.length,
  },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function RoleModule() {
  return (
    <div>
      <ModuleHeader
        title="Roles"
        description="Define roles like Admin, HR Manager, or Employee that group a set of permissions."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Add Role
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No roles added yet."
      />
    </div>
  )
}
