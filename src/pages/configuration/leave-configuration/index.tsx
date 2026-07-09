import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type LeaveConfig = {
  id: string
  leaveType: string
  applicableTo: string
  accrual: string
  status: string
}

const columns: TableColumn<LeaveConfig>[] = [
  { key: 'leaveType', header: 'Leave Type' },
  { key: 'applicableTo', header: 'Applicable To' },
  { key: 'accrual', header: 'Accrual', width: '140px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function LeaveConfigurationModule() {
  return (
    <div>
      <ModuleHeader
        title="Leave Configuration"
        description="Control accrual rules, carry-forward limits, and eligibility per leave type."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Add Configuration
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No leave configurations added yet."
      />
    </div>
  )
}
