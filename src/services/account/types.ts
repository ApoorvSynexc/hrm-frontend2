export type PermissionSummary = {
  id: string
  action: string
  subject: string
  description: string
  status: string
}

export type RolePermission = {
  id: string
  roleId: string
  permissionId: string
  status: string
  permission: PermissionSummary
}

export type Role = {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  status: string
  rolePermissions: RolePermission[]
}

export type ProfileImage = {
  id: string
  name: string
  url: string
  mimetype: string
  thumbnailUrl: string | null
}

export type Department = {
  id: string
  name: string
}

export type Designation = {
  id: string
  name: string
}

export type MobileNumber = {
  id: string
  contactId: string
  dialCode: string
  iso2: string
  country: string
  number: string
  isVerified: boolean
}

export type Contact = {
  id: string
  userId: string
  email: string
  isEmailVerified: boolean
  /** Populated via `include: { mobileNumber: true }` on GET /my-profile. */
  mobileNumber: MobileNumber | null
}

/** Backend joi: gender must be MALE | FEMALE | OTHER. */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type Profile = {
  id: string
  tenantId: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  gender: Gender | null
  maritalStatus: string | null
  status: string
  employmentStatus: string
  employeeCode: string | null
  joiningDate: string | null
  hireDate: string | null
  confirmationDate: string | null
  role: Role | null
  department: Department | null
  designation: Designation | null
  contact: Contact | null
  profile: ProfileImage | null
}

/**
 * PUT /v1/account/my-profile — every field optional, but the backend Joi
 * requires at least one key (`.min(1)`). `profile.url` must be an S3 *key*
 * (see MediaInput's reasoning in services/configuration/document-policy) —
 * upload via useFileUpload first, then send the returned `key` here.
 */
export type UpdateAccountInput = {
  email?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: Gender
  maritalStatus?: string
  contact?: { email?: string }
  mobileNumber?: { dialCode: string; iso2: string; country: string; number: string }
  profile?: { url: string; name?: string; size?: number; mimetype?: string; thumbnailUrl?: string }
}
