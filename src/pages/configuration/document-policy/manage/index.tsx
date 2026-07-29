import { useEffect, useRef, type ChangeEvent } from 'react'
import { FiFile, FiUpload, FiX } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useDocumentPolicy, type DocumentPolicy } from '../../../../services'
import { buildMediaUrl } from '../../../../utils/helper'
import { documentPolicySchema, type DocumentPolicyFormValues } from './validations'

/** "2.3 MB" / "512 B" — used only for the picked-file summary below. */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const DEFAULT_VALUES: DocumentPolicyFormValues = { name: '', description: '', media: null }

type ManageDocumentPolicyModalProps = {
  open: boolean
  onClose: () => void
  /** Pass a document policy to edit it; omit for create. */
  documentPolicy?: DocumentPolicy | null
}

export default function ManageDocumentPolicyModal({
  open,
  onClose,
  documentPolicy,
}: ManageDocumentPolicyModalProps) {
  const isEdit = Boolean(documentPolicy)
  const { uploadFile, createDocumentPolicy, updateDocumentPolicy } = useDocumentPolicy()
  const mutation = isEdit ? updateDocumentPolicy : createDocumentPolicy
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentPolicyFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: joiResolver(documentPolicySchema),
  })

  // Re-seed the form whenever the modal opens for a different policy (or for create).
  useEffect(() => {
    if (open) {
      reset({
        name: documentPolicy?.name ?? '',
        description: documentPolicy?.description ?? '',
        media: documentPolicy?.media
          ? {
              name: documentPolicy.media.name,
              size: documentPolicy.media.size,
              url: documentPolicy.media.url,
              mimetype: documentPolicy.media.mimetype,
            }
          : null,
      })
      mutation.reset()
      uploadFile.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentPolicy])

  const media = watch('media')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset so picking the same file again still fires onChange
    if (!file) return

    uploadFile.mutate(file, {
      onSuccess: (uploaded) => {
        setValue(
          // `url` here is the S3 key (see MediaInput) — the actual base URL
          // is only known client-side via VITE_MEDIA_BASE_URL, applied at
          // display time through buildMediaUrl.
          'media',
          { name: file.name, size: uploaded.sizeInBytes, url: uploaded.key, mimetype: uploaded.contentType },
          { shouldValidate: true },
        )
      },
    })
  }

  const onSubmit = (values: DocumentPolicyFormValues) => {
    if (!values.media) return // Joi already blocks submit without a file; this just narrows the type
    const payload = {
      name: values.name,
      description: values.description || undefined,
      media: values.media,
    }

    if (isEdit && documentPolicy) {
      updateDocumentPolicy.mutate({ id: documentPolicy.id, ...payload }, { onSuccess: onClose })
    } else {
      createDocumentPolicy.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Document Policy' : 'Add Document Policy'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={mutation.isPending}
            disabled={uploadFile.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? 'Save Changes' : 'Create Policy'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {mutation.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 bg-surface px-5 pb-3 pt-4 shadow-md">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(mutation.error)}
            </Typography>
          </div>
        )}

        <TextField
          label="Name"
          placeholder="e.g. Employee Handbook"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label htmlFor="document-policy-description" className="mb-1.5 block text-sm font-medium text-heading">
            Description
          </label>
          <textarea
            id="document-policy-description"
            rows={3}
            placeholder="What is this policy about?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-body/60 focus:border-accent"
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div data-field="media">
          <label className="mb-1.5 block text-sm font-medium text-heading">
            File<span className="text-red-500"> *</span>
          </label>

          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

          {media ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
              <a
                href={buildMediaUrl(media.url)}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm text-heading hover:underline"
              >
                <FiFile size={16} className="shrink-0 text-body" />
                <span className="truncate">{media.name}</span>
                <span className="shrink-0 text-xs text-body">({formatFileSize(media.size)})</span>
              </a>
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => setValue('media', null, { shouldValidate: true })}
                className="shrink-0 rounded-lg p-1.5 text-body transition-colors hover:bg-surface-2 hover:text-red-500"
              >
                <FiX size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadFile.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-sm text-body transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-60"
            >
              <FiUpload size={16} />
              {uploadFile.isPending ? 'Uploading…' : 'Click to upload a file'}
            </button>
          )}
          {errors.media?.message && <p className="mt-1 text-xs text-red-500">{errors.media.message}</p>}
          {uploadFile.isError && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(uploadFile.error)}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}
