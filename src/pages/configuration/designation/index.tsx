import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type Designation = {
  id: string
  title: string
  department: string
  level: string
  status: string
}

const columns: TableColumn<Designation>[] = [
  { key: 'title', header: 'Title' },
  { key: 'department', header: 'Department' },
  { key: 'level', header: 'Level', width: '120px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function DesignationModule() {
  return (
    <div>
      <ModuleHeader
        title="Designations"
        description="Define job titles and seniority levels used across departments."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Add Designation
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No designations added yet."
      />
    </div>
  )
}
