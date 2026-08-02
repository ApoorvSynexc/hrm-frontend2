/**
 * One entry of POST /v1/common/upload's response `data.files` — this is
 * purely S3 metadata (no DB row, no id). Consumers that need to persist a
 * reference to the file (document policies, profile pictures, ...) store
 * `key` (not `url`) under whatever "url" field their own API expects, then
 * reconstruct a real clickable URL via buildMediaUrl (utils/helper) at
 * display time — the actual bucket/CDN host is only known client-side via
 * VITE_MEDIA_BASE_URL.
 */
export type UploadedFile = {
  url: string
  key: string
  contentType: string
  fileName: string
  sizeInBytes: number
}
