import { useState, type ComponentType } from 'react'
import { Tabs } from '../../components'
import Employee from './employee'
import Document from './document'

const TABS = [
  { key: 'employee', label: 'Employee' },
  { key: 'document', label: 'Document' },
]

const TAB_COMPONENTS: Record<string, ComponentType> = {
  employee: Employee,
  document: Document,
}

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState('employee')
  const ActiveTab = TAB_COMPONENTS[activeTab] ?? Employee

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Tabs items={TABS} active={activeTab} onChange={setActiveTab} className="shrink-0" />
      <div className="min-h-0 flex-1">
        <ActiveTab />
      </div>
    </div>
  )
}
