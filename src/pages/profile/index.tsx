import { useState, type ComponentType } from 'react'
import { FiBriefcase, FiMail, FiMoreHorizontal } from 'react-icons/fi'
import { Avatar, Tabs, Typography } from '../../components'
import { useSession } from '../../hooks'
import { Field } from './common'
import AboutTab from './about'
import ProfileTab from './profile'
import JobTab from './job'
import DocumentsTab from './documents'
import AssetsTab from './assets'
import LearnTab from './learn'

const TOP_TABS = [
  { key: 'about', label: 'About' },
  { key: 'profile', label: 'Profile' },
  { key: 'job', label: 'Job' },
  { key: 'documents', label: 'Documents' },
  { key: 'assets', label: 'Assets' },
  { key: 'learn', label: 'Learn' },
]

const TOP_TAB_COMPONENTS: Record<string, ComponentType> = {
  about: AboutTab,
  profile: ProfileTab,
  job: JobTab,
  documents: DocumentsTab,
  assets: AssetsTab,
  learn: LearnTab,
}

export default function ProfilePage() {
  const { user } = useSession()
  const [topTab, setTopTab] = useState('about')

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : ''
  const ActiveTopTab = TOP_TAB_COMPONENTS[topTab] ?? AboutTab

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <Avatar name={fullName} src={user?.profile?.url} size="lg" shape="square" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant="h3">{fullName}</Typography>
              {user?.status && (
                <span className="rounded-full bg-accent-bg px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent">
                  {user.status}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-body">
              {user?.email && (
                <span className="flex items-center gap-1.5">
                  <FiMail size={14} />
                  {user.email}
                </span>
              )}
              {user?.designation && (
                <span className="flex items-center gap-1.5">
                  <FiBriefcase size={14} />
                  {user.designation.name}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="More options"
            className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiMoreHorizontal size={18} />
          </button>
        </div>

        {(user?.department || user?.role) && (
          <div className="mt-5 flex gap-10 border-t border-border pt-4">
            {user?.department && <Field label="Department" value={user.department.name} />}
            {user?.role && <Field label="Role" value={user.role.name} />}
          </div>
        )}
      </div>

      <Tabs items={TOP_TABS} active={topTab} onChange={setTopTab} className="pl-5" />

      <ActiveTopTab />
    </div>
  )
}
