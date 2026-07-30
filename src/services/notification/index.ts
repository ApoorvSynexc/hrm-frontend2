import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import type {
  Notification,
  NotificationListMeta,
  NotificationListParams,
  UpdateNotificationInput,
} from './types'

export type {
  Notification,
  NotificationStatus,
  NotificationListMeta,
  NotificationListParams,
  UpdateNotificationInput,
} from './types'

export const notificationKeys = {
  all: ['notification'] as const,
  list: (params: NotificationListParams) => [...notificationKeys.all, 'list', params] as const,
}

type UseNotificationOptions = {
  listParams?: NotificationListParams
}

export function useNotification({ listParams }: UseNotificationOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })

  // Defaulted once and used for BOTH key and fn — see services/employee for
  // why this must not depend on listParams having been passed by this call.
  const params = listParams ?? { page: 1, limit: 10 }

  const getNotifications = useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const res = await http.get<Notification[]>(
        `/v1/notification/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { notifications: res.data, meta: res.meta as NotificationListMeta }
    },
    enabled: Boolean(listParams),
    // The Navbar bell polls this for its unread dot, so it should never
    // serve a minutes-stale "no unread" state from the global 60s cache.
    staleTime: 0,
  })

  const updateNotification = useMutation({
    mutationFn: async (input: UpdateNotificationInput) => {
      const res = await http.put<Notification>('/v1/notification', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getNotifications,
    updateNotification,
  }
}
