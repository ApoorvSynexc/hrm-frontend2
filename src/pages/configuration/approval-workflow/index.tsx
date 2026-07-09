import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type ApprovalWorkflow = {
  id: string
  name: string
  appliesTo: string
  steps: number
  status: string
}

const columns: TableColumn<ApprovalWorkflow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'appliesTo', header: 'Applies To' },
  { key: 'steps', header: 'Steps', align: 'right', width: '90px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function ApprovalWorkflowModule() {
  return (
    <div>
      <ModuleHeader
        title="Approval Workflows"
        description="Chain approvers for leave, WFH, and regularization requests."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Add Workflow
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No approval workflows added yet."
      />
    </div>
  )
}
