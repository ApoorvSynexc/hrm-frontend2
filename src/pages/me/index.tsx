import { useState, type ComponentType } from 'react'
import { Tabs } from '../../components'
import Attendance from './attendance'
import Leave from './leave'

const TABS = [
  { key: 'attendance', label: 'Attendance' },
  { key: 'leave', label: 'Leave' },
]

const TAB_COMPONENTS: Record<string, ComponentType> = {
  attendance: Attendance,
  leave: Leave,
}

export default function MePage() {
  const [activeTab, setActiveTab] = useState('attendance')
  const ActiveTab = TAB_COMPONENTS[activeTab] ?? Attendance

  return (
    <div className="flex flex-col gap-4">
      <Tabs items={TABS} active={activeTab} onChange={setActiveTab} />
      <ActiveTab />
    </div>
  )
}
