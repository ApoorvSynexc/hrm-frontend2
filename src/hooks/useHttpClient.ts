import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHttpClient, type ApiError, type HttpClient } from '../lib'

/**
 * Hook, not a plain function: it calls useNavigate at its own top level, then
 * hands the http client a plain callback closing over it. The client itself
 * never calls a hook, so it's safe to pass its methods into queryFn/mutationFn
 * (which React does not treat as render code).
 */
export function useHttpClient(): HttpClient {
  const navigate = useNavigate()

  return useMemo(() => {
    const onUnauthorized = (_error: ApiError) => {
      // Not clearing the query cache here: the my-profile query is always
      // mounted (SessionContext) and would immediately refetch once cleared,
      // hitting 401 again and looping. Its own error state already reflects
      // "unauthorized" — just redirect.
      navigate('/login', { replace: true })
    }
    return createHttpClient({ onUnauthorized })
  }, [navigate])
}
