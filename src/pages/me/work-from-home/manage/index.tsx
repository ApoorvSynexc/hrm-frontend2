import { useEffect, useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Modal, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useWorkFromHome, type WorkFromHomeBalance } from '../../../../services'
import { dayjs, daysInMonth, formatDate, monthLabel, toISODate } from '../../../../utils/date'
import { computeRequestedDays } from '../helpers'
import { workFromHomeSchema, type WorkFromHomeFormValues } from './validations'

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const DAY_PART_OPTIONS: { label: string; value: WorkFromHomeFormValues['startDateDayPart'] }[] = [
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
  // "Full days" keeps both day-parts pinned to FULL_DAY and hides the
  // per-side controls; "Custom" reveals them for half-day start/end requests.
  const [mode, setMode] = useState<'full' | 'custom'>('full')

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
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
      setMode('full')
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
  const isSingleDay = Boolean(startDate && endDate && startDate === endDate)

  const selectMode = (next: 'full' | 'custom') => {
    setMode(next)
    if (next === 'full') {
      setValue('startDateDayPart', 'FULL_DAY')
      setValue('endDateDayPart', 'FULL_DAY')
    }
  }

  // Airbnb-style two-click range select: first click starts a fresh
  // single-day anchor (start === end); a second click completes the range
  // (swapping if the new date is earlier than the anchor); clicking again
  // after a range is already completed starts a new one.
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
      size="xl"
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
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="flex flex-col gap-5 md:flex-row md:items-start"
      >
        {createWorkFromHome.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 w-[calc(100%+2.5rem)] bg-surface px-5 pb-3 pt-4 shadow-md md:absolute">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(createWorkFromHome.error)}
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

          <div className="inline-flex w-fit rounded-lg border border-border p-1">
            {(['full', 'custom'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectMode(option)}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  mode === option ? 'bg-accent text-accent-fg' : 'text-body hover:text-heading'
                }`}
              >
                {option === 'full' ? 'Full days' : 'Custom'}
              </button>
            ))}
          </div>

          {mode === 'custom' &&
          (isSingleDay ? (
            <div data-field="startDateDayPart">
              <Typography variant="caption" color="body" className="mb-1.5 block">
                Day Part
              </Typography>
              <Controller
                name="startDateDayPart"
                control={control}
                render={({ field }) => (
                  <div className="inline-flex rounded-lg border border-border p-1">
                    {DAY_PART_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          field.onChange(option.value)
                          setValue('endDateDayPart', option.value)
                        }}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
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
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div data-field="startDateDayPart">
                <Typography variant="caption" color="body" className="mb-1.5 block">
                  Start Day Part
                </Typography>
                <Controller
                  name="startDateDayPart"
                  control={control}
                  render={({ field }) => (
                    <div className="inline-flex rounded-lg border border-border p-1">
                      {DAY_PART_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
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
              <div data-field="endDateDayPart">
                <Typography variant="caption" color="body" className="mb-1.5 block">
                  End Day Part
                </Typography>
                <Controller
                  name="endDateDayPart"
                  control={control}
                  render={({ field }) => (
                    <div className="inline-flex rounded-lg border border-border p-1">
                      {DAY_PART_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
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
            </div>
          ))}

          {requestedDays !== null && (
            <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-bg px-3 py-2 text-xs text-heading">
              <FiClock size={14} className="shrink-0 text-accent" />
              You are requesting for {requestedDays} day{requestedDays === 1 ? '' : 's'} of work from home
              {balance ? ` · ${balance.remainingDays} of ${balance.totalDays} days remaining` : ''}
            </div>
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
        </div>
      </form>
    </Modal>
  )
}

function RangeCalendar({
  startDate,
  endDate,
  onSelect,
  open,
}: {
  startDate: string
  endDate: string
  onSelect: (iso: string) => void
  open: boolean
}) {
  const now = dayjs()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1) // 1-12

  // Re-anchor to the picked range's month each time the modal opens.
  useEffect(() => {
    if (!open) return
    const d = dayjs(startDate || now)
    setYear(d.year())
    setMonth(d.month() + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

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
  const hasRange = Boolean(startDate && endDate)

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

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_HEADERS.map((label, i) => (
          <span key={i} className="pb-2 text-center text-xs font-medium text-body">
            {label}
          </span>
        ))}
        {cells.map((cell, index) => {
          if (!cell.iso) return <span key={index} />
          const isStart = cell.iso === startDate
          const isEnd = cell.iso === endDate
          const isToday = cell.iso === todayISO
          const isInBand = hasRange && cell.iso >= startDate && cell.iso <= endDate && startDate !== endDate
          const isRowStart = index % 7 === 0
          const isRowEnd = index % 7 === 6

          return (
            <div key={index} className="relative flex h-10 items-center justify-center">
              {isInBand && (
                <span
                  className={`absolute inset-y-1 left-0 right-0 bg-accent/15 ${
                    isStart || isRowStart ? 'rounded-l-full' : ''
                  } ${isEnd || isRowEnd ? 'rounded-r-full' : ''}`}
                />
              )}
              <button
                type="button"
                onClick={() => onSelect(cell.iso!)}
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                  isStart || isEnd
                    ? 'bg-accent font-semibold text-accent-fg'
                    : isToday
                      ? 'font-semibold text-accent ring-1 ring-accent'
                      : 'text-heading hover:bg-surface-2'
                }`}
              >
                {cell.day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
