import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Avatar, Button, Card, ConfirmDialog, Table, ToggleButton, type TableColumn } from '../../../components'
import { useSession } from '../../../hooks'
import { useEmployee, type Employee } from '../../../services'
import ManageEmployeeModal from './manage'

const PAGE_SIZE = 10

export default function OrganizationEmployee() {
  const { user } = useSession()
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { getEmployees, deleteEmployee, updateEmployee } = useEmployee({
    listParams: { page, limit: PAGE_SIZE },
  })

  const openCreate = () => {
    setEditingEmployee(null)
    setManageOpen(true)
  }

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setManageOpen(true)
  }

  const isUndeletable = (employee: Employee) =>
    employee.id === user?.id || employee.role?.type === 'ADMIN' || employee.role?.type === 'SUPER_ADMIN'

  const confirmDelete = () => {
    if (!deleteTarget || isUndeletable(deleteTarget)) return
    deleteEmployee.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const toggleStatus = (employee: Employee) => {
    setTogglingId(employee.id)
    updateEmployee.mutate(
      { id: employee.id, status: employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const columns: TableColumn<Employee>[] = [
    {
      key: 'serial',
      header: '#',
      width: '56px',
      render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      key: 'name',
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <p className="text-sm font-medium text-heading">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-body">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => row.department?.name ?? '—',
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (row) => row.designation?.name ?? '—',
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => row.role?.name ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (row) => (
        <ToggleButton
          size="sm"
          checked={row.status === 'ACTIVE'}
          loading={togglingId === row.id}
          onChange={() => toggleStatus(row)}
          label={`Toggle status for ${row.firstName} ${row.lastName}`}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '110px',
      render: (row) => {
        const isSelf = row.id === user?.id
        const isProtectedRole = row.role?.type === 'ADMIN' || row.role?.type === 'SUPER_ADMIN'
        const blockedReason = isSelf
          ? "You can't delete your own account"
          : isProtectedRole
            ? "Admin and Super Admin accounts can't be deleted"
            : undefined
        return (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              aria-label={`Edit ${row.firstName} ${row.lastName}`}
              onClick={() => openEdit(row)}
              className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-heading"
            >
              <FiEdit2 size={15} />
            </button>
            <button
              type="button"
              aria-label={`Delete ${row.firstName} ${row.lastName}`}
              title={blockedReason}
              disabled={Boolean(blockedReason)}
              onClick={() => setDeleteTarget(row)}
              className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <Card
        title="Employees"
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Employee
          </Button>
        }
      >
        <Table
          columns={columns}
          data={getEmployees.data?.employees ?? []}
          rowKey={(row) => row.id}
          loading={getEmployees.isLoading}
          emptyMessage="No employees added yet."
          pagination
          page={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={getEmployees.data?.meta.totalRecords ?? 0}
        />
      </Card>

      <ManageEmployeeModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        employee={editingEmployee}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This action cannot be undone.`}
        loading={deleteEmployee.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
