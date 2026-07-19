import { useState } from 'react'
import { FiCheck, FiInbox, FiX } from 'react-icons/fi'
import { Avatar, Button, Typography } from '../../../components'
import { getErrorMessage } from '../../../lib'
import { useApprovalRequest, type ApprovalModule, type PendingApproval } from '../../../services'
import { fromNow } from '../../../utils/date'
import { MODULE_META, requestSummary } from '../common'
import RejectRequestModal from './manage'

/**
 * HOLIDAY exists on ApprovalModule but is never actually enriched/inboxed
 * (see services/approval-request/types), so it's excluded from the tabs.
 */
type InboxModule = Exclude<ApprovalModule, 'HOLIDAY'>
type ActiveModule = 'ALL' | InboxModule

const FETCH_LIMIT = 100
const MODULE_ORDER: InboxModule[] = ['LEAVE', 'REGULARIZATION', 'WFH']

export default function TakeAction() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('ALL')
  const [rejectTarget, setRejectTarget] = useState<PendingApproval | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  // Mutations only — independent of any listParams, so no module filter needed here.
  const { approveRequest, rejectRequest } = useApprovalRequest()

  // One query, keyed on the active tab: `module` is omitted for "ALL" (server
  // returns everything unfiltered) and set otherwise. Switching tabs changes
  // the query key, and staleTime: 0 on this hook guarantees a live refetch
  // every time — even when flipping back to a tab visited moments ago.
  const { getPendingApprovals } = useApprovalRequest({
    listParams: {
      page: 1,
      limit: FETCH_LIMIT,
      module: activeModule === 'ALL' ? undefined : activeModule,
    },
  })

  const isLoading = getPendingApprovals.isLoading
  const visibleApprovals = getPendingApprovals.data?.approvals ?? []

  const handleApprove = (approval: PendingApproval) => {
    setActingId(approval.id)
    approveRequest.mutate({ stepInstanceId: approval.id }, { onSettled: () => setActingId(null) })
  }

  const categories: { key: ActiveModule; label: string; icon: React.ReactNode }[] = [
    { key: 'ALL', label: 'All Pending', icon: <FiInbox size={16} /> },
    ...MODULE_ORDER.map((module) => ({
      key: module,
      label: MODULE_META[module].label,
      icon: MODULE_META[module].icon,
    })),
  ]

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 md:flex-row">
      <aside className="shrink-0 overflow-y-auto rounded-xl border border-border bg-surface p-3 md:w-60">
        <Typography variant="overline" color="body" className="mb-2 block px-2">
          Pending Tasks
        </Typography>
        <ul className="space-y-1">
          {categories.map(({ key, label, icon }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => setActiveModule(key)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeModule === key
                    ? 'bg-accent-bg text-accent'
                    : 'text-body hover:bg-surface-2 hover:text-heading'
                }`}
              >
                {icon}
                <span className="min-w-0 flex-1 truncate">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-xl border border-border bg-surface">
        {approveRequest.isError && (
          <div className="border-b border-border px-4 py-3">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(approveRequest.error)}
            </Typography>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-surface-2" />
            ))}
          </div>
        ) : visibleApprovals.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-bg text-accent">
              <FiInbox size={22} />
            </span>
            <Typography variant="h6">You're all caught up</Typography>
            <Typography variant="body-sm" color="body">
              No pending requests need your action right now.
            </Typography>
          </div>
        ) : (
          <ul>
            {visibleApprovals.map((approval) => {
              const requester = approval.request?.user
              const name = requester ? `${requester.firstName} ${requester.lastName}` : 'Unknown employee'
              const isActing = actingId === approval.id

              return (
                <li
                  key={approval.id}
                  className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Avatar name={name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <Typography variant="body-sm" className="font-medium text-heading">
                          {name}
                        </Typography>
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-body">
                          {MODULE_META[approval.instance.module].label}
                        </span>
                        <Typography variant="caption" color="body">
                          {fromNow(approval.pendingSince ?? approval.createdAt)}
                        </Typography>
                      </div>
                      <Typography variant="body-sm" color="body" className="mt-0.5">
                        {requestSummary(approval)}
                      </Typography>
                      {approval.request?.reason && (
                        <Typography variant="caption" color="body" className="mt-0.5 line-clamp-2 block">
                          “{approval.request.reason}”
                        </Typography>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                    <Button
                      size="sm"
                      leftIcon={<FiCheck size={14} />}
                      loading={isActing && approveRequest.isPending}
                      disabled={approveRequest.isPending || rejectRequest.isPending}
                      onClick={() => handleApprove(approval)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FiX size={14} />}
                      disabled={approveRequest.isPending || rejectRequest.isPending}
                      onClick={() => setRejectTarget(approval)}
                      className="!border-red-500/40 !text-red-500 hover:!bg-red-500/10"
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <RejectRequestModal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        approval={rejectTarget}
      />
    </div>
  )
}
