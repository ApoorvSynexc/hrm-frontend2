import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBookOpen, FiLogOut, FiSliders, FiUser } from 'react-icons/fi'
import { Avatar } from '../../components'
import type { Profile } from '../../services'

type MenuItem = {
  label: string
  icon: ReactNode
  /** Omit for items that don't have a page yet. */
  to?: string
}

const ACCOUNT_ITEMS: MenuItem[] = [
  { label: 'My Profile', icon: <FiUser size={16} />, to: '/profile' },
  { label: 'Configurations', icon: <FiSliders size={16} />, to: '/configuration' },
]

const RESOURCE_ITEMS: MenuItem[] = [{ label: 'HR Handbook', icon: <FiBookOpen size={16} /> }]

type UserMenuProps = {
  user: Profile | null
  fullName?: string
  onClose: () => void
  onSignOut: () => void
  signingOut: boolean
}

export function UserMenu({ user, fullName, onClose, onSignOut, signingOut }: UserMenuProps) {
  const navigate = useNavigate()

  const handleItemClick = (item: MenuItem) => {
    if (item.to) navigate(item.to)
    onClose()
  }

  return (
    <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
      <div className="flex items-center gap-3 bg-surface-2 p-4">
        <Avatar name={fullName} src={user?.profile?.url} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-heading">{fullName}</p>
          {user?.role && (
            <p className="text-xs font-medium tracking-wide text-body">{user.role.name}</p>
          )}
        </div>
      </div>

      <MenuSection items={ACCOUNT_ITEMS} onItemClick={handleItemClick} />
      <div className="border-t border-border" />
      <MenuSection items={RESOURCE_ITEMS} onItemClick={handleItemClick} />
      <div className="border-t border-border" />

      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        <FiLogOut size={16} />
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}

function MenuSection({
  items,
  onItemClick,
}: {
  items: MenuItem[]
  onItemClick: (item: MenuItem) => void
}) {
  return (
    <div className="py-1">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onItemClick(item)}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition-colors hover:bg-surface-2"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}
