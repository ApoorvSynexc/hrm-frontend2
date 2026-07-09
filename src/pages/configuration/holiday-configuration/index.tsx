import { FiPlus } from 'react-icons/fi'
import { Button, Table, type TableColumn } from '../../../components'
import { ModuleHeader } from '../common'

type Holiday = {
  id: string
  name: string
  date: string
  recurring: string
  status: string
}

const columns: TableColumn<Holiday>[] = [
  { key: 'name', header: 'Holiday' },
  { key: 'date', header: 'Date', width: '140px' },
  { key: 'recurring', header: 'Recurring', width: '110px' },
  { key: 'status', header: 'Status', align: 'right', width: '110px' },
]

export default function HolidayConfigurationModule() {
  return (
    <div>
      <ModuleHeader
        title="Holiday Configuration"
        description="Maintain the holiday calendar applied across the organization."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />}>
            Add Holiday
          </Button>
        }
      />
      <Table
        columns={columns}
        data={[]}
        rowKey={(row) => row.id}
        emptyMessage="No holidays added yet."
      />
    </div>
  )
}
