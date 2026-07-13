import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import {
  useDepartment,
  useDesignation,
  useEmployee,
  useRole,
  type Employee,
} from '../../../../services'
import { employeeSchema, type EmployeeFormValues } from './validations'

const DEFAULT_VALUES: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  hireDate: '',
  departmentId: '',
  designationId: '',
  roleId: '',
  reportingManagerId: '',
}

type ManageEmployeeModalProps = {
  open: boolean
  onClose: () => void
  /** Pass an employee to edit it; omit for create. */
  employee?: Employee | null
}

export default function ManageEmployeeModal({ open, onClose, employee }: ManageEmployeeModalProps) {
  const isEdit = Boolean(employee)
  const { createEmployee, updateEmployee } = useEmployee()
  const mutation = isEdit ? updateEmployee : createEmployee

  const { getDepartments } = useDepartment({ listParams: { page: 1, limit: 100 } })
  const { getDesignations } = useDesignation({ listParams: { page: 1, limit: 100 } })
  const { getRoles } = useRole({ listParams: { page: 1, limit: 100 } })
  const { getEmployees } = useEmployee({ listParams: { page: 1, limit: 100 } })

  const departments = getDepartments.data?.departments ?? []
  const designations = getDesignations.data?.designations ?? []
  const roles = getRoles.data?.roles ?? []
  const managers = (getEmployees.data?.employees ?? []).filter((e) => e.id !== employee?.id)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: joiResolver(employeeSchema),
  })

  // Re-seed the form whenever the modal opens for a different employee (or for create).
  useEffect(() => {
    if (open) {
      reset(
        employee
          ? {
              firstName: employee.firstName,
              lastName: employee.lastName,
              email: employee.email,
              password: '',
              hireDate: employee.hireDate ? employee.hireDate.slice(0, 10) : '',
              departmentId: employee.departmentId ?? '',
              designationId: employee.designationId ?? '',
              roleId: employee.roleId ?? '',
              reportingManagerId: employee.reportingManagerId ?? '',
            }
          : DEFAULT_VALUES,
      )
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee])

  const onSubmit = (values: EmployeeFormValues) => {
    const shared = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      hireDate: values.hireDate || undefined,
      departmentId: values.departmentId || undefined,
      designationId: values.designationId || undefined,
      roleId: values.roleId,
      reportingManagerId: values.reportingManagerId || undefined,
    }

    if (isEdit && employee) {
      updateEmployee.mutate({ id: employee.id, ...shared }, { onSuccess: onClose })
    } else {
      createEmployee.mutate({ ...shared, password: values.password }, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" loading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save Changes' : 'Create Employee'}
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

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="First Name"
            placeholder="e.g. Priya"
            required
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <TextField
            label="Last Name"
            placeholder="e.g. Sharma"
            required
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <TextField
          label="Email"
          type="email"
          placeholder="e.g. priya.sharma@company.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        {!isEdit && (
          <TextField
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            required
            helperText="The employee can change this after first login"
            error={errors.password?.message}
            {...register('password')}
          />
        )}

        <TextField label="Hire Date" type="date" error={errors.hireDate?.message} {...register('hireDate')} />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Department"
                options={departments.map((d) => ({ label: d.name, value: d.id }))}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="designationId"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Designation"
                options={designations.map((d) => ({ label: d.name, value: d.id }))}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Controller
          name="roleId"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Role"
              required
              options={roles.map((r) => ({ label: r.name, value: r.id }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.roleId?.message}
            />
          )}
        />

        <Controller
          name="reportingManagerId"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Reporting Manager"
              options={managers.map((m) => ({ label: `${m.firstName} ${m.lastName}`, value: m.id }))}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </form>
    </Modal>
  )
}
