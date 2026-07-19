import { useEffect } from 'react'
import { FiClock } from 'react-icons/fi'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Dropdown, Modal, RangeCalendar, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useLeave, useLeaveType, type LeaveBalance } from '../../../../services'
import { dayjs, formatDate } from '../../../../utils/date'
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
    setValue,
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

  const [leaveTypeId, startDate, endDate] = watch(['leaveTypeId', 'startDate', 'endDate'])
  const selectedBalance = balances.find((b) => b.leaveTypeId === leaveTypeId)
  const requestedDays = startDate && endDate ? dayjs(endDate).diff(dayjs(startDate), 'day') + 1 : null

  // Airbnb-style two-click range select — see the identical selectDate in
  // the Work From Home modal for the anchor/reset reasoning.
  const selectDate = (iso: string) => {
    if (!startDate || startDate !== endDate) {
      setValue('startDate', iso, { shouldValidate: true })
      setValue('endDate', iso, { shouldValidate: true })
      return
    }
    if (iso < startDate) {
      setValue('startDate', iso, { shouldValidate: true })
    } else {
      setValue('endDate', iso, { shouldValidate: true })
    }
  }

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
      size="xl"
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
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="flex flex-col gap-5 md:flex-row md:items-start"
      >
        {createLeave.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 w-[calc(100%+2.5rem)] bg-surface px-5 pb-3 pt-4 shadow-md md:absolute">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(createLeave.error)}
            </Typography>
          </div>
        )}

        <div className="w-full shrink-0 md:w-96">
          <RangeCalendar startDate={startDate} endDate={endDate} onSelect={selectDate} open={open} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-stretch rounded-lg border border-border">
            <div className="flex flex-1 flex-col gap-0.5 px-3.5 py-2.5">
              <span className="text-xs text-body">From</span>
              <span className="text-sm font-semibold text-heading">{formatDate(startDate)}</span>
            </div>

            {requestedDays !== null && (
              <span className="my-2.5 flex shrink-0 items-center rounded-full border border-border px-3 text-xs font-medium text-body">
                {requestedDays} day{requestedDays === 1 ? '' : 's'}
              </span>
            )}

            <div className="flex flex-1 flex-col items-end gap-0.5 px-3.5 py-2.5 text-right">
              <span className="text-xs text-body">To</span>
              <span className="text-sm font-semibold text-heading">{formatDate(endDate)}</span>
            </div>
          </div>
          {(errors.startDate?.message || errors.endDate?.message) && (
            <p className="-mt-2 text-xs text-red-500">{errors.startDate?.message ?? errors.endDate?.message}</p>
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
                />
              )}
            />
          </div>

          {requestedDays !== null && (
            <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-bg px-3 py-2 text-xs text-heading">
              <FiClock size={14} className="shrink-0 text-accent" />
              You are requesting for {requestedDays} day{requestedDays === 1 ? '' : 's'} of leave
              {selectedBalance
                ? ` · ${selectedBalance.remainingDays} of ${selectedBalance.totalDays} days remaining`
                : ''}
            </div>
          )}

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
        </div>
      </form>
    </Modal>
  )
}
