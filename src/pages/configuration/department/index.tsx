import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type Department = {
  id: string
  name: string
  code: string
  head: string
  employees: number
  status: string
}

const columns: TableColumn<Department>[] = [
  { key: 'name', header: 'Name' },
  { key: 'code', header: 'Code', width: '120px' },
  { key: 'head', header: 'Head of Department' },
  { key: 'employees', header: 'Employees', align: 'right', width: '110px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function DepartmentModule() {
  return (
    <div>
      <ModuleHeader
        title="Departments"
        description="Organize employees into departments across your company."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Add Department
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No departments added yet."
      />
    </div>
  )
}
