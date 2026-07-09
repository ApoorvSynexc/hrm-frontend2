import { useEffect, useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { Button, TextField, Typography } from '../../../components'
import { getErrorMessage } from '../../../lib'
import { useRole, useRolePermission } from '../../../services'
import { ModuleHeader } from '../common'

const ACTION_ORDER = ['manage', 'create', 'read', 'update', 'delete', 'approve']

const SUBJECT_ORDER = [
  'tenant',
  'user',
  'role',
  'permission',
  'permission_role',
  'employee',
  'department',
  'designation',
  'leave',
  'leave_configuration',
  'leave_type',
  'payroll',
  'attendance',
  'attendance_regularization',
  'attendance_policy',
  'work_schedule_policy',
  'approval_workflow',
  'request_policy',
  'holiday_configuration',
  'work_from_home',
]

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function orderBy(known: string[], present: Set<string>): string[] {
  const knownPresent = known.filter((value) => present.has(value))
  const unknown = [...present].filter((value) => !known.includes(value)).sort()
  return [...knownPresent, ...unknown]
}

export default function RolePermissionModule() {
  const [roleId, setRoleId] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [original, setOriginal] = useState<Set<string>>(new Set())

  const { getRoles } = useRole({ listParams: { page: 1, limit: 100 } })
  const { getPermissions, getRolePermissions, updatePermissions } = useRolePermission({
    roleId: roleId || undefined,
  })

  const roles = getRoles.data?.roles ?? []
  const permissions = getPermissions.data ?? []
  const selectedRole = roles.find((role) => role.id === roleId) ?? null
  const isAdminRole = selectedRole?.name?.toUpperCase() === 'ADMIN'

  // Clear immediately on role switch so the matrix doesn't flash the
  // previous role's selections while the new role's data is still loading.
  useEffect(() => {
    setSelected(new Set())
    setOriginal(new Set())
  }, [roleId])

  useEffect(() => {
    if (!getRolePermissions.data) return
    const ids = new Set(getRolePermissions.data.map((entry) => entry.permissionId))
    setSelected(ids)
    setOriginal(ids)
  }, [getRolePermissions.data])

  const bySubjectAction = useMemo(() => {
    const map = new Map<string, Map<string, (typeof permissions)[number]>>()
    for (const permission of permissions) {
      if (!map.has(permission.subject)) map.set(permission.subject, new Map())
      map.get(permission.subject)!.set(permission.action, permission)
    }
    return map
  }, [permissions])

  const subjects = useMemo(
    () => orderBy(SUBJECT_ORDER, new Set(bySubjectAction.keys())),
    [bySubjectAction],
  )
  const actions = useMemo(
    () => orderBy(ACTION_ORDER, new Set(permissions.map((p) => p.action))),
    [permissions],
  )

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return subjects
    return subjects.filter((subject) => toTitleCase(subject).toLowerCase().includes(query))
  }, [subjects, search])

  const isDirty = useMemo(() => {
    if (selected.size !== original.size) return true
    for (const id of selected) if (!original.has(id)) return true
    return false
  }, [selected, original])

  const togglePermission = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const columnIds = (action: string) =>
    subjects
      .map((subject) => bySubjectAction.get(subject)?.get(action)?.id)
      .filter((id): id is string => Boolean(id))

  const isColumnFullySelected = (action: string) => {
    const ids = columnIds(action)
    return ids.length > 0 && ids.every((id) => selected.has(id))
  }

  const toggleColumn = (action: string) => {
    const ids = columnIds(action)
    const allSelected = ids.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (allSelected) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }

  const isAllSelected = permissions.length > 0 && selected.size === permissions.length

  const toggleAll = () => {
    setSelected(isAllSelected ? new Set() : new Set(permissions.map((p) => p.id)))
  }

  const handleReset = () => setSelected(new Set(original))

  const handleSave = () => {
    if (!roleId) return
    updatePermissions.mutate({ roleId, permissionIds: Array.from(selected) })
  }

  const isLoadingMatrix = getPermissions.isLoading || (Boolean(roleId) && getRolePermissions.isLoading)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <ModuleHeader
          title="Role Permissions"
          description="Assign granular create/read/update/delete permissions to each role."
        />
      </div>

      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-xs">
          <label htmlFor="role-permission-role" className="mb-1.5 block text-sm font-medium text-heading">
            Role
          </label>
          <select
            id="role-permission-role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-heading outline-none transition-colors focus:border-accent"
          >
            <option value="">Select a role…</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {roleId && (
          <TextField
            placeholder="Search modules…"
            leftIcon={<FiSearch size={15} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
            fullWidth={false}
            className="w-full sm:w-56"
          />
        )}
      </div>

      {!roleId ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
          <Typography variant="body-sm" color="body">
            Select a role above to view and manage its permissions.
          </Typography>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {isAdminRole && (
            <div className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-600">
              The Admin role has full access by default and its permissions cannot be modified.
            </div>
          )}

          {updatePermissions.isError && (
            <Typography variant="body-sm" className="shrink-0 text-red-500">
              {getErrorMessage(updatePermissions.error)}
            </Typography>
          )}

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <Typography variant="body-sm" color="body">
              {selected.size} of {permissions.length} permissions selected
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!isDirty || updatePermissions.isPending}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                loading={updatePermissions.isPending}
                disabled={!isDirty || isAdminRole}
              >
                Save Changes
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky top-0 z-10 bg-surface-2 px-4 py-3 text-left font-medium text-body">
                    <label className="flex w-fit items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleAll}
                        disabled={isAdminRole || permissions.length === 0}
                        className="h-4 w-4 rounded border-border accent-[var(--accent)]"
                      />
                      Module
                    </label>
                  </th>
                  {actions.map((action) => (
                    <th
                      key={action}
                      className="sticky top-0 z-10 bg-surface-2 px-4 py-3 text-center font-medium text-body"
                    >
                      <label className="flex flex-col items-center gap-1.5">
                        <span>{toTitleCase(action)}</span>
                        <input
                          type="checkbox"
                          checked={isColumnFullySelected(action)}
                          onChange={() => toggleColumn(action)}
                          disabled={isAdminRole}
                          className="h-4 w-4 rounded border-border accent-[var(--accent)]"
                        />
                      </label>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoadingMatrix ? (
                  Array.from({ length: 6 }).map((_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
                      </td>
                      {actions.map((action) => (
                        <td key={action} className="px-4 py-3 text-center">
                          <div className="mx-auto h-4 w-4 animate-pulse rounded bg-surface-2" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={actions.length + 1} className="px-4 py-8 text-center text-body">
                      No modules match your search.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((subject) => (
                    <tr
                      key={subject}
                      className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-2"
                    >
                      <td className="px-4 py-2.5 font-medium text-heading">{toTitleCase(subject)}</td>
                      {actions.map((action) => {
                        const permission = bySubjectAction.get(subject)?.get(action)
                        return (
                          <td key={action} className="px-4 py-2.5 text-center">
                            {permission ? (
                              <input
                                type="checkbox"
                                checked={selected.has(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                disabled={isAdminRole}
                                className="h-4 w-4 rounded border-border accent-[var(--accent)]"
                              />
                            ) : (
                              <span className="text-body/30">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
