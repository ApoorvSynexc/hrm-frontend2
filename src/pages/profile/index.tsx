import { useState, type ReactNode } from 'react'
import { FiBriefcase, FiMail, FiMoreHorizontal } from 'react-icons/fi'
import { Avatar, Tabs, Typography } from '../../components'
import { useSession } from '../../hooks'

const TOP_TABS = [
  { key: 'about', label: 'About' },
  { key: 'profile', label: 'Profile' },
  { key: 'job', label: 'Job' },
  { key: 'documents', label: 'Documents' },
  { key: 'assets', label: 'Assets' },
  { key: 'learn', label: 'Learn' },
]

const SUB_TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'wall', label: 'Wall Activity' },
  { key: 'awards', label: 'Awards' },
]

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProfilePage() {
  const { user } = useSession()
  const [topTab, setTopTab] = useState('about')
  const [subTab, setSubTab] = useState('summary')

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : ''

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

      {topTab !== 'about' ? (
        <EmptyState message={`${TOP_TABS.find((t) => t.key === topTab)?.label} coming soon.`} />
      ) : (
        <>
          <div className="pl-5">
            <Tabs
              items={SUB_TABS}
              active={subTab}
              onChange={setSubTab}
              variant="pill"
              className="w-fit"
            />
          </div>

          {subTab !== 'summary' ? (
            <EmptyState message={`${SUB_TABS.find((t) => t.key === subTab)?.label} coming soon.`} />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="flex flex-col gap-4 lg:col-span-2">
                <Card title="Professional Summary">
                  <p className="text-sm text-body">
                    {user?.designation?.name ?? 'No summary added yet.'}
                  </p>
                </Card>

                <Card title="Primary Details">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                    <Field label="First Name" value={user?.firstName} />
                    <Field label="Last Name" value={user?.lastName} />
                    <Field label="Gender" value={user?.gender} />
                    <Field label="Date of Birth" value={formatDate(user?.dateOfBirth)} />
                    <Field label="Marital Status" value={user?.maritalStatus} />
                    <Field label="Employee Code" value={user?.employeeCode} />
                    <Field label="Joining Date" value={formatDate(user?.joiningDate)} />
                    <Field label="Employment Status" value={user?.employmentStatus} />
                  </div>
                </Card>
              </div>

              <div className="flex flex-col gap-4">
                <Card title="Skills">
                  <p className="text-sm text-body">No skills added yet.</p>
                  <button
                    type="button"
                    className="mt-3 text-sm font-medium text-accent hover:underline"
                  >
                    + Add skills
                  </button>
                </Card>

                <Card title="Praise">
                  <p className="text-sm text-body">No praise yet.</p>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <Typography variant="h6" className="mb-3">
        {title}
      </Typography>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-body/60 uppercase">{label}</p>
      <p className="mt-0.5 text-sm text-heading">{value || '—'}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
      <Typography variant="body-sm" color="body">
        {message}
      </Typography>
    </div>
  )
}
