import { useState } from 'react'
import { FiDownload, FiFile, FiSearch } from 'react-icons/fi'
import { Typography } from '../../../../components'
import { useDocumentPolicy, type DocumentPolicy } from '../../../../services'
import { formatDate } from '../../../../utils/date'
import { buildMediaUrl } from '../../../../utils/helper'

/** "2.3 MB" / "512 B" */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** File-extension badge color, cycling through a small fixed palette by type family. */
const EXTENSION_COLOR: Record<string, string> = {
  pdf: '#e11d48',
  doc: '#2563eb',
  docx: '#2563eb',
  xls: '#059669',
  xlsx: '#059669',
  ppt: '#d97706',
  pptx: '#d97706',
  png: '#7c3aed',
  jpg: '#7c3aed',
  jpeg: '#7c3aed',
}
const DEFAULT_EXTENSION_COLOR = '#64748b'

function getExtension(fileName: string): string {
  const ext = fileName.split('.').pop()
  return ext && ext !== fileName ? ext.toLowerCase() : 'file'
}

/**
 * Content panel for the "HR Handbook" document folder — one of potentially
 * several folders under Organization → Document (see ../index.tsx), even
 * though it's the only one that exists today. Self-contained: fetches its
 * own data so it can be dropped into any shell that renders it.
 */
export default function HrHandbook() {
  const { getDocumentPolicies } = useDocumentPolicy({ listParams: { page: 1, limit: 100 } })
  const [search, setSearch] = useState('')

  // Employees only need to see currently-active policies — INACTIVE/DELETED
  // ones are admin-side housekeeping, not something to publish here. Manage
  // (create/edit/delete/status) lives in Configuration → Document Policy;
  // this is a read-only browse view.
  const activePolicies = (getDocumentPolicies.data?.documentPolicies ?? []).filter(
    (policy) => policy.status === 'ACTIVE',
  )
  const query = search.trim().toLowerCase()
  const policies = query
    ? activePolicies.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query),
      )
    : activePolicies

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-surface p-5">
      <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h6">HR Handbook</Typography>
          <Typography variant="body-sm" color="body" className="mt-1">
            Policy documents available for viewing by all employees.
          </Typography>
        </div>

        {activePolicies.length > 0 && (
          <div className="relative w-full sm:w-64">
            <FiSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-body" size={15} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="w-full rounded-lg border border-border bg-surface-2 py-2 pr-3 pl-9 text-sm text-heading outline-none placeholder:text-body/60 focus:border-accent"
            />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {getDocumentPolicies.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 w-full animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
        ) : activePolicies.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-bg text-accent">
              <FiFile size={22} />
            </span>
            <Typography variant="h6">No documents published yet</Typography>
            <Typography variant="body-sm" color="body">
              Check back later for company handbook documents.
            </Typography>
          </div>
        ) : policies.length === 0 ? (
          <Typography variant="body-sm" color="body" className="px-1 py-10 text-center">
            No documents match "{search}".
          </Typography>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {policies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PolicyCard({ policy }: { policy: DocumentPolicy }) {
  const extension = getExtension(policy.media.name)
  const color = EXTENSION_COLOR[extension] ?? DEFAULT_EXTENSION_COLOR

  return (
    <a
      href={buildMediaUrl(policy.media.url)}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tracking-wide text-white uppercase"
          style={{ backgroundColor: color }}
        >
          {extension.length > 4 ? <FiFile size={18} /> : extension}
        </span>
        <div className="min-w-0 flex-1">
          <Typography
            variant="body-sm"
            className="truncate font-semibold text-heading transition-colors group-hover:text-accent"
          >
            {policy.name}
          </Typography>
          {policy.description ? (
            <Typography variant="caption" color="body" className="mt-0.5 line-clamp-2 block">
              {policy.description}
            </Typography>
          ) : (
            <Typography variant="caption" color="body" className="mt-0.5 block truncate">
              {policy.media.name}
            </Typography>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-body">
        <span className="truncate">
          {formatFileSize(policy.media.size)} · Updated {formatDate(policy.updatedAt)}
        </span>
        <FiDownload size={14} className="shrink-0 transition-colors group-hover:text-accent" />
      </div>
    </a>
  )
}
