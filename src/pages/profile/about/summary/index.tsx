import { useSession } from '../../../../hooks'
import { Card, Field, formatDate } from '../../common'

export default function Summary() {
  const { user } = useSession()

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card title="Professional Summary">
          <p className="text-sm text-body">{user?.designation?.name ?? 'No summary added yet.'}</p>
        </Card>

        <Card title="Primary Details">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field label="First Name" value={user?.firstName} />
            <Field label="Last Name" value={user?.lastName} />
            <Field label="Gender" value={user?.gender} />
            <Field label="Date of Birth" value={formatDate(user?.dateOfBirth)} />
            <Field label="Marital Status" value={user?.maritalStatus} />
            <Field label="Employee Code" value={user?.employeeCode} />
            <Field label="Joining Date" value={formatDate(user?.joiningDate)} />
            <Field label="Employment Status" value={user?.employmentStatus} />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card title="Skills">
          <p className="text-sm text-body">No skills added yet.</p>
          <button type="button" className="mt-3 text-sm font-medium text-accent hover:underline">
            + Add skills
          </button>
        </Card>

        <Card title="Praise">
          <p className="text-sm text-body">No praise yet.</p>
        </Card>
      </div>
    </div>
  )
}
