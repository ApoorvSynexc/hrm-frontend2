import { useEffect, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { FiCalendar, FiHome, FiRepeat } from 'react-icons/fi'
import { Button, Modal, TextField, ToggleButton, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useRequestPolicy, type RequestPolicyType } from '../../../../services'
import { requestPolicySchema, type RequestPolicyFormValues } from './validations'

const TYPE_OPTIONS = [
  { label: 'Leave', value: 'LEAVE', icon: FiCalendar, description: 'Manage per-leave-type rules after creating' },
  { label: 'WFH', value: 'WFH', icon: FiHome, description: 'Work-from-home allowance rules' },
  { label: 'Regularization', value: 'REGULARIZATION', icon: FiRepeat, description: 'Attendance regularization rules' },
] as const

const DEFAULT_VALUES: RequestPolicyFormValues = {
  name: '',
  description: '',
  type: 'LEAVE',
  wfhType: 'RESTRICTED',
  wfhMaxDaysPerMonth: '4',
  wfhCarryForwardAllowed: true,
  wfhCarryForwardLimit: '4',
  wfhRequiresApproval: true,
  regType: 'RESTRICTED',
  regMaxDaysPerMonth: '2',
  regRequiresApproval: true,
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-wider text-body/60 uppercase">{title}</p>
      {children}
    </div>
  )
}

type ManageRequestPolicyModalProps = {
  open: boolean
  onClose: () => void
  /** Pre-selects Type to match the active list tab; still changeable in the form. */
  defaultType: RequestPolicyType
}

export default function ManageRequestPolicyModal({
  open,
  onClose,
  defaultType,
}: ManageRequestPolicyModalProps) {
  const { createRequestPolicy } = useRequestPolicy()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RequestPolicyFormValues>({
    defaultValues: { ...DEFAULT_VALUES, type: defaultType },
    resolver: joiResolver(requestPolicySchema),
  })

  const type = watch('type')
  const wfhType = watch('wfhType')
  const wfhCarryForwardAllowed = watch('wfhCarryForwardAllowed')
  const regType = watch('regType')

  useEffect(() => {
    if (open) {
      reset({ ...DEFAULT_VALUES, type: defaultType })
      createRequestPolicy.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultType])

  const onSubmit = (values: RequestPolicyFormValues) => {
    createRequestPolicy.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        type: values.type,
        wfhRule:
          values.type === 'WFH'
            ? {
                type: values.wfhType,
                maxDaysPerMonth:
                  values.wfhType === 'RESTRICTED' && values.wfhMaxDaysPerMonth
                    ? Number(values.wfhMaxDaysPerMonth)
                    : undefined,
                monthCarryForwardAllowed: values.wfhCarryForwardAllowed,
                monthCarryForwardLimit:
                  values.wfhCarryForwardAllowed && values.wfhCarryForwardLimit
                    ? Number(values.wfhCarryForwardLimit)
                    : undefined,
                requiresApproval: values.wfhRequiresApproval,
              }
            : undefined,
        regularizationRule:
          values.type === 'REGULARIZATION'
            ? {
                type: values.regType,
                maxDaysPerMonth:
                  values.regType === 'RESTRICTED' && values.regMaxDaysPerMonth
                    ? Number(values.regMaxDaysPerMonth)
                    : undefined,
                requiresApproval: values.regRequiresApproval,
              }
            : undefined,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Add Request Policy"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={createRequestPolicy.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={createRequestPolicy.isPending} onClick={handleSubmit(onSubmit)}>
            Create Policy
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {createRequestPolicy.isError && (
          <Typography variant="body-sm" className="text-red-500">
            {getErrorMessage(createRequestPolicy.error)}
          </Typography>
        )}

        <TextField
          label="Name"
          placeholder="e.g. Standard Leave Policy"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label htmlFor="request-policy-description" className="mb-1.5 block text-sm font-medium text-heading">
            Description
          </label>
          <textarea
            id="request-policy-description"
            rows={2}
            placeholder="What does this policy cover?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-body/60 focus:border-accent"
            {...register('description')}
          />
        </div>

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
            </div>
          )}
        />

        {type === 'WFH' && (
          <Section title="WFH Rule">
            <div className="flex flex-col gap-3">
              <Controller
                name="wfhType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {(['RESTRICTED', 'PERMANENT'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          field.value === value
                            ? 'border-accent bg-accent-bg text-accent'
                            : 'border-border bg-surface text-body hover:text-heading'
                        }`}
                      >
                        {value === 'RESTRICTED' ? 'Restricted (capped days)' : 'Permanent (unlimited)'}
                      </button>
                    ))}
                  </div>
                )}
              />

              {wfhType === 'RESTRICTED' && (
                <TextField
                  label="Max WFH Days / Month"
                  inputMode="numeric"
                  error={errors.wfhMaxDaysPerMonth?.message}
                  {...register('wfhMaxDaysPerMonth')}
                />
              )}

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-heading">Allow unused days to carry forward</span>
                <Controller
                  name="wfhCarryForwardAllowed"
                  control={control}
                  render={({ field }) => (
                    <ToggleButton size="sm" checked={field.value} onChange={field.onChange} label="Carry forward allowed" />
                  )}
                />
              </div>

              {wfhCarryForwardAllowed && (
                <TextField
                  label="Carry Forward Limit"
                  inputMode="numeric"
                  error={errors.wfhCarryForwardLimit?.message}
                  {...register('wfhCarryForwardLimit')}
                />
              )}

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-heading">Requires manager approval</span>
                <Controller
                  name="wfhRequiresApproval"
                  control={control}
                  render={({ field }) => (
                    <ToggleButton size="sm" checked={field.value} onChange={field.onChange} label="Requires approval" />
                  )}
                />
              </div>
            </div>
          </Section>
        )}

        {type === 'REGULARIZATION' && (
          <Section title="Regularization Rule">
            <div className="flex flex-col gap-3">
              <Controller
                name="regType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {(['RESTRICTED', 'UNRESTRICTED'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          field.value === value
                            ? 'border-accent bg-accent-bg text-accent'
                            : 'border-border bg-surface text-body hover:text-heading'
                        }`}
                      >
                        {value === 'RESTRICTED' ? 'Restricted (capped days)' : 'Unrestricted'}
                      </button>
                    ))}
                  </div>
                )}
              />

              {regType === 'RESTRICTED' && (
                <TextField
                  label="Max Regularizations / Month"
                  inputMode="numeric"
                  error={errors.regMaxDaysPerMonth?.message}
                  {...register('regMaxDaysPerMonth')}
                />
              )}

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-heading">Requires manager approval</span>
                <Controller
                  name="regRequiresApproval"
                  control={control}
                  render={({ field }) => (
                    <ToggleButton size="sm" checked={field.value} onChange={field.onChange} label="Requires approval" />
                  )}
                />
              </div>
            </div>
          </Section>
        )}

        {type === 'LEAVE' && (
          <p className="rounded-lg bg-surface-2 px-3 py-2.5 text-xs text-body">
            Per-leave-type rules (days/month, carry forward, etc.) are added from the policy's detail
            view once it's created.
          </p>
        )}
      </form>
    </Modal>
  )
}
