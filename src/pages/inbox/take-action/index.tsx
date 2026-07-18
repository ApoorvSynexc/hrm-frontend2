import { useMemo, useState } from 'react'
import { FiCheck, FiInbox, FiX } from 'react-icons/fi'
import { Avatar, Button, Typography } from '../../../components'
import { getErrorMessage } from '../../../lib'
import { useApprovalRequest, type ApprovalModule, type PendingApproval } from '../../../services'
import { fromNow } from '../../../utils/date'
import { MODULE_META, requestSummary } from '../common'
import RejectRequestModal from './manage'

/** One large page — the inbox is grouped client-side by module. */
const FETCH_LIMIT = 100

export default function TakeAction() {
  const [activeModule, setActiveModule] = useState<'ALL' | ApprovalModule>('ALL')
  const [rejectTarget, setRejectTarget] = useState<PendingApproval | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const { getPendingApprovals, approveRequest, rejectRequest } = useApprovalRequest({
    listParams: { page: 1, limit: FETCH_LIMIT },
  })

  const approvals = useMemo(() => getPendingApprovals.data?.approvals ?? [], [getPendingApprovals.data])

  const countsByModule = useMemo(() => {
    const counts = new Map<ApprovalModule, number>()
    approvals.forEach((a) => counts.set(a.instance.module, (counts.get(a.instance.module) ?? 0) + 1))
    return counts
  }, [approvals])

  const visibleApprovals =
    activeModule === 'ALL' ? approvals : approvals.filter((a) => a.instance.module === activeModule)

  const handleApprove = (approval: PendingApproval) => {
    setActingId(approval.id)
    approveRequest.mutate({ stepInstanceId: approval.id }, { onSettled: () => setActingId(null) })
  }

  const categories: { key: 'ALL' | ApprovalModule; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'ALL', label: 'All Pending', icon: <FiInbox size={16} />, count: approvals.length },
    ...([...countsByModule.entries()].map(([module, count]) => ({
      key: module,
      label: MODULE_META[module].label,
      icon: MODULE_META[module].icon,
      count,
    })) as { key: ApprovalModule; label: string; icon: React.ReactNode; count: number }[]),
  ]

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <aside className="shrink-0 rounded-xl border border-border bg-surface p-3 md:w-60">
        <Typography variant="overline" color="body" className="mb-2 block px-2">
          Pending Tasks
        </Typography>
        <ul className="space-y-1">
          {categories.map(({ key, label, icon, count }) => (
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
                <span className="text-xs text-body">({count})</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface">
        {approveRequest.isError && (
          <div className="border-b border-border px-4 py-3">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(approveRequest.error)}
            </Typography>
          </div>
        )}

        {getPendingApprovals.isLoading ? (
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
