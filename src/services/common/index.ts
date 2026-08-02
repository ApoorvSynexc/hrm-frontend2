import { useMutation } from '@tanstack/react-query'
import { useHttpClient } from '../../hooks'
import type { UploadedFile } from './types'

export type { UploadedFile } from './types'

/**
 * POST /v1/common/upload — multipart field name is "files" (a multer
 * `.array('files', 10)`), even for a single file. Shared by every feature
 * that needs to upload a file (document policies, profile pictures, ...).
 */
export function useFileUpload() {
  const http = useHttpClient()

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

  return { uploadFile }
}
