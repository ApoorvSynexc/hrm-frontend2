import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type WorkSchedulePolicy = {
  id: string
  name: string
  workingDays: string
  hoursPerDay: number
  status: string
}

const columns: TableColumn<WorkSchedulePolicy>[] = [
  { key: 'name', header: 'Name' },
  { key: 'workingDays', header: 'Working Days' },
  { key: 'hoursPerDay', header: 'Hours / Day', align: 'right', width: '120px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function WorkSchedulePolicyModule() {
  return (
    <div>
      <ModuleHeader
        title="Work Schedule Policies"
        description="Configure standard working days and hours for employee groups."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Add Policy
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No work schedule policies added yet."
      />
    </div>
  )
}
