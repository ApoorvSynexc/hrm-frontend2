/** Mirrors backend Prisma `Permission`. `subject: "all"` (super-admin) is filtered out server-side. */
export type Permission = {
  id: string
  action: string
  subject: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** GET /role-permission/list?roleId= — a role's assigned permissions, each with its permission joined in. */
export type RolePermissionEntry = {
  id: string
  tenantId: string | null
  roleId: string
  permissionId: string
  status: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  permission: Permission
}

/** PUT /role-permission — replaces the role's ENTIRE permission set with permissionIds. */
export type UpdateRolePermissionsInput = {
  roleId: string
  permissionIds: string[]
}
