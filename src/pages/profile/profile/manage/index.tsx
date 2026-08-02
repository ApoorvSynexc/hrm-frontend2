import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { FiCamera } from 'react-icons/fi'
import { Controller, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Avatar, Button, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import { useAccount, useFileUpload, type Profile } from '../../../../services'
import { buildMediaUrl } from '../../../../utils/helper'
import { profileSchema, type ProfileFormValues } from './validations'

const GENDER_OPTIONS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
]

const defaultValues = (profile: Profile | null | undefined): ProfileFormValues => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  email: profile?.email ?? '',
  dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
  gender: (profile?.gender as ProfileFormValues['gender']) ?? '',
  maritalStatus: profile?.maritalStatus ?? '',
  contactEmail: profile?.contact?.email ?? '',
  dialCode: profile?.contact?.mobileNumber?.dialCode ?? '',
  iso2: profile?.contact?.mobileNumber?.iso2 ?? '',
  country: profile?.contact?.mobileNumber?.country ?? '',
  number: profile?.contact?.mobileNumber?.number ?? '',
  media: null,
})

type ManageProfileModalProps = {
  open: boolean
  onClose: () => void
  profile: Profile | null | undefined
}

export default function ManageProfileModal({ open, onClose, profile }: ManageProfileModalProps) {
  const { updateAccount } = useAccount()
  const { uploadFile } = useFileUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: defaultValues(profile),
    resolver: joiResolver(profileSchema),
  })

  // Re-seed the form each time the modal opens.
  useEffect(() => {
    if (open) {
      reset(defaultValues(profile))
      updateAccount.reset()
      uploadFile.reset()
      setLocalPreviewUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, profile])

  const media = watch('media')
  const fullName = `${watch('firstName')} ${watch('lastName')}`.trim()
  // Prefer a freshly-picked local preview (instant, no round trip back through
  // S3) over the saved picture, so the photo updates the moment it's chosen.
  const avatarSrc = media ? localPreviewUrl || undefined : buildMediaUrl(profile?.profile?.url ?? '')

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setLocalPreviewUrl(URL.createObjectURL(file))
    uploadFile.mutate(file, {
      onSuccess: (uploaded) => {
        setValue(
          'media',
          { name: file.name, size: uploaded.sizeInBytes, url: uploaded.key, mimetype: uploaded.contentType },
          { shouldValidate: true },
        )
      },
    })
  }

  const onSubmit = (values: ProfileFormValues) => {
    updateAccount.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined,
        maritalStatus: values.maritalStatus || undefined,
        contact: values.contactEmail ? { email: values.contactEmail } : undefined,
        mobileNumber: values.number
          ? { dialCode: values.dialCode, iso2: values.iso2, country: values.country, number: values.number }
          : undefined,
        profile: values.media ?? undefined,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Profile"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={updateAccount.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={updateAccount.isPending} onClick={handleSubmit(onSubmit)}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {updateAccount.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 bg-surface px-5 pb-3 pt-4 shadow-md">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(updateAccount.error)}
            </Typography>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={fullName} src={avatarSrc} size="lg" />
            <button
              type="button"
              aria-label="Change profile photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadFile.isPending}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-accent text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <FiCamera size={12} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <Typography variant="body-sm" className="font-medium text-heading">
              Profile photo
            </Typography>
            <Typography variant="caption" color="body">
              {uploadFile.isPending ? 'Uploading…' : 'Click the camera icon to change it'}
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField label="First Name" required error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Last Name" required error={errors.lastName?.message} {...register('lastName')} />
        </div>

        <TextField label="Email" type="email" required error={errors.email?.message} {...register('email')} />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Date of Birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Gender"
                placeholder="Select…"
                options={GENDER_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.gender?.message}
              />
            )}
          />
        </div>

        <TextField
          label="Marital Status"
          placeholder="e.g. Single, Married"
          error={errors.maritalStatus?.message}
          {...register('maritalStatus')}
        />

        <TextField
          label="Contact Email"
          type="email"
          placeholder="A secondary email, if different from above"
          error={errors.contactEmail?.message}
          {...register('contactEmail')}
        />

        <div data-field="number">
          <Typography variant="body-sm" className="mb-1.5 font-medium text-heading">
            Mobile Number
          </Typography>
          <div className="grid grid-cols-4 gap-3">
            <TextField placeholder="Dial code" aria-label="Dial code" {...register('dialCode')} />
            <TextField placeholder="ISO2" aria-label="Country ISO code" maxLength={2} {...register('iso2')} />
            <TextField placeholder="Country" aria-label="Country" {...register('country')} />
            <TextField placeholder="Number" aria-label="Mobile number" {...register('number')} />
          </div>
          {errors.number?.message && <p className="mt-1 text-xs text-red-500">{errors.number.message}</p>}
        </div>
      </form>
    </Modal>
  )
}
