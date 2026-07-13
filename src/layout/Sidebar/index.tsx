import { NavLink } from 'react-router-dom'
import type { ComponentType } from 'react'
import {
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiUser,
  FiUsers,
} from 'react-icons/fi'

type IconComponent = ComponentType<{ size?: number }>

type NavItem = {
  label: string
  icon: IconComponent
  /** Omit for nav items that don't have a page yet. */
  to?: string
}

const MAIN_NAV: NavItem[] = [
  { label: 'Home', icon: FiHome, to: '/home' },
  { label: 'Me', icon: FiUser, to: '/me' },
  { label: 'My Team', icon: FiUsers },
  { label: 'Organization', icon: FiBriefcase, to: '/organization' },
]

type SidebarProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside
      className={`relative flex shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-44'
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
        <NavSection items={MAIN_NAV} collapsed={collapsed} />
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

function NavSection({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.label}>
          <NavItemLink item={item} collapsed={collapsed} />
        </li>
      ))}
    </ul>
  )
}

function NavItemLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon

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
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-accent text-accent-fg' : 'text-body hover:bg-surface-2 hover:text-heading'
        }`
      }
    >
      <Icon size={18} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}
