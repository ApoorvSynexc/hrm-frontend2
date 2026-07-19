import { useState, type ComponentType } from 'react'
import { Tabs } from '../../components'
import { usePendingApprovalsCount } from '../../services'
import TakeAction from './take-action'

const TAB_COMPONENTS: Record<string, ComponentType> = {
  'take-action': TakeAction,
}

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState('take-action')
  const ActiveTab = TAB_COMPONENTS[activeTab] ?? TakeAction

  // Same dedicated count query as the Sidebar badge — shares its cache entry.
  const { data: totalPending = 0 } = usePendingApprovalsCount()

  const TABS = [{ key: 'take-action', label: `Take Action (${totalPending})` }]

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Tabs items={TABS} active={activeTab} onChange={setActiveTab} className="shrink-0" />
      <div className="min-h-0 flex-1">
        <ActiveTab />
      </div>
    </div>
  )
}
