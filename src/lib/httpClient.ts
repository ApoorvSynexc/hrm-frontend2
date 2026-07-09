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

export type HttpClient = {
  get: <T>(path: string, options?: RequestOptions) => Promise<T>
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  delete: <T>(path: string, options?: RequestOptions) => Promise<T>
}

type CreateHttpClientOptions = {
  /** Called when a request comes back 401, before the ApiError is thrown. */
  onUnauthorized?: (error: ApiError) => void
}

/**
 * Framework-agnostic request core. Does not call any React hooks itself —
 * `onUnauthorized` is a plain callback supplied by the caller (see
 * useHttpClient in src/hooks, which is where hook access like
 * navigation/cache-clearing actually happens).
 */
export function createHttpClient(options: CreateHttpClientOptions = {}): HttpClient {
  const { onUnauthorized } = options

  async function request<T>(path: string, requestOptions: RequestOptions = {}): Promise<T> {
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

    return data as T
  }

  return {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  }
}
