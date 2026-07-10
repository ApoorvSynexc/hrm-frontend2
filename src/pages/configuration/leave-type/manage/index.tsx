import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useLeaveType, type LeaveType } from '../../../../services'
import { leaveTypeSchema, type LeaveTypeFormValues } from './validations'

const GENDER_OPTIONS = [
  { label: 'Both', value: 'BOTH' },
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
]

const DEFAULT_COLOR = '#4F46E5'

type ManageLeaveTypeModalProps = {
  open: boolean
  onClose: () => void
  /** Pass a leave type to edit it; omit for create. */
  leaveType?: LeaveType | null
}

export default function ManageLeaveTypeModal({
  open,
  onClose,
  leaveType,
}: ManageLeaveTypeModalProps) {
  const isEdit = Boolean(leaveType)
  const { createLeaveType, updateLeaveType } = useLeaveType()
  const mutation = isEdit ? updateLeaveType : createLeaveType

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveTypeFormValues>({
    defaultValues: { name: '', code: '', color: DEFAULT_COLOR, applicableGender: 'BOTH' },
    resolver: joiResolver(leaveTypeSchema),
  })

  // Re-seed the form whenever the modal opens for a different leave type (or for create).
  useEffect(() => {
    if (open) {
      reset({
        name: leaveType?.name ?? '',
        code: leaveType?.code ?? '',
        color: leaveType?.color ?? DEFAULT_COLOR,
        applicableGender: leaveType?.applicableGender ?? 'BOTH',
      })
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, leaveType])

  const onSubmit = (values: LeaveTypeFormValues) => {
    const payload = {
      name: values.name,
      code: values.code.toUpperCase(),
      color: values.color,
      applicableGender: values.applicableGender,
    }

    if (isEdit && leaveType) {
      updateLeaveType.mutate({ id: leaveType.id, ...payload }, { onSuccess: onClose })
    } else {
      createLeaveType.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Leave Type' : 'Add Leave Type'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Leave Type'}
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
          placeholder="e.g. Sick Leave"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <TextField
          label="Code"
          placeholder="e.g. SICK"
          required
          error={errors.code?.message}
          {...register('code')}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <div>
              <label htmlFor="leave-type-color" className="mb-1.5 block text-sm font-medium text-heading">
                Color
                <span className="text-red-500"> *</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="leave-type-color"
                  type="color"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-surface p-1"
                />
                <TextField
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="#4F46E5"
                  className="flex-1"
                />
              </div>
              {errors.color && <p className="mt-1 text-xs text-red-500">{errors.color.message}</p>}
            </div>
          )}
        />

        <Controller
          name="applicableGender"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Applicable Gender"
              required
              options={GENDER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.applicableGender?.message}
            />
          )}
        />
      </form>
    </Modal>
  )
}
