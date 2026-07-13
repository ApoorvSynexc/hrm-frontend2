import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useDesignation, type Designation } from '../../../../services'
import { designationSchema, type DesignationFormValues } from './validations'

type ManageDesignationModalProps = {
  open: boolean
  onClose: () => void
  /** Pass a designation to edit it; omit for create. */
  designation?: Designation | null
}

export default function ManageDesignationModal({
  open,
  onClose,
  designation,
}: ManageDesignationModalProps) {
  const isEdit = Boolean(designation)
  const { createDesignation, updateDesignation } = useDesignation()
  const mutation = isEdit ? updateDesignation : createDesignation

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DesignationFormValues>({
    defaultValues: { name: '', description: '' },
    resolver: joiResolver(designationSchema),
  })

  // Re-seed the form whenever the modal opens for a different designation (or for create).
  useEffect(() => {
    if (open) {
      reset({ name: designation?.name ?? '', description: designation?.description ?? '' })
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, designation])

  const onSubmit = (values: DesignationFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
    }

    if (isEdit && designation) {
      updateDesignation.mutate({ id: designation.id, ...payload }, { onSuccess: onClose })
    } else {
      createDesignation.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Designation' : 'Add Designation'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Designation'}
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
          placeholder="e.g. Senior Software Engineer"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label
            htmlFor="designation-description"
            className="mb-1.5 block text-sm font-medium text-heading"
          >
            Description
          </label>
          <textarea
            id="designation-description"
            rows={3}
            placeholder="What does this designation entail?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-body/60 focus:border-accent"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}
