import { useState, type ComponentType } from 'react'
import {
  FiBriefcase,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiFileText,
  FiGitBranch,
  FiGrid,
  FiKey,
  FiShield,
  FiSun,
} from 'react-icons/fi'
import { Typography } from '../../components'
import Role from './role'
import RolePermission from './role-permission'
import Department from './department'
import Designation from './designation'
import LeaveType from './leave-type'
import AttendancePolicy from './attendance-policy'
import WorkSchedulePolicy from './work-schedule-policy'
import RequestPolicy from './request-policy'
import HolidayConfiguration from './holiday-configuration'
import ApprovalWorkflow from './approval-workflow'

type IconComponent = ComponentType<{ size?: number }>

type ModuleItem = {
  key: string
  label: string
  icon: IconComponent
}

type ModuleGroup = {
  label: string
  items: ModuleItem[]
}

const MODULE_GROUPS: ModuleGroup[] = [
  {
    label: 'Access Control',
    items: [
      { key: 'role', label: 'Role', icon: FiShield },
      { key: 'role-permission', label: 'Role Permission', icon: FiKey },
    ],
  },
  {
    label: 'Organization',
    items: [
      { key: 'department', label: 'Department', icon: FiGrid },
      { key: 'designation', label: 'Designation', icon: FiBriefcase },
    ],
  },
  {
    label: 'Leave & Attendance',
    items: [
      { key: 'leave-type', label: 'Leave Type', icon: FiCalendar },
      { key: 'attendance-policy', label: 'Attendance Policy', icon: FiClock },
      { key: 'work-schedule-policy', label: 'Work Schedule Policy', icon: FiClipboard },
      { key: 'holiday-configuration', label: 'Holiday Configuration', icon: FiSun },
    ],
  },
  {
    label: 'Workflow',
    items: [
      { key: 'request-policy', label: 'Request Policy', icon: FiFileText },
      { key: 'approval-workflow', label: 'Approval Workflow', icon: FiGitBranch },
    ],
  },
]

const MODULE_COMPONENTS: Record<string, ComponentType> = {
  role: Role,
  'role-permission': RolePermission,
  department: Department,
  designation: Designation,
  'leave-type': LeaveType,
  'attendance-policy': AttendancePolicy,
  'work-schedule-policy': WorkSchedulePolicy,
  'request-policy': RequestPolicy,
  'holiday-configuration': HolidayConfiguration,
  'approval-workflow': ApprovalWorkflow,
}

export default function ConfigurationPage() {
  const [active, setActive] = useState('role')
  const ActiveModule = MODULE_COMPONENTS[active] ?? Role

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0">
        <Typography variant="h5">Configuration</Typography>
        <Typography variant="body-sm" color="body" className="mt-0.5">
          Manage organization structure, policies, and workflow settings.
        </Typography>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <aside className="shrink-0 overflow-y-auto rounded-xl border border-border bg-surface p-3 lg:w-64">
          {MODULE_GROUPS.map((group) => (
            <div key={group.label} className="mb-4 last:mb-0">
              <p className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-body/60 uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.key === active
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => setActive(item.key)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-accent text-accent-fg'
                            : 'text-body hover:bg-surface-2 hover:text-heading'
                        }`}
                      >
                        <Icon size={16} />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto rounded-xl border border-border bg-surface p-5">
          <ActiveModule />
        </div>
      </div>
    </div>
  )
}
