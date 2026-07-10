import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { FiPlus, FiX } from 'react-icons/fi'
import { Button, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useAttendancePolicy, type AttendancePolicy } from '../../../../services'
import { attendancePolicySchema, type AttendancePolicyFormValues } from './validations'

const POLICY_TYPE_OPTIONS = [
  { label: 'Flexible', value: 'FLEXIBLE' },
  { label: 'Strict', value: 'STRICT' },
]

type ManageAttendancePolicyModalProps = {
  open: boolean
  onClose: () => void
  /** Pass a policy to edit it; omit for create. */
  policy?: AttendancePolicy | null
}

export default function ManageAttendancePolicyModal({
  open,
  onClose,
  policy,
}: ManageAttendancePolicyModalProps) {
  const isEdit = Boolean(policy)
  const { createAttendancePolicy, updateAttendancePolicy } = useAttendancePolicy()
  const mutation = isEdit ? updateAttendancePolicy : createAttendancePolicy
  const [ssidInput, setSsidInput] = useState('')

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AttendancePolicyFormValues>({
    defaultValues: {
      name: '',
      description: '',
      policyType: 'FLEXIBLE',
      radiusMeters: '100',
      wifiSsids: [],
    },
    resolver: joiResolver(attendancePolicySchema),
  })

  const isStrict = watch('policyType') === 'STRICT'

  // Re-seed the form whenever the modal opens for a different policy (or for create).
  useEffect(() => {
    if (open) {
      reset({
        name: policy?.name ?? '',
        description: policy?.description ?? '',
        policyType: policy?.policyType ?? 'FLEXIBLE',
        radiusMeters: policy ? String(policy.radiusMeters) : '100',
        wifiSsids: policy?.wifiSsids ?? [],
      })
      setSsidInput('')
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, policy])

  const onSubmit = (values: AttendancePolicyFormValues) => {
    const isStrictSubmit = values.policyType === 'STRICT'
    const payload = {
      name: values.name,
      description: values.description || undefined,
      policyType: values.policyType,
      radiusMeters: isStrictSubmit && values.radiusMeters ? Number(values.radiusMeters) : undefined,
      wifiSsids: isStrictSubmit && values.wifiSsids.length > 0 ? values.wifiSsids : undefined,
    }

    if (isEdit && policy) {
      updateAttendancePolicy.mutate({ id: policy.id, ...payload }, { onSuccess: onClose })
    } else {
      createAttendancePolicy.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Attendance Policy' : 'Add Attendance Policy'}
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {mutation.isError && (
          <Typography variant="body-sm" className="text-red-500">
            {getErrorMessage(mutation.error)}
          </Typography>
        )}

        <TextField
          label="Name"
          placeholder="e.g. Office Attendance Policy"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label
            htmlFor="attendance-policy-description"
            className="mb-1.5 block text-sm font-medium text-heading"
          >
            Description
          </label>
          <textarea
            id="attendance-policy-description"
            rows={3}
            placeholder="What does this policy cover?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading outline-none transition-colors placeholder:text-body/60 focus:border-accent"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <Controller
          name="policyType"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Policy Type"
              required
              options={POLICY_TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.policyType?.message}
            />
          )}
        />

        {isStrict && (
          <>
            <TextField
              label="Geofence Radius (meters)"
              placeholder="100"
              required
              inputMode="numeric"
              error={errors.radiusMeters?.message}
              {...register('radiusMeters')}
            />

            <Controller
              name="wifiSsids"
              control={control}
              render={({ field }) => {
                const addSsid = () => {
                  const value = ssidInput.trim()
                  if (!value || field.value.includes(value)) return
                  field.onChange([...field.value, value])
                  setSsidInput('')
                }
                const removeSsid = (ssid: string) => {
                  field.onChange(field.value.filter((s) => s !== ssid))
                }

                return (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-heading">
                      Office WiFi SSIDs
                      <span className="text-red-500"> *</span>
                    </label>
                    <div className="flex gap-2">
                      <TextField
                        value={ssidInput}
                        onChange={(e) => setSsidInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addSsid()
                          }
                        }}
                        placeholder="e.g. Office-5G"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSsid}
                        leftIcon={<FiPlus size={16} />}
                      >
                        Add
                      </Button>
                    </div>
                    {field.value.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {field.value.map((ssid) => (
                          <span
                            key={ssid}
                            className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-heading"
                          >
                            {ssid}
                            <button
                              type="button"
                              aria-label={`Remove ${ssid}`}
                              onClick={() => removeSsid(ssid)}
                              className="text-body transition-colors hover:text-red-500"
                            >
                              <FiX size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.wifiSsids && (
                      <p className="mt-1 text-xs text-red-500">{errors.wifiSsids.message}</p>
                    )}
                  </div>
                )
              }}
            />
          </>
        )}
      </form>
    </Modal>
  )
}
