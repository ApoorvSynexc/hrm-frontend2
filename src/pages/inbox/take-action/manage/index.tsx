import { useEffect, useState } from 'react'
import { Button, Modal, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useApprovalRequest, type PendingApproval } from '../../../../services'
import { MODULE_META, requestSummary } from '../../common'

type RejectRequestModalProps = {
  open: boolean
  onClose: () => void
  /** The pending approval being rejected; null while closed. */
  approval: PendingApproval | null
}

export default function RejectRequestModal({ open, onClose, approval }: RejectRequestModalProps) {
  const { rejectRequest } = useApprovalRequest()
  const [rejectionReason, setRejectionReason] = useState('')

  // Re-seed each time the modal opens.
  useEffect(() => {
    if (open) {
      setRejectionReason('')
      rejectRequest.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const confirmReject = () => {
    if (!approval || !rejectionReason.trim()) return
    rejectRequest.mutate(
      { stepInstanceId: approval.id, rejectionReason: rejectionReason.trim() },
      { onSuccess: onClose },
    )
  }

  const requesterName = approval?.request?.user
    ? `${approval.request.user.firstName} ${approval.request.user.lastName}`
    : 'this employee'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject Request"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={rejectRequest.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={rejectRequest.isPending}
            disabled={!rejectionReason.trim()}
            onClick={confirmReject}
          >
            Reject Request
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {rejectRequest.isError && (
          <Typography variant="body-sm" className="text-red-500">
            {getErrorMessage(rejectRequest.error)}
          </Typography>
        )}
        <Typography variant="body-sm" color="body">
          Rejecting <span className="font-medium text-heading">{requesterName}</span>'s{' '}
          {MODULE_META[approval?.instance.module ?? 'LEAVE'].label.toLowerCase()} request (
          {approval ? requestSummary(approval) : ''}).
        </Typography>
        <div>
          <label htmlFor="rejection-reason" className="mb-1.5 block text-sm font-medium text-heading">
            Reason<span className="text-red-500"> *</span>
          </label>
          <textarea
            id="rejection-reason"
            rows={3}
            maxLength={500}
            placeholder="Let them know why this is being rejected…"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-body/60 focus:border-accent"
          />
        </div>
      </div>
    </Modal>
  )
}
