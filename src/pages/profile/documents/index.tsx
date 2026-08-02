import { useState, type ComponentType } from 'react'
import {
  FiAlertCircle,
  FiAward,
  FiBriefcase,
  FiCreditCard,
  FiFile,
  FiLock,
  FiMail,
  FiMoreVertical,
  FiUserCheck,
} from 'react-icons/fi'
import { Typography } from '../../../components'

type DocStatus = 'VERIFIED' | 'PENDING' | 'REQUIRED' | 'NOT_APPLICABLE'

type EmployeeDoc = {
  id: string
  name: string
  status: DocStatus
}

type DocFolder = {
  key: string
  label: string
  icon: ComponentType<{ size?: number }>
  color: string
  description: string
  secure?: boolean
  documents: EmployeeDoc[]
}

/**
 * Placeholder data — the backend API for employee documents doesn't exist
 * yet (the user will provide a reference to build against later). Folder
 * switching and the row menu are real interactions; Delete only mutates
 * this local mock state rather than calling an endpoint.
 */
const INITIAL_FOLDERS: DocFolder[] = [
  {
    key: 'degrees',
    label: 'Degrees & Certificates',
    icon: FiAward,
    color: '#0d9488',
    description: 'Educational degrees, diplomas, and professional certifications.',
    documents: [
      { id: 'd1', name: 'Bachelor Degree', status: 'VERIFIED' },
      { id: 'd2', name: 'Provisional Certificate', status: 'REQUIRED' },
    ],
  },
  {
    key: 'experience',
    label: 'Previous Experience',
    icon: FiBriefcase,
    color: '#2563eb',
    description: 'Relieving letters and experience certificates from previous employers.',
    documents: [{ id: 'd3', name: 'Relieving Letter', status: 'REQUIRED' }],
  },
  {
    key: 'letters',
    label: 'Employee Letters',
    icon: FiMail,
    color: '#7c3aed',
    description: 'Offer letters, appointment letters, and other official correspondence.',
    documents: [],
  },
  {
    key: 'identity',
    label: 'Identity',
    icon: FiCreditCard,
    color: '#0d9488',
    description:
      "An identity document is used to verify aspects of a person's personal identity in the locations specified below. A work permit is any document which verifies if a person is authorized to work in the locations specified below.",
    secure: true,
    documents: [
      { id: 'd4', name: 'PAN Card', status: 'VERIFIED' },
      { id: 'd5', name: 'Work Permit', status: 'NOT_APPLICABLE' },
    ],
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    icon: FiUserCheck,
    color: '#64748b',
    description: 'Documents collected as part of the onboarding process.',
    documents: [],
  },
]

const STATUS_LABEL: Record<DocStatus, string> = {
  VERIFIED: 'Verified',
  PENDING: 'Pending',
  REQUIRED: 'Required',
  NOT_APPLICABLE: 'Not Applicable',
}

const STATUS_COLOR: Record<DocStatus, string> = {
  VERIFIED: 'bg-green-500/15 text-green-500',
  PENDING: 'bg-amber-500/15 text-amber-500',
  REQUIRED: 'bg-red-500/15 text-red-500',
  NOT_APPLICABLE: 'bg-surface-2 text-body',
}

export default function DocumentsTab() {
  const [folders, setFolders] = useState(INITIAL_FOLDERS)
  const [activeFolderKey, setActiveFolderKey] = useState(folders[0].key)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const activeFolder = folders.find((f) => f.key === activeFolderKey) ?? folders[0]
  const ActiveIcon = activeFolder.icon
  const requiresUploadCount = folders.reduce(
    (sum, folder) => sum + folder.documents.filter((doc) => doc.status === 'REQUIRED').length,
    0,
  )

  const handleDelete = (folderKey: string, docId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.key === folderKey
          ? { ...folder, documents: folder.documents.filter((doc) => doc.id !== docId) }
          : folder,
      ),
    )
    setOpenMenuId(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {requiresUploadCount > 0 && (
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600">
          <FiAlertCircle size={16} className="shrink-0" />
          {requiresUploadCount} document{requiresUploadCount === 1 ? '' : 's'} require upload
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <aside className="h-full shrink-0 overflow-y-auto rounded-xl border border-border bg-surface p-3 lg:w-72">
          <Typography variant="overline" color="body" className="mb-2 block px-2">
            Employee Document Folders
          </Typography>
          <ul className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon
              const isActive = folder.key === activeFolderKey
              return (
                <li key={folder.key}>
                  <button
                    type="button"
                    onClick={() => setActiveFolderKey(folder.key)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      isActive ? 'bg-accent-bg' : 'hover:bg-surface-2'
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: folder.color }}
                    >
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0">
                      <Typography
                        variant="body-sm"
                        className={`truncate font-medium ${isActive ? 'text-accent' : 'text-heading'}`}
                      >
                        {folder.label}
                      </Typography>
                      <Typography variant="caption" color="body">
                        {folder.documents.length} document{folder.documents.length === 1 ? '' : 's'}
                      </Typography>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-border bg-surface p-5">
          <div className="mb-4 flex shrink-0 items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: activeFolder.color }}
            >
              <ActiveIcon size={18} />
            </span>
            <div className="min-w-0">
              <Typography variant="h6">{activeFolder.label}</Typography>
              <Typography variant="body-sm" color="body" className="mt-1">
                {activeFolder.description}
              </Typography>
              {activeFolder.secure && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                  <FiLock size={12} />
                  Only selected people can view this information
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto border-t border-border pt-3">
            {activeFolder.documents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-bg text-accent">
                  <FiFile size={22} />
                </span>
                <Typography variant="h6">No documents yet</Typography>
                <Typography variant="body-sm" color="body">
                  Documents added to this folder will show up here.
                </Typography>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {activeFolder.documents.map((doc) => (
                  <li key={doc.id} className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <FiFile size={15} className="shrink-0 text-body" />
                        <Typography variant="body-sm" className="truncate font-medium text-heading">
                          {doc.name}
                        </Typography>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${STATUS_COLOR[doc.status]}`}
                        >
                          {STATUS_LABEL[doc.status]}
                        </span>
                        <div className="relative">
                          <button
                            type="button"
                            aria-label={`Actions for ${doc.name}`}
                            onClick={() => setOpenMenuId((id) => (id === doc.id ? null : doc.id))}
                            className="rounded-lg p-1.5 text-body transition-colors hover:bg-surface-2 hover:text-heading"
                          >
                            <FiMoreVertical size={15} />
                          </button>
                          {openMenuId === doc.id && (
                            <>
                              <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setOpenMenuId(null)}
                                className="fixed inset-0 z-10 cursor-default"
                              />
                              <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(null)}
                                  className="block w-full px-3 py-2 text-left text-sm text-heading transition-colors hover:bg-surface-2"
                                >
                                  View / Update Document
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(activeFolder.key, doc.id)}
                                  className="block w-full px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-surface-2"
                                >
                                  Delete Document
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {doc.status === 'NOT_APPLICABLE' && (
                      <Typography variant="caption" color="body" className="mt-1 block pl-6">
                        Marked As Not Applicable.
                      </Typography>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
