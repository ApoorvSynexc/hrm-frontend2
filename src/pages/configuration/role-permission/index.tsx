import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

// A role-permission row as the list endpoint would return it: the role's
// name and the permission's action/subject already joined server-side,
// mirroring how `role.rolePermissions[].permission` looks in the real
// my-profile response.
type RolePermissionRow = {
  id: string
  roleName: string
  subject: string
  action: string
  status: string
}

const columns: TableColumn<RolePermissionRow>[] = [
  { key: 'roleName', header: 'Role' },
  { key: 'subject', header: 'Subject' },
  { key: 'action', header: 'Action', width: '110px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function RolePermissionModule() {
  return (
    <div>
      <ModuleHeader
        title="Role Permissions"
        description="Assign granular create/read/update/delete permissions to each role."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Assign Permission
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No permissions assigned yet."
      />
    </div>
  )
}
