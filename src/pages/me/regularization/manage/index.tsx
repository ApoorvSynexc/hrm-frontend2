import { useEffect } from 'react'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useRegularization } from '../../../../services'
import { regularizationSchema, type RegularizationFormValues } from './validations'

const DAY_PART_OPTIONS = [
  { label: 'Full Day', value: 'FULL_DAY' },
  { label: 'First Half', value: 'FIRST_HALF' },
  { label: 'Second Half', value: 'SECOND_HALF' },
]

const DEFAULT_VALUES: RegularizationFormValues = {
  date: '',
  dayPart: 'FULL_DAY',
  requestedCheckIn: '',
  requestedCheckOut: '',
  reason: '',
}

type ManageRegularizationModalProps = {
  open: boolean
  onClose: () => void
}

export default function ManageRegularizationModal({ open, onClose }: ManageRegularizationModalProps) {
  const { createRegularization } = useRegularization()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegularizationFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: joiResolver(regularizationSchema),
  })

  // Re-seed the form each time the modal opens.
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES)
      createRegularization.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (values: RegularizationFormValues) => {
    createRegularization.mutate(
      {
        date: values.date,
        dayPart: values.dayPart,
        requestedCheckIn: values.requestedCheckIn,
        requestedCheckOut: values.requestedCheckOut,
        reason: values.reason,
      },
      { onSuccess: onClose },
    )
  }

  const onInvalid = (formErrors: FieldErrors<RegularizationFormValues>) => {
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
      title="Request Regularization"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={createRegularization.isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={createRegularization.isPending}
            onClick={handleSubmit(onSubmit, onInvalid)}
          >
            Submit Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-4">
        {createRegularization.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 bg-surface px-5 pb-3 pt-4 shadow-md">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(createRegularization.error)}
            </Typography>
          </div>
        )}

        <TextField label="Date" type="date" required error={errors.date?.message} {...register('date')} />

        <div data-field="dayPart">
          <Controller
            name="dayPart"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Day Part"
                required
                options={DAY_PART_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Requested Check-in"
            type="datetime-local"
            required
            error={errors.requestedCheckIn?.message}
            {...register('requestedCheckIn')}
          />
          <TextField
            label="Requested Check-out"
            type="datetime-local"
            required
            error={errors.requestedCheckOut?.message}
            {...register('requestedCheckOut')}
          />
        </div>

        <div>
          <label htmlFor="regularization-reason" className="mb-1.5 block text-sm font-medium text-heading">
            Reason<span className="text-red-500"> *</span>
          </label>
          <textarea
            id="regularization-reason"
            rows={3}
            placeholder="Why are you requesting this correction?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-body/60 focus:border-accent"
            {...register('reason')}
          />
          {errors.reason?.message && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
        </div>
      </form>
    </Modal>
  )
}
