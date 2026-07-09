const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

/**
 * Every backend endpoint responds with this envelope — never a bare payload.
 * `meta` carries pagination info (page, pageSize, total, ...) on list endpoints.
 */
export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  meta: Record<string, unknown>
}

export type HttpClient = {
  get: <T>(path: string, options?: RequestOptions) => Promise<ApiResponse<T>>
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>
  delete: <T>(path: string, options?: RequestOptions) => Promise<ApiResponse<T>>
}

type CreateHttpClientOptions = {
  /** Called when a request comes back 401 and the refresh-then-retry below didn't recover it. */
  onUnauthorized?: (error: ApiError) => void
}

let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/v1/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

/**
 * Framework-agnostic request core. Does not call any React hooks itself —
 * `onUnauthorized` is a plain callback supplied by the caller (see
 * useHttpClient in src/hooks, which is where hook access like
 * navigation/cache-clearing actually happens).
 */
export function createHttpClient(options: CreateHttpClientOptions = {}): HttpClient {
  const { onUnauthorized } = options

  async function request<T>(
    path: string,
    requestOptions: RequestOptions = {},
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const { body, headers, ...rest } = requestOptions

    const res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      // Session auth is an httpOnly cookie set by the backend on login —
      // this is what makes the browser actually send/store it, since the
      // API origin (e.g. localhost:3001) differs from the app's origin.
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const contentType = res.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await res.json().catch(() => null) : await res.text()

    if (res.status === 401) {
      if (!isRetry) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          return request<T>(path, requestOptions, true)
        }
      }

      const error = new ApiError(res.statusText || 'Unauthorized', 401, data)
      onUnauthorized?.(error)
      throw error
    }

    if (!res.ok) {
      throw new ApiError(res.statusText, res.status, data)
    }

    if (!isJson) {
      throw new ApiError(
        `Expected JSON response from ${path}, got "${contentType || 'unknown'}"`,
        res.status,
        data,
      )
    }

    return data as ApiResponse<T>
  }

  return {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  }
}
