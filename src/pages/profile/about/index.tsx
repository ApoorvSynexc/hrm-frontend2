import { useState, type ComponentType } from 'react'
import { Tabs } from '../../../components'
import Summary from './summary'
import Timeline from './timeline'
import WallActivity from './wall-activity'
import Awards from './awards'

const SUB_TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'wall-activity', label: 'Wall Activity' },
  { key: 'awards', label: 'Awards' },
]

const SUB_TAB_COMPONENTS: Record<string, ComponentType> = {
  summary: Summary,
  timeline: Timeline,
  'wall-activity': WallActivity,
  awards: Awards,
}

export default function AboutTab() {
  const [subTab, setSubTab] = useState('summary')
  const ActiveSubTab = SUB_TAB_COMPONENTS[subTab] ?? Summary

  return (
    <div className="flex flex-col gap-4">
      <div className="pl-5">
        <Tabs
          items={SUB_TABS}
          active={subTab}
          onChange={setSubTab}
          variant="pill"
          className="w-fit"
        />
      </div>
      <ActiveSubTab />
    </div>
  )
}
