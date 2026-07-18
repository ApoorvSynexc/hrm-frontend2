import { useEffect } from 'react'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useLeave, useLeaveType, type LeaveBalance } from '../../../../services'
import { leaveSchema, type LeaveFormValues } from './validations'

const DEFAULT_VALUES: LeaveFormValues = {
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  reason: '',
}

type ManageLeaveModalProps = {
  open: boolean
  onClose: () => void
  /** Balances for the current year — leave can only be applied for types with a balance row. */
  balances: LeaveBalance[]
}

export default function ManageLeaveModal({ open, onClose, balances }: ManageLeaveModalProps) {
  const { createLeave } = useLeave()
  const { getLeaveTypes } = useLeaveType({ listParams: { page: 1, limit: 100 } })
  const leaveTypes = getLeaveTypes.data?.leaveTypes ?? []

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: joiResolver(leaveSchema),
  })

  // Re-seed the form each time the modal opens.
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES)
      createLeave.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const selectedTypeId = watch('leaveTypeId')
  const selectedBalance = balances.find((b) => b.leaveTypeId === selectedTypeId)

  const onSubmit = (values: LeaveFormValues) => {
    createLeave.mutate(
      {
        leaveTypeId: values.leaveTypeId,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason,
      },
      { onSuccess: onClose },
    )
  }

  const onInvalid = (formErrors: FieldErrors<LeaveFormValues>) => {
    const firstField = Object.keys(formErrors)[0]
    if (!firstField) return
    document
      .querySelector(`[name="${firstField}"], [data-field="${firstField}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Apply Leave"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={createLeave.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={createLeave.isPending} onClick={handleSubmit(onSubmit, onInvalid)}>
            Submit Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-4">
        {createLeave.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 bg-surface px-5 pb-3 pt-4 shadow-md">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(createLeave.error)}
            </Typography>
          </div>
        )}

        <div data-field="leaveTypeId">
          <Controller
            name="leaveTypeId"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Leave Type"
                required
                placeholder="Select leave type…"
                options={leaveTypes.map((lt) => ({ label: lt.name, value: lt.id }))}
                value={field.value}
                onChange={field.onChange}
                error={errors.leaveTypeId?.message}
                helperText={
                  selectedBalance
                    ? `${selectedBalance.remainingDays} of ${selectedBalance.totalDays} days remaining`
                    : undefined
                }
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Start Date"
            type="date"
            required
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <TextField
            label="End Date"
            type="date"
            required
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <div>
          <label htmlFor="leave-reason" className="mb-1.5 block text-sm font-medium text-heading">
            Reason<span className="text-red-500"> *</span>
          </label>
          <textarea
            id="leave-reason"
            rows={3}
            placeholder="Why are you applying for leave?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-body/60 focus:border-accent"
            {...register('reason')}
          />
          {errors.reason?.message && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
        </div>
      </form>
    </Modal>
  )
}
