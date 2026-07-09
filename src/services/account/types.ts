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

export type Profile = {
  id: string
  tenantId: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  gender: string | null
  maritalStatus: string | null
  status: string
  employmentStatus: string
  employeeCode: string | null
  joiningDate: string | null
  hireDate: string | null
  role: Role | null
  department: Department | null
  designation: Designation | null
  contact: Record<string, unknown> | null
  profile: ProfileImage | null
}
