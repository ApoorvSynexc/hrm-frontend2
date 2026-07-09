import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type AttendancePolicy = {
  id: string
  name: string
  shiftType: string
  gracePeriod: string
  status: string
}

const columns: TableColumn<AttendancePolicy>[] = [
  { key: 'name', header: 'Name' },
  { key: 'shiftType', header: 'Shift Type' },
  { key: 'gracePeriod', header: 'Grace Period', width: '130px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function AttendancePolicyModule() {
  return (
    <div>
      <ModuleHeader
        title="Attendance Policies"
        description="Define shift timing, grace periods, and late-mark rules."
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
        emptyMessage="No attendance policies added yet."
      />
    </div>
  )
}
