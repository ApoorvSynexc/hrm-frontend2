import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type RequestPolicy = {
  id: string
  name: string
  appliesTo: string
  approvalRequired: string
  status: string
}

const columns: TableColumn<RequestPolicy>[] = [
  { key: 'name', header: 'Name' },
  { key: 'appliesTo', header: 'Applies To' },
  { key: 'approvalRequired', header: 'Approval Required', width: '160px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function RequestPolicyModule() {
  return (
    <div>
      <ModuleHeader
        title="Request Policies"
        description="Set rules for regularization, work-from-home, and other employee requests."
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
        emptyMessage="No request policies added yet."
      />
    </div>
  )
}
