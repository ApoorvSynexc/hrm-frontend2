const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL ?? ''

/**
 * Uploaded files are persisted as just their S3 key (see
 * services/configuration/document-policy's MediaInput — the `url` field
 * holds a key, not a full URL), so the actual S3/CDN host lives only here,
 * configurable per environment via VITE_MEDIA_BASE_URL. Expects the base
 * URL to have no trailing slash and the key to have no leading slash
 * (matching what /v1/common/upload returns, e.g. "uploads/xxx_object.jpg").
 */
export function buildMediaUrl(key: string): string {
  if (!key) return key
  return `${MEDIA_BASE_URL}/${key}`
}
