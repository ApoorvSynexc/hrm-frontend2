import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useDepartment, type Department } from '../../../../services'
import { departmentSchema, type DepartmentFormValues } from './validations'

type ManageDepartmentModalProps = {
  open: boolean
  onClose: () => void
  /** Pass a department to edit it; omit for create. */
  department?: Department | null
}

export default function ManageDepartmentModal({
  open,
  onClose,
  department,
}: ManageDepartmentModalProps) {
  const isEdit = Boolean(department)
  const { createDepartment, updateDepartment } = useDepartment()
  const mutation = isEdit ? updateDepartment : createDepartment

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    defaultValues: { name: '', description: '' },
    resolver: joiResolver(departmentSchema),
  })

  // Re-seed the form whenever the modal opens for a different department (or for create).
  useEffect(() => {
    if (open) {
      reset({ name: department?.name ?? '', description: department?.description ?? '' })
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, department])

  const onSubmit = (values: DepartmentFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
    }

    if (isEdit && department) {
      updateDepartment.mutate({ id: department.id, ...payload }, { onSuccess: onClose })
    } else {
      createDepartment.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Department' : 'Add Department'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Department'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {mutation.isError && (
          <Typography variant="body-sm" className="text-red-500">
            {getErrorMessage(mutation.error)}
          </Typography>
        )}

        <TextField
          label="Name"
          placeholder="e.g. Engineering"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label
            htmlFor="department-description"
            className="mb-1.5 block text-sm font-medium text-heading"
          >
            Description
          </label>
          <textarea
            id="department-description"
            rows={3}
            placeholder="What does this department do?"
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
