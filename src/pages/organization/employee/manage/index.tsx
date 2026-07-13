import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Button, Dropdown, Modal, SearchableSelect, TextField, Typography } from '../../../../components'
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

  // The employee list endpoint has no server-side search, so we fetch the
  // page above once and filter it client-side once the user has typed at
  // least MIN_MANAGER_SEARCH_CHARS characters.
  const [managerSearchTerm, setManagerSearchTerm] = useState('')
  const managerSearchResults = useMemo(() => {
    const term = managerSearchTerm.trim().toLowerCase()
    if (term.length < 3) return []
    return managers.filter((m) => `${m.firstName} ${m.lastName}`.toLowerCase().includes(term))
  }, [managers, managerSearchTerm])

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
      departmentId: values.departmentId,
      designationId: values.designationId,
      roleId: values.roleId,
      reportingManagerId: values.reportingManagerId,
    }

    if (isEdit && employee) {
      updateEmployee.mutate({ id: employee.id, ...shared }, { onSuccess: onClose })
    } else {
      createEmployee.mutate({ ...shared, password: values.password }, { onSuccess: onClose })
    }
  }

  // If the user has scrolled down to fill later fields, a validation error
  // on an earlier field (or the top error banner) can end up off-screen with
  // nothing visibly wrong — scroll the first offending field into view.
  const onInvalid = (formErrors: FieldErrors<EmployeeFormValues>) => {
    const firstField = Object.keys(formErrors)[0]
    if (!firstField) return
    document
      .querySelector(`[name="${firstField}"], [data-field="${firstField}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
          <Button size="sm" loading={mutation.isPending} onClick={handleSubmit(onSubmit, onInvalid)}>
            {isEdit ? 'Save Changes' : 'Create Employee'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-4">
        {mutation.isError && (
          <div className="sticky -top-4 z-20 -mx-5 -mb-1 bg-surface px-5 pb-3 pt-4 shadow-md">
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(mutation.error)}
            </Typography>
          </div>
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
          <div data-field="departmentId">
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label="Department"
                  required
                  options={departments.map((d) => ({ label: d.name, value: d.id }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.departmentId?.message}
                />
              )}
            />
          </div>
          <div data-field="designationId">
            <Controller
              name="designationId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label="Designation"
                  required
                  options={designations.map((d) => ({ label: d.name, value: d.id }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.designationId?.message}
                />
              )}
            />
          </div>
        </div>

        <div data-field="roleId">
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
        </div>

        <div data-field="reportingManagerId">
          <Controller
            name="reportingManagerId"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                label="Reporting Manager"
                required
                placeholder="Search employee by name…"
                data={managerSearchResults}
                selectedKey={field.value}
                selectedItem={managers.find((m) => m.id === field.value) ?? null}
                isLoading={getEmployees.isLoading}
                onSearch={setManagerSearchTerm}
                onSelect={(m) => field.onChange(m.id)}
                onRemove={() => field.onChange('')}
                minCharRequired={3}
                displayFormat={(m) => `${m.firstName} ${m.lastName}`}
                noOptionsMessage="No matching employees"
                error={errors.reportingManagerId?.message}
              />
            )}
          />
        </div>
      </form>
    </Modal>
  )
}
