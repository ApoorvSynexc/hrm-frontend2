import type { ComponentType } from 'react'
import { FiFolder } from 'react-icons/fi'
import { Typography } from '../../../components'
import { useDocumentPolicy } from '../../../services'
import HrHandbook from './hr-handbook'

// Only one document folder exists today (there's no folder/category concept
// behind DocumentPolicy) — structured as a switcher map anyway, matching
// the Configuration module-switcher pattern, so adding a second folder
// later is just one more entry + component instead of a rewrite.
const FOLDERS = [{ key: 'hr-handbook', label: 'HR Handbook' }]

const FOLDER_COMPONENTS: Record<string, ComponentType> = {
  'hr-handbook': HrHandbook,
}

export default function OrganizationDocument() {
  const activeFolder = 'hr-handbook'
  const ActiveFolder = FOLDER_COMPONENTS[activeFolder] ?? HrHandbook

  // Only fetched here for the sidebar's document count — shares a cache
  // entry with HrHandbook's identical query, so this isn't an extra request.
  const { getDocumentPolicies } = useDocumentPolicy({ listParams: { page: 1, limit: 100 } })
  const activeCount = (getDocumentPolicies.data?.documentPolicies ?? []).filter(
    (policy) => policy.status === 'ACTIVE',
  ).length

  return (
    <div className="flex h-[560px] min-h-0 flex-col gap-4 lg:flex-row">
      <aside className="h-full shrink-0 overflow-y-auto rounded-xl border border-border bg-surface p-3 lg:w-64">
        {FOLDERS.map((folder) => (
          <div
            key={folder.key}
            className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2.5 text-accent-fg"
          >
            <FiFolder size={18} className="shrink-0" />
            <div className="min-w-0">
              <Typography variant="body-sm" className="truncate font-medium !text-accent-fg">
                {folder.label}
              </Typography>
              <Typography variant="caption" className="!text-accent-fg/80">
                {activeCount} document{activeCount === 1 ? '' : 's'}
              </Typography>
            </div>
          </div>
        ))}
      </aside>

      <div className="h-full min-h-0 min-w-0 flex-1">
        <ActiveFolder />
      </div>
    </div>
  )
}
