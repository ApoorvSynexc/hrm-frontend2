import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import type {
  CreateDocumentPolicyInput,
  DocumentPolicy,
  DocumentPolicyListMeta,
  DocumentPolicyListParams,
  UpdateDocumentPolicyInput,
  UploadedFile,
} from './types'

export type {
  DocumentPolicy,
  DocumentPolicyStatus,
  Media,
  MediaInput,
  CreateDocumentPolicyInput,
  UpdateDocumentPolicyInput,
  DocumentPolicyListMeta,
  DocumentPolicyListParams,
  UploadedFile,
} from './types'

export const documentPolicyKeys = {
  all: ['config', 'document-policy'] as const,
  list: (params: DocumentPolicyListParams) => [...documentPolicyKeys.all, 'list', params] as const,
  detail: (id: string) => [...documentPolicyKeys.all, 'detail', id] as const,
}

type UseDocumentPolicyOptions = {
  listParams?: DocumentPolicyListParams
  documentPolicyId?: string
}

export function useDocumentPolicy({ listParams, documentPolicyId }: UseDocumentPolicyOptions = {}) {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: documentPolicyKeys.all })

  // Defaulted once and used for BOTH key and fn: observers from different
  // useDocumentPolicy() calls can share one cache entry, and React Query may
  // run any observer's queryFn on refetch — see services/employee for why
  // this must not depend on listParams having been passed by this call.
  const params = listParams ?? { page: 1, limit: 10 }

  const getDocumentPolicies = useQuery({
    queryKey: documentPolicyKeys.list(params),
    queryFn: async () => {
      const res = await http.get<DocumentPolicy[]>(
        `/v1/config/document-policy/list?pagination=true&page=${params.page}&limit=${params.limit}`,
      )
      return { documentPolicies: res.data, meta: res.meta as DocumentPolicyListMeta }
    },
    enabled: Boolean(listParams),
  })

  const getDocumentPolicyDetail = useQuery({
    queryKey: documentPolicyKeys.detail(documentPolicyId ?? ''),
    queryFn: async () => {
      const res = await http.get<DocumentPolicy>(`/v1/config/document-policy?id=${documentPolicyId}`)
      return res.data
    },
    enabled: Boolean(documentPolicyId),
  })

  /**
   * POST /v1/common/upload — multipart field name is "files" (a multer
   * `.array('files', 10)`), even for a single file. Returns raw S3 metadata
   * only — no DB row/id — so the result is sent as-is under `media` when
   * creating/updating a document policy (see MediaInput).
   */
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('files', file)
      const res = await http.post<{ files: UploadedFile[]; totalFiles: number }>(
        '/v1/common/upload',
        formData,
      )
      return res.data.files[0]
    },
  })

  const createDocumentPolicy = useMutation({
    mutationFn: async (input: CreateDocumentPolicyInput) => {
      const res = await http.post<DocumentPolicy>('/v1/config/document-policy', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const updateDocumentPolicy = useMutation({
    mutationFn: async (input: UpdateDocumentPolicyInput) => {
      const res = await http.put<DocumentPolicy>('/v1/config/document-policy', input)
      return res.data
    },
    onSuccess: invalidate,
  })

  const deleteDocumentPolicy = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<DocumentPolicy>(`/v1/config/document-policy?id=${id}`)
      return res.data
    },
    onSuccess: invalidate,
  })

  return {
    getDocumentPolicies,
    getDocumentPolicyDetail,
    uploadFile,
    createDocumentPolicy,
    updateDocumentPolicy,
    deleteDocumentPolicy,
  }
}
