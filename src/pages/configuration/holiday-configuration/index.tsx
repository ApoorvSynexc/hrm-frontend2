import { useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Table, Tabs, ToggleButton, type TableColumn } from '../../../components'
import { useHoliday, type Holiday } from '../../../services'
import { ModuleHeader } from '../common'
import ManageHolidayModal from './manage'

const PAGE_SIZE = 10

const TYPE_LABEL: Record<Holiday['type'], string> = {
  FIXED: 'Fixed',
  FESTIVAL: 'Festival',
  NATIONAL: 'National',
}

const RESTRICTION_TABS = [
  { key: 'FIXED' as const, label: 'Fixed Holidays' },
  { key: 'RESTRICTED' as const, label: 'Restricted Holidays' },
]

export default function HolidayConfigurationModule() {
  const [activeTab, setActiveTab] = useState<Holiday['restrictionType']>('FIXED')
  const [page, setPage] = useState(1)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Backend has no restrictionType filter, so pull a single large batch and
  // split it into Fixed / Restricted tabs client-side (Table paginates locally
  // since no totalItems is passed) — same pattern as role-permission's role list.
  const { getHolidays, deleteHoliday, updateHoliday } = useHoliday({
    listParams: { page: 1, limit: 100 },
  })

  const holidays = useMemo(
    () => (getHolidays.data?.holidays ?? []).filter((h) => h.restrictionType === activeTab),
    [getHolidays.data, activeTab],
  )

  const openCreate = () => {
    setEditingHoliday(null)
    setManageOpen(true)
  }

  const openEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setManageOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteHoliday.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const toggleStatus = (holiday: Holiday) => {
    setTogglingId(holiday.id)
    updateHoliday.mutate(
      { id: holiday.id, status: holiday.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
      { onSettled: () => setTogglingId(null) },
    )
  }

  const columns: TableColumn<Holiday>[] = [
    {
      key: 'serial',
      header: '#',
      width: '56px',
      render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    { key: 'name', header: 'Holiday' },
    {
      key: 'date',
      header: 'Date',
      width: '130px',
      render: (row) =>
        new Date(row.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      key: 'type',
      header: 'Type',
      width: '110px',
      render: (row) => TYPE_LABEL[row.type],
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
          label={`Toggle status for ${row.name}`}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '110px',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit ${row.name}`}
            onClick={() => openEdit(row)}
            className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${row.name}`}
            onClick={() => setDeleteTarget(row)}
            className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-red-500"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <ModuleHeader
        title="Holiday Configuration"
        description="Maintain the holiday calendar applied across the organization."
        action={
          <Button size="sm" leftIcon={<FiPlus size={16} />} onClick={openCreate}>
            Add Holiday
          </Button>
        }
      />

      <Tabs
        items={RESTRICTION_TABS}
        active={activeTab}
        onChange={(key) => {
          setActiveTab(key as Holiday['restrictionType'])
          setPage(1)
        }}
        className="mb-4"
      />

      <Table
        columns={columns}
        data={holidays}
        rowKey={(row) => row.id}
        loading={getHolidays.isLoading}
        emptyMessage={`No ${activeTab === 'FIXED' ? 'fixed' : 'restricted'} holidays added yet.`}
        pagination
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
      />

      <ManageHolidayModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        holiday={editingHoliday}
        defaultRestrictionType={editingHoliday?.restrictionType ?? activeTab}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Holiday"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteHoliday.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
