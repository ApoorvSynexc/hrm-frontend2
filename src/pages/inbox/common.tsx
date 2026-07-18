import { FiCalendar, FiClock, FiHome } from 'react-icons/fi'
import type { ApprovalModule, PendingApproval } from '../../services'
import { formatDate, formatTime } from '../../utils/date'

export const MODULE_META: Record<ApprovalModule, { label: string; icon: React.ReactNode }> = {
  LEAVE: { label: 'Leave Requests', icon: <FiCalendar size={16} /> },
  REGULARIZATION: { label: 'Regularization', icon: <FiClock size={16} /> },
  WFH: { label: 'Work From Home', icon: <FiHome size={16} /> },
  HOLIDAY: { label: 'Holiday', icon: <FiCalendar size={16} /> },
}

/** One-line, module-specific summary of the underlying request. */
export function requestSummary(approval: PendingApproval): string {
  const req = approval.request
  if (!req) return 'Details unavailable'

  switch (approval.instance.module) {
    case 'LEAVE': {
      const range =
        req.startDate && req.endDate && req.startDate.slice(0, 10) !== req.endDate.slice(0, 10)
          ? `${formatDate(req.startDate)} – ${formatDate(req.endDate)}`
          : formatDate(req.startDate)
      return `${range}${req.amount ? ` · ${req.amount} day${req.amount === 1 ? '' : 's'}` : ''}`
    }
    case 'REGULARIZATION':
      return `${formatDate(req.date)} · ${formatTime(req.requestedCheckIn)} – ${formatTime(req.requestedCheckOut)}`
    case 'WFH': {
      const range =
        req.startDate && req.endDate && req.startDate.slice(0, 10) !== req.endDate.slice(0, 10)
          ? `${formatDate(req.startDate)} – ${formatDate(req.endDate)}`
          : formatDate(req.startDate)
      return range
    }
    default:
      return 'Details unavailable'
  }
}
