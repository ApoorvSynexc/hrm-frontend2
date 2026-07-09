import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../Sidebar'
import { Navbar } from '../Navbar'

const COLLAPSE_KEY = 'hrm-sidebar-collapsed'

function readCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COLLAPSE_KEY) === 'true'
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <div className="flex h-svh bg-surface-2">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((prev) => !prev)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
