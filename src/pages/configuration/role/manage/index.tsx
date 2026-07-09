import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useRole, type Role } from '../../../../services'
import { roleSchema, type RoleFormValues } from './validations'

type ManageRoleModalProps = {
  open: boolean
  onClose: () => void
  /** Pass a role to edit it; omit for create. */
  role?: Role | null
}

export default function ManageRoleModal({ open, onClose, role }: ManageRoleModalProps) {
  const isEdit = Boolean(role)
  const { createRole, updateRole } = useRole()
  const mutation = isEdit ? updateRole : createRole

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    defaultValues: { name: '', description: '' },
    resolver: joiResolver(roleSchema),
  })

  // Re-seed the form whenever the modal opens for a different role (or for create).
  useEffect(() => {
    if (open) {
      reset({ name: role?.name ?? '', description: role?.description ?? '' })
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, role])

  const onSubmit = (values: RoleFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
    }

    if (isEdit && role) {
      updateRole.mutate({ id: role.id, ...payload }, { onSuccess: onClose })
    } else {
      createRole.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Role' : 'Add Role'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Role'}
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
          placeholder="e.g. HR Manager"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label
            htmlFor="role-description"
            className="mb-1.5 block text-sm font-medium text-heading"
          >
            Description
          </label>
          <textarea
            id="role-description"
            rows={3}
            placeholder="What is this role responsible for?"
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
