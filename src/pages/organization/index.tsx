import { useState, type ComponentType } from 'react'
import { Tabs } from '../../components'
import Employee from './employee'

const TABS = [{ key: 'employee', label: 'Employee' }]

const TAB_COMPONENTS: Record<string, ComponentType> = {
  employee: Employee,
}

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState('employee')
  const ActiveTab = TAB_COMPONENTS[activeTab] ?? Employee

  return (
    <div className="flex flex-col gap-4">
      <Tabs items={TABS} active={activeTab} onChange={setActiveTab} />
      <ActiveTab />
    </div>
  )
}
