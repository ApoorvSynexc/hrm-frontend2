import { NavLink } from 'react-router-dom'
import type { ComponentType } from 'react'
import {
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiInbox,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { usePendingApprovalsCount } from '../../services'

type IconComponent = ComponentType<{ size?: number }>

type NavItem = {
  label: string
  icon: IconComponent
  /** Omit for nav items that don't have a page yet. */
  to?: string
  /** Show the pending-approvals count badge on this item. */
  showPendingBadge?: boolean
}

const MAIN_NAV: NavItem[] = [
  { label: 'Home', icon: FiHome, to: '/home' },
  { label: 'Me', icon: FiUser, to: '/me' },
  { label: 'Inbox', icon: FiInbox, to: '/inbox', showPendingBadge: true },
  { label: 'My Team', icon: FiUsers },
  { label: 'Organization', icon: FiBriefcase, to: '/organization' },
]

type SidebarProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const { data: pendingCount = 0 } = usePendingApprovalsCount()

  return (
    <aside
      className={`relative flex shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex h-16 items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-fg">
          S
        </div>
        {!collapsed && (
          <span className="truncate text-base font-semibold text-heading">Synexc</span>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <NavSection items={MAIN_NAV} collapsed={collapsed} pendingCount={pendingCount} />
      </nav>

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-body shadow-sm transition-colors hover:text-heading"
      >
        {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>
    </aside>
  )
}

function NavSection({
  items,
  collapsed,
  pendingCount,
}: {
  items: NavItem[]
  collapsed: boolean
  pendingCount: number
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.label}>
          <NavItemLink
            item={item}
            collapsed={collapsed}
            badge={item.showPendingBadge && pendingCount > 0 ? pendingCount : undefined}
          />
        </li>
      ))}
    </ul>
  )
}

function NavItemLink({
  item,
  collapsed,
  badge,
}: {
  item: NavItem
  collapsed: boolean
  badge?: number
}) {
  const Icon = item.icon

  const badgeEl =
    badge !== undefined ? (
      <span
        className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white ${
          collapsed ? 'absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]' : 'ml-auto'
        }`}
      >
        {badge > 99 ? '99+' : badge}
      </span>
    ) : null

  if (!item.to) {
    return (
      <span
        title="Coming soon"
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-body/50"
      >
        <Icon size={18} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </span>
    )
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-accent text-accent-fg' : 'text-body hover:bg-surface-2 hover:text-heading'
        }`
      }
    >
      <Icon size={18} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {badgeEl}
    </NavLink>
  )
}
