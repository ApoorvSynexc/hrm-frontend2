import { useEffect, useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useAttendance, useRegularization } from '../../../../services'
import {
  dayjs,
  daysInMonth,
  formatDate,
  formatMinutes,
  formatTime,
  monthLabel,
  toISODate,
} from '../../../../utils/date'
import { regularizationSchema, type RegularizationFormValues } from './validations'

const DAY_PART_OPTIONS = [
  { label: 'Full Day', value: 'FULL_DAY' },
  { label: 'First Half', value: 'FIRST_HALF' },
  { label: 'Second Half', value: 'SECOND_HALF' },
]

const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const defaultValues = (): RegularizationFormValues => ({
  date: toISODate(),
  dayPart: 'FULL_DAY',
  checkInTime: '',
  checkOutTime: '',
  reason: '',
})

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegularizationFormValues>({
    defaultValues: defaultValues(),
    resolver: joiResolver(regularizationSchema),
  })

  // Re-seed the form each time the modal opens.
  useEffect(() => {
    if (open) {
      reset(defaultValues())
      createRegularization.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const selectedDate = watch('date')
  const checkInTime = watch('checkInTime')
  const checkOutTime = watch('checkOutTime')

  // The actual attendance recorded for the picked date, shown for context
  // above the requested-time fields (mirrors why a correction is needed).
  const { getAttendanceList } = useAttendance({
    listParams: open && selectedDate ? { page: 1, limit: 1, startDate: selectedDate, endDate: selectedDate } : undefined,
  })
  const attendanceForDate = getAttendanceList.data?.records[0]

  const durationLabel = useMemo(() => {
    if (!selectedDate || !checkInTime || !checkOutTime) return null
    const minutes = dayjs(`${selectedDate}T${checkOutTime}`).diff(dayjs(`${selectedDate}T${checkInTime}`), 'minute')
    return minutes > 0 ? formatMinutes(minutes) : null
  }, [selectedDate, checkInTime, checkOutTime])

  const onSubmit = (values: RegularizationFormValues) => {
    createRegularization.mutate(
      {
        date: values.date,
        dayPart: values.dayPart,
        requestedCheckIn: `${values.date}T${values.checkInTime}`,
        requestedCheckOut: `${values.date}T${values.checkOutTime}`,
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
      size="xl"
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
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-5 md:flex-row md:items-start">
        {createRegularization.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 w-[calc(100%+2.5rem)] bg-surface px-5 pb-3 pt-4 shadow-md md:absolute">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(createRegularization.error)}
            </Typography>
          </div>
        )}

        <div className="w-full shrink-0 md:w-96">
          <MiniCalendar selectedDate={selectedDate} onSelect={(iso) => setValue('date', iso)} open={open} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-lg bg-accent-bg px-3 py-2.5">
            <Typography variant="body-sm" className="font-medium text-heading">
              Request for {formatDate(selectedDate)}
            </Typography>
          </div>

          {attendanceForDate && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg border border-border px-3 py-2.5">
              <span className="text-xs text-body">
                Check-in: <span className="font-medium text-heading">{formatTime(attendanceForDate.firstCheckIn)}</span>
              </span>
              <span className="text-xs text-body">
                Check-out: <span className="font-medium text-heading">{formatTime(attendanceForDate.lastCheckOut)}</span>
              </span>
            </div>
          )}

          <div data-field="dayPart">
            <Controller
              name="dayPart"
              control={control}
              render={({ field }) => (
                <div className="inline-flex rounded-lg border border-border p-1">
                  {DAY_PART_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        field.value === option.value
                          ? 'bg-accent text-accent-fg'
                          : 'text-body hover:text-heading'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Requested Check-in"
              type="time"
              required
              error={errors.checkInTime?.message}
              {...register('checkInTime')}
            />
            <TextField
              label="Requested Check-out"
              type="time"
              required
              error={errors.checkOutTime?.message}
              {...register('checkOutTime')}
            />
          </div>

          {durationLabel && (
            <div className="rounded-lg border border-accent/30 bg-accent-bg px-3 py-2 text-xs text-heading">
              You are marking regularization for {durationLabel}
            </div>
          )}

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
        </div>
      </form>
    </Modal>
  )
}

function MiniCalendar({
  selectedDate,
  onSelect,
  open,
}: {
  selectedDate: string
  onSelect: (iso: string) => void
  open: boolean
}) {
  const now = dayjs()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1) // 1-12

  // Re-anchor the mini calendar to the picked date's month each time the
  // modal opens, so re-opening after selecting an earlier month doesn't
  // strand the user on that browsed-to month.
  useEffect(() => {
    if (!open) return
    const d = dayjs(selectedDate || now)
    setYear(d.year())
    setMonth(d.month() + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const { getMonthly } = useAttendance({ monthlyParams: open ? { year, month } : undefined })

  const absentIsos = useMemo(
    () => (getMonthly.data?.calendar ?? []).filter((d) => d.status === 'ABSENT').map((d) => toISODate(d.date)),
    [getMonthly.data],
  )
  const absentSet = useMemo(() => new Set(absentIsos), [absentIsos])

  const cells = useMemo(() => {
    const firstOfMonth = dayjs().year(year).month(month - 1).date(1)
    const totalDays = daysInMonth(year, month)
    const leadingBlanks = firstOfMonth.day() // 0 (Sun) … 6 (Sat)

    const items: { iso: string | null; day: number | null }[] = []
    for (let i = 0; i < leadingBlanks; i++) items.push({ iso: null, day: null })
    for (let d = 1; d <= totalDays; d++) {
      items.push({ iso: toISODate(firstOfMonth.date(d)), day: d })
    }
    while (items.length % 7 !== 0) items.push({ iso: null, day: null })
    return items
  }, [year, month])

  const goToPrevMonth = () => {
    const prev = dayjs().year(year).month(month - 1).subtract(1, 'month')
    setYear(prev.year())
    setMonth(prev.month() + 1)
  }

  const goToNextMonth = () => {
    const next = dayjs().year(year).month(month - 1).add(1, 'month')
    setYear(next.year())
    setMonth(next.month() + 1)
  }

  const todayISO = toISODate(now)

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={goToPrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition-colors hover:bg-surface-2 hover:text-heading"
        >
          <FiChevronLeft size={18} />
        </button>
        <Typography variant="h6" className="font-semibold text-heading">
          {monthLabel(year, month)}
        </Typography>
        <button
          type="button"
          aria-label="Next month"
          onClick={goToNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition-colors hover:bg-surface-2 hover:text-heading"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-x-1 gap-y-4">
        {WEEKDAY_HEADERS.map((label) => (
          <span key={label} className="pb-2 text-center text-xs font-medium text-body">
            {label}
          </span>
        ))}
        {cells.map((cell, index) => {
          if (!cell.iso) return <span key={index} />
          const isSelected = cell.iso === selectedDate
          const isToday = cell.iso === todayISO
          const isAbsent = absentSet.has(cell.iso)

          return (
            <button
              type="button"
              key={index}
              onClick={() => onSelect(cell.iso!)}
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                isSelected
                  ? 'bg-accent font-semibold text-accent-fg'
                  : isToday
                    ? 'font-semibold text-accent ring-1 ring-accent'
                    : isAbsent
                      ? 'text-red-500 ring-1 ring-red-500 hover:bg-red-500/10'
                      : 'text-heading hover:bg-surface-2'
              }`}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      {absentIsos.length > 0 && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-body">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Absent ({absentIsos.length})
        </div>
      )}
    </div>
  )
}
