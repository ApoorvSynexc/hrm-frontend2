import { FiBell } from 'react-icons/fi'
import { Typography } from '../../components'
import type { Notification } from '../../services'
import { fromNow } from '../../utils/date'

type NotificationMenuProps = {
  notifications: Notification[]
  isLoading: boolean
  markingId: string | null
  markingAllRead: boolean
  onMarkRead: (notification: Notification) => void
  onMarkAllRead: () => void
}

export function NotificationMenu({
  notifications,
  isLoading,
  markingId,
  markingAllRead,
  onMarkRead,
  onMarkAllRead,
}: NotificationMenuProps) {
  const hasUnread = notifications.some((n) => n.status === 'UNREAD')

  return (
    <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Typography variant="body-sm" className="font-semibold text-heading">
          Notifications
        </Typography>
        {hasUnread && (
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={markingAllRead}
            className="text-xs font-medium text-accent transition-colors hover:underline disabled:opacity-60"
          >
            {markingAllRead ? 'Marking…' : 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-surface-2" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-bg text-accent">
              <FiBell size={18} />
            </span>
            <Typography variant="body-sm" color="body">
              No notifications yet.
            </Typography>
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => {
              const isUnread = notification.status === 'UNREAD'
              return (
                <li key={notification.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => isUnread && onMarkRead(notification)}
                    disabled={markingId === notification.id}
                    className={`flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-surface-2 disabled:opacity-60 ${
                      isUnread ? 'bg-accent-bg/40' : ''
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isUnread ? 'bg-accent' : 'bg-transparent'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${isUnread ? 'font-semibold text-heading' : 'font-medium text-heading/80'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-body">{notification.body}</p>
                      <p className="mt-1 text-[11px] text-body/70">{fromNow(notification.createdAt)}</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
