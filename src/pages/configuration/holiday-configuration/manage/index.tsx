import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { FiCalendar, FiFlag, FiLock, FiSun, FiUnlock } from 'react-icons/fi'
import { Button, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useSession } from '../../../../hooks'
import { useHoliday, type Holiday, type HolidayRestrictionType } from '../../../../services'
import { holidaySchema, type HolidayFormValues } from './validations'

const TYPE_OPTIONS = [
  { label: 'Fixed', value: 'FIXED', icon: FiCalendar },
  { label: 'Festival', value: 'FESTIVAL', icon: FiSun },
  { label: 'National', value: 'NATIONAL', icon: FiFlag },
] as const

const RESTRICTION_OPTIONS = [
  {
    label: 'Fixed',
    value: 'FIXED',
    icon: FiLock,
    description: 'Compulsory holiday applied to every employee',
  },
  {
    label: 'Restricted',
    value: 'RESTRICTED',
    icon: FiUnlock,
    description: 'Optional — employees choose whether to avail it',
  },
] as const

type ManageHolidayModalProps = {
  open: boolean
  onClose: () => void
  /** Pass a holiday to edit it; omit for create. */
  holiday?: Holiday | null
  /** Pre-selects Restriction Type to match the active list tab; still changeable in the form. */
  defaultRestrictionType: HolidayRestrictionType
}

export default function ManageHolidayModal({
  open,
  onClose,
  holiday,
  defaultRestrictionType,
}: ManageHolidayModalProps) {
  const isEdit = Boolean(holiday)
  const { user } = useSession()
  const { createHoliday, updateHoliday } = useHoliday()
  const mutation = isEdit ? updateHoliday : createHoliday

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HolidayFormValues>({
    defaultValues: {
      name: '',
      date: '',
      type: 'FIXED',
      restrictionType: defaultRestrictionType,
    },
    resolver: joiResolver(holidaySchema),
  })

  // Re-seed the form whenever the modal opens for a different holiday (or for create).
  useEffect(() => {
    if (open) {
      reset(
        holiday
          ? {
              name: holiday.name,
              date: holiday.date.slice(0, 10),
              type: holiday.type,
              restrictionType: holiday.restrictionType,
            }
          : { name: '', date: '', type: 'FIXED', restrictionType: defaultRestrictionType },
      )
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, holiday])

  const onSubmit = (values: HolidayFormValues) => {
    if (isEdit && holiday) {
      updateHoliday.mutate(
        {
          id: holiday.id,
          name: values.name,
          date: values.date,
          type: values.type,
          restrictionType: values.restrictionType,
          year: new Date(values.date).getFullYear(),
        },
        { onSuccess: onClose },
      )
    } else if (user) {
      createHoliday.mutate(
        {
          name: values.name,
          date: values.date,
          type: values.type,
          restrictionType: values.restrictionType,
          year: new Date(values.date).getFullYear(),
          userId: user.id,
        },
        { onSuccess: onClose },
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Holiday' : 'Add Holiday'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Holiday'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {mutation.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 bg-surface px-5 pb-3 pt-4 shadow-md">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(mutation.error)}
            </Typography>
          </div>
        )}

        <TextField
          label="Name"
          placeholder="e.g. Independence Day"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <TextField
          label="Date"
          type="date"
          required
          error={errors.date?.message}
          {...register('date')}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading">
                Type
                <span className="text-red-500"> *</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const isSelected = field.value === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent-bg text-accent'
                          : 'border-border bg-surface text-body hover:text-heading'
                      }`}
                    >
                      <Icon size={16} />
                      {option.label}
                    </button>
                  )
                })}
              </div>
              {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
            </div>
          )}
        />

        <Controller
          name="restrictionType"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading">
                Restriction Type
                <span className="text-red-500"> *</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RESTRICTION_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const isSelected = field.value === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent-bg'
                          : 'border-border bg-surface hover:border-body/30'
                      }`}
                    >
                      <span
                        className={`flex items-center gap-1.5 text-sm font-medium ${
                          isSelected ? 'text-accent' : 'text-heading'
                        }`}
                      >
                        <Icon size={14} />
                        {option.label}
                      </span>
                      <span className="text-xs text-body">{option.description}</span>
                    </button>
                  )
                })}
              </div>
              {errors.restrictionType && (
                <p className="mt-1 text-xs text-red-500">{errors.restrictionType.message}</p>
              )}
            </div>
          )}
        />
      </form>
    </Modal>
  )
}
