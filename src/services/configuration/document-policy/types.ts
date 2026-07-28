/** Backend joi: status must be ACTIVE | INACTIVE | DELETED. */
export type DocumentPolicyStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

/** Mirrors backend Prisma `Media` — always populated via `include: { media: true }`. */
export type Media = {
  id: string
  userId: string
  name: string
  size: number
  url: string
  mimetype: string
  thumbnailUrl: string | null
  status: DocumentPolicyStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Mirrors backend Prisma `DocumentPolicy`. */
export type DocumentPolicy = {
  id: string
  tenantId: string
  mediaId: string
  name: string
  description: string | null
  status: DocumentPolicyStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  userId: string | null
  media: Media
}

/**
 * The backend's document-policy Joi schema takes the file's metadata inline
 * (not a mediaId FK) — the controller creates the Media row itself from
 * this object. Comes straight from an UploadedFile (see below).
 */
export type MediaInput = {
  name: string
  size: number
  url: string
  mimetype: string
}

/** POST /v1/config/document-policy — media required. */
export type CreateDocumentPolicyInput = {
  name: string
  description?: string
  media: MediaInput
}

/** PUT /v1/config/document-policy — id required, everything else optional. */
export type UpdateDocumentPolicyInput = {
  id: string
  name?: string
  description?: string
  media?: MediaInput
  status?: DocumentPolicyStatus
}

export type DocumentPolicyListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type DocumentPolicyListParams = {
  page: number
  limit: number
}

/**
 * One entry of POST /v1/common/upload's response `data.files` — this is
 * purely S3 metadata (no DB row, no id), which is why document-policy takes
 * the file inline as `MediaInput` rather than referencing a mediaId.
 */
export type UploadedFile = {
  url: string
  key: string
  contentType: string
  fileName: string
  sizeInBytes: number
}
