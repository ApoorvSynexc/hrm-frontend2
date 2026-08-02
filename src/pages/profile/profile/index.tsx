import { useState } from 'react'
import { FiEdit2 } from 'react-icons/fi'
import { Button } from '../../../components'
import { useSession } from '../../../hooks'
import { Card, Field, formatDate } from '../common'
import ManageProfileModal from './manage'

const GENDER_LABEL: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
}

export default function ProfileTab() {
  const { user } = useSession()
  const [manageOpen, setManageOpen] = useState(false)

  const mobileNumber = user?.contact?.mobileNumber
  const mobileDisplay = mobileNumber
    ? `+${mobileNumber.dialCode} ${mobileNumber.number}`
    : undefined

  return (
    <div className="flex flex-col gap-4">
      <Card
        title="Personal Information"
        action={
          <Button size="sm" variant="outline" leftIcon={<FiEdit2 size={14} />} onClick={() => setManageOpen(true)}>
            Edit Profile
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First Name" value={user?.firstName} />
          <Field label="Last Name" value={user?.lastName} />
          <Field label="Email" value={user?.email} />
          <Field label="Date of Birth" value={user?.dateOfBirth ? formatDate(user.dateOfBirth) : undefined} />
          <Field label="Gender" value={user?.gender ? GENDER_LABEL[user.gender] : undefined} />
          <Field label="Marital Status" value={user?.maritalStatus} />
          <Field label="Contact Email" value={user?.contact?.email} />
          <Field label="Mobile Number" value={mobileDisplay} />
        </div>
      </Card>

      <ManageProfileModal open={manageOpen} onClose={() => setManageOpen(false)} profile={user} />
    </div>
  )
}
