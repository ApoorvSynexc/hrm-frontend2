import { FiDownload, FiFile } from 'react-icons/fi'
import { Typography } from '../../components'
import { useDocumentPolicy, type DocumentPolicy } from '../../services'
import { buildMediaUrl } from '../../utils/helper'

/** "2.3 MB" / "512 B" */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function HrHandbookPage() {
  const { getDocumentPolicies } = useDocumentPolicy({ listParams: { page: 1, limit: 100 } })

  // Employees only need to see currently-active policies — INACTIVE/DELETED
  // ones are admin-side housekeeping, not something to publish here.
  const policies = (getDocumentPolicies.data?.documentPolicies ?? []).filter(
    (policy) => policy.status === 'ACTIVE',
  )

  return (
    <div>
      <div className="mb-4">
        <Typography variant="h5">HR Handbook</Typography>
        <Typography variant="body-sm" color="body" className="mt-1">
          Company policies and reference documents.
        </Typography>
      </div>

      {getDocumentPolicies.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-surface-2" />
          ))}
        </div>
      ) : policies.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-bg text-accent">
            <FiFile size={22} />
          </span>
          <Typography variant="h6">No policies published yet</Typography>
          <Typography variant="body-sm" color="body">
            Check back later for company handbook documents.
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      )}
    </div>
  )
}

function PolicyCard({ policy }: { policy: DocumentPolicy }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-accent">
          <FiFile size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <Typography variant="body-sm" className="truncate font-semibold text-heading">
            {policy.name}
          </Typography>
          {policy.description && (
            <Typography variant="caption" color="body" className="mt-0.5 line-clamp-2 block">
              {policy.description}
            </Typography>
          )}
        </div>
      </div>

      <a
        href={buildMediaUrl(policy.media.url)}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm text-heading transition-colors hover:border-accent hover:text-accent"
      >
        <span className="truncate">{formatFileSize(policy.media.size)}</span>
        <FiDownload size={14} className="shrink-0" />
      </a>
    </div>
  )
}
