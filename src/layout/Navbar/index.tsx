import { useState } from 'react'
import { FiBell, FiChevronDown, FiHelpCircle, FiSearch } from 'react-icons/fi'
import { Avatar } from '../../components'
import { PalettePicker, ThemeToggle } from '../../theme'
import { useSession } from '../../hooks'
import { useAuth } from '../../services'
import { UserMenu } from './UserMenu'

export function Navbar() {
  const { user } = useSession()
  const { logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : undefined

  return (
    <header className="flex h-16 items-center gap-6 border-b border-border bg-surface px-6">
      <nav aria-label="Breadcrumb" className="hidden shrink-0 items-center gap-1.5 text-sm md:flex">
        <span className="text-body">Home</span>
        <span className="text-body">/</span>
        <span className="font-medium text-heading">Dashboard</span>
      </nav>

      <div className="relative hidden max-w-md flex-1 md:block">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" size={16} />
        <input
          type="search"
          placeholder="Search people, policies, requests…"
          className="w-full rounded-lg border border-border bg-surface-2 py-2 pr-12 pl-9 text-sm text-heading outline-none placeholder:text-body/60 focus:border-accent"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-body">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <PalettePicker />
        <ThemeToggle />
        <div className="mx-1 h-6 w-px bg-border" />
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-body transition-colors hover:bg-surface-2 hover:text-heading"
        >
          <FiBell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition-colors hover:bg-surface-2 hover:text-heading"
        >
          <FiHelpCircle size={18} />
        </button>

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1.5 pr-2 pl-1.5 transition-colors hover:bg-surface-2"
          >
            <Avatar name={fullName} src={user?.profile?.url} size="sm" />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-heading">{fullName}</span>
              <span className="block text-xs text-body">{user?.email}</span>
            </span>
            <FiChevronDown size={14} className="text-body" />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <UserMenu
                user={user}
                fullName={fullName}
                onClose={() => setMenuOpen(false)}
                onSignOut={() => logout.mutate()}
                signingOut={logout.isPending}
              />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
