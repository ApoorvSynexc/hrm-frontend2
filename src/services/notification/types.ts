/** Mirrors backend Prisma `NotificationStatus`. */
export type NotificationStatus = 'UNREAD' | 'READ' | 'DELETED'

/**
 * Mirrors backend Prisma `Notification` — always implicitly scoped to the
 * logged-in user server-side (controller filters by req.user.id).
 * `targetScreen`/`targetId` exist on the model for deep-linking, but no
 * producer/consumer wiring for them exists anywhere in the backend yet, so
 * they're typed here but not acted on.
 */
export type Notification = {
  id: string
  tenantId: string | null
  userId: string
  title: string
  body: string
  targetScreen: string | null
  targetId: string | null
  status: NotificationStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/**
 * PUT /v1/notification — id required, status required. Backend has no bulk
 * update route (only a single-row updateHandler), so "mark all as read"
 * has to issue one request per notification.
 */
export type UpdateNotificationInput = {
  id: string
  status: NotificationStatus
}

export type NotificationListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type NotificationListParams = {
  page: number
  limit: number
}
