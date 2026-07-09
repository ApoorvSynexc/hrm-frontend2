import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type LeaveType = {
  id: string
  name: string
  code: string
  paidType: string
  defaultDays: number
  status: string
}

const columns: TableColumn<LeaveType>[] = [
  { key: 'name', header: 'Name' },
  { key: 'code', header: 'Code', width: '100px' },
  { key: 'paidType', header: 'Type', width: '110px' },
  { key: 'defaultDays', header: 'Default Days', align: 'right', width: '120px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function LeaveTypeModule() {
  return (
    <div>
      <ModuleHeader
        title="Leave Types"
        description="Set up the categories of leave employees can request, e.g. Sick, Casual, Earned."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Add Leave Type
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No leave types added yet."
      />
    </div>
  )
}
