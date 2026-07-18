import { useEffect } from 'react'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useWorkFromHome, type WorkFromHomeBalance } from '../../../../services'
import { computeRequestedDays } from '../helpers'
import { workFromHomeSchema, type WorkFromHomeFormValues } from './validations'

const DAY_PART_OPTIONS = [
  { label: 'Full Day', value: 'FULL_DAY' },
  { label: 'First Half', value: 'FIRST_HALF' },
  { label: 'Second Half', value: 'SECOND_HALF' },
]

const DEFAULT_VALUES: WorkFromHomeFormValues = {
  startDate: '',
  endDate: '',
  startDateDayPart: 'FULL_DAY',
  endDateDayPart: 'FULL_DAY',
  reason: '',
}

type ManageWorkFromHomeModalProps = {
  open: boolean
  onClose: () => void
  /** For the "X of Y days remaining" helper text — null if none set up yet. */
  balance: WorkFromHomeBalance
}

export default function ManageWorkFromHomeModal({ open, onClose, balance }: ManageWorkFromHomeModalProps) {
  const { createWorkFromHome } = useWorkFromHome()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<WorkFromHomeFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: joiResolver(workFromHomeSchema),
  })

  // Re-seed the form each time the modal opens.
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES)
      createWorkFromHome.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const [startDate, endDate, startDateDayPart, endDateDayPart] = watch([
    'startDate',
    'endDate',
    'startDateDayPart',
    'endDateDayPart',
  ])
  const requestedDays =
    startDate && endDate ? computeRequestedDays(startDate, endDate, startDateDayPart, endDateDayPart) : null

  const onSubmit = (values: WorkFromHomeFormValues) => {
    createWorkFromHome.mutate(
      {
        startDate: values.startDate,
        endDate: values.endDate,
        startDateDayPart: values.startDateDayPart,
        endDateDayPart: values.endDateDayPart,
        reason: values.reason || undefined,
      },
      { onSuccess: onClose },
    )
  }

  const onInvalid = (formErrors: FieldErrors<WorkFromHomeFormValues>) => {
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
      title="Request Work From Home"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={createWorkFromHome.isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={createWorkFromHome.isPending}
            onClick={handleSubmit(onSubmit, onInvalid)}
          >
            Submit Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-4">
        {createWorkFromHome.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 bg-surface px-5 pb-3 pt-4 shadow-md">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(createWorkFromHome.error)}
            </Typography>
          </div>
        )}

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

        <div className="grid grid-cols-2 gap-3">
          <div data-field="startDateDayPart">
            <Controller
              name="startDateDayPart"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label="Start Day Part"
                  required
                  options={DAY_PART_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div data-field="endDateDayPart">
            <Controller
              name="endDateDayPart"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label="End Day Part"
                  required
                  options={DAY_PART_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {requestedDays !== null && (
          <Typography variant="body-sm" color="body">
            {requestedDays} day{requestedDays === 1 ? '' : 's'} requested
            {balance ? ` · ${balance.remainingDays} of ${balance.totalDays} days remaining` : ''}
          </Typography>
        )}

        <div>
          <label htmlFor="wfh-reason" className="mb-1.5 block text-sm font-medium text-heading">
            Reason
          </label>
          <textarea
            id="wfh-reason"
            rows={3}
            placeholder="Why are you requesting to work from home?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-body/60 focus:border-accent"
            {...register('reason')}
          />
          {errors.reason?.message && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
        </div>
      </form>
    </Modal>
  )
}
