import { useState, type ComponentType } from 'react'
import { Tabs } from '../../components'
import { useApprovalRequest } from '../../services'
import TakeAction from './take-action'

const TAB_COMPONENTS: Record<string, ComponentType> = {
  'take-action': TakeAction,
}

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState('take-action')
  const ActiveTab = TAB_COMPONENTS[activeTab] ?? TakeAction

  // Count for the tab label only — the minimal 1-row fetch shares its cache
  // with the Sidebar badge, so this costs no extra request.
  const { getPendingApprovals } = useApprovalRequest({ listParams: { page: 1, limit: 1 } })
  const totalPending = getPendingApprovals.data?.meta.totalRecords ?? 0

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
