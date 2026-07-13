import { useEffect, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useWorkSchedulePolicy, type WorkSchedulePolicy } from '../../../../services'
import { workSchedulePolicySchema, type WorkSchedulePolicyFormValues } from './validations'
import { TIMEZONE_OPTIONS } from './timezones'

const WORKING_DAYS = [
  { label: 'Mon', value: 'MON' },
  { label: 'Tue', value: 'TUE' },
  { label: 'Wed', value: 'WED' },
  { label: 'Thu', value: 'THU' },
  { label: 'Fri', value: 'FRI' },
  { label: 'Sat', value: 'SAT' },
  { label: 'Sun', value: 'SUN' },
]

const DEFAULT_VALUES: WorkSchedulePolicyFormValues = {
  name: '',
  workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  startTime: '09:00',
  endTime: '17:00',
  breakDurationMinutes: '60',
  fullDayMinimumMinutes: '480',
  halfDayMinimumMinutes: '240',
  lateMarkAfter: '',
  graceTimeInMinutes: '0',
  timezone: 'UTC',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-wider text-body/60 uppercase">{title}</p>
      {children}
    </div>
  )
}

type ManageWorkSchedulePolicyModalProps = {
  open: boolean
  onClose: () => void
  /** Pass a policy to edit it; omit for create. */
  policy?: WorkSchedulePolicy | null
}

export default function ManageWorkSchedulePolicyModal({
  open,
  onClose,
  policy,
}: ManageWorkSchedulePolicyModalProps) {
  const isEdit = Boolean(policy)
  const { createWorkSchedulePolicy, updateWorkSchedulePolicy } = useWorkSchedulePolicy()
  const mutation = isEdit ? updateWorkSchedulePolicy : createWorkSchedulePolicy

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkSchedulePolicyFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: joiResolver(workSchedulePolicySchema),
  })

  // Re-seed the form whenever the modal opens for a different policy (or for create).
  useEffect(() => {
    if (open) {
      reset(
        policy
          ? {
              name: policy.name,
              workingDays: policy.workingDays,
              startTime: policy.startTime,
              endTime: policy.endTime,
              breakDurationMinutes: String(policy.breakDurationMinutes),
              fullDayMinimumMinutes: String(policy.fullDayMinimumMinutes),
              halfDayMinimumMinutes: String(policy.halfDayMinimumMinutes),
              lateMarkAfter: policy.lateMarkAfter ?? '',
              graceTimeInMinutes: String(policy.graceTimeInMinutes),
              timezone: policy.timezone,
            }
          : DEFAULT_VALUES,
      )
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, policy])

  const onSubmit = (values: WorkSchedulePolicyFormValues) => {
    const payload = {
      name: values.name,
      workingDays: values.workingDays as WorkSchedulePolicy['workingDays'],
      startTime: values.startTime,
      endTime: values.endTime,
      breakDurationMinutes: values.breakDurationMinutes ? Number(values.breakDurationMinutes) : undefined,
      fullDayMinimumMinutes: values.fullDayMinimumMinutes
        ? Number(values.fullDayMinimumMinutes)
        : undefined,
      halfDayMinimumMinutes: values.halfDayMinimumMinutes
        ? Number(values.halfDayMinimumMinutes)
        : undefined,
      lateMarkAfter: values.lateMarkAfter || undefined,
      graceTimeInMinutes: values.graceTimeInMinutes ? Number(values.graceTimeInMinutes) : undefined,
      timezone: values.timezone || undefined,
    }

    if (isEdit && policy) {
      updateWorkSchedulePolicy.mutate({ id: policy.id, ...payload }, { onSuccess: onClose })
    } else {
      createWorkSchedulePolicy.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit Work Schedule Policy' : 'Add Work Schedule Policy'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Policy'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {mutation.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 bg-surface px-5 pb-3 pt-4 shadow-md">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(mutation.error)}
            </Typography>
          </div>
        )}

        <TextField
          label="Name"
          placeholder="e.g. Standard 9-5"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Section title="Working Days">
          <Controller
            name="workingDays"
            control={control}
            render={({ field }) => {
              const toggleDay = (day: string) => {
                field.onChange(
                  field.value.includes(day)
                    ? field.value.filter((d) => d !== day)
                    : [...field.value, day],
                )
              }

              return (
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {WORKING_DAYS.map((day) => {
                      const isSelected = field.value.includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-accent text-accent-fg'
                              : 'bg-surface-2 text-body hover:text-heading'
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                  {errors.workingDays && (
                    <p className="mt-1 text-xs text-red-500">{errors.workingDays.message}</p>
                  )}
                </div>
              )
            }}
          />
        </Section>

        <Section title="Working Hours">
          <div className="grid grid-cols-3 gap-3">
            <TextField
              label="Start Time"
              type="time"
              required
              error={errors.startTime?.message}
              {...register('startTime')}
            />
            <TextField
              label="End Time"
              type="time"
              required
              error={errors.endTime?.message}
              {...register('endTime')}
            />
            <TextField
              label="Break Duration (min)"
              inputMode="numeric"
              error={errors.breakDurationMinutes?.message}
              {...register('breakDurationMinutes')}
            />
          </div>
        </Section>

        <Section title="Attendance Thresholds">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Full Day Minimum (min)"
              inputMode="numeric"
              error={errors.fullDayMinimumMinutes?.message}
              {...register('fullDayMinimumMinutes')}
            />
            <TextField
              label="Half Day Minimum (min)"
              inputMode="numeric"
              error={errors.halfDayMinimumMinutes?.message}
              {...register('halfDayMinimumMinutes')}
            />
          </div>
        </Section>

        <Section title="Late Tracking & Grace">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Late Mark After (HH:mm)"
              type="time"
              error={errors.lateMarkAfter?.message}
              {...register('lateMarkAfter')}
            />
            <TextField
              label="Grace Time (min)"
              inputMode="numeric"
              error={errors.graceTimeInMinutes?.message}
              {...register('graceTimeInMinutes')}
            />
          </div>
          <p className="mt-1.5 text-xs text-body">Leave Late Mark After blank to disable late tracking</p>
        </Section>

        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Timezone"
              required
              options={TIMEZONE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.timezone?.message}
            />
          )}
        />
      </form>
    </Modal>
  )
}
