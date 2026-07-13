import { useState } from 'react'
import { FiClock, FiLogIn, FiLogOut } from 'react-icons/fi'
import { Button, Card, Table, Typography, type TableColumn } from '../../../components'
import { getErrorMessage } from '../../../lib'
import { useAttendance, type Attendance } from '../../../services'

const PAGE_SIZE = 10

const STATUS_LABEL: Record<Attendance['status'], string> = {
  PENDING: 'Pending',
  PRESENT: 'Present',
  ABSENT: 'Absent',
  HALF_DAY: 'Half Day',
  LEAVE: 'Leave',
  HOLIDAY: 'Holiday',
  WEEK_OFF: 'Week Off',
  MISSING_CHECKIN: 'Missing Check-in',
  MISSING_CHECKOUT: 'Missing Check-out',
  DELETED: 'Deleted',
}

const STATUS_COLOR: Record<Attendance['status'], string> = {
  PENDING: 'bg-surface-2 text-body',
  PRESENT: 'bg-green-500/15 text-green-500',
  ABSENT: 'bg-red-500/15 text-red-500',
  HALF_DAY: 'bg-amber-500/15 text-amber-500',
  LEAVE: 'bg-accent-bg text-accent',
  HOLIDAY: 'bg-accent-bg text-accent',
  WEEK_OFF: 'bg-surface-2 text-body',
  MISSING_CHECKIN: 'bg-red-500/15 text-red-500',
  MISSING_CHECKOUT: 'bg-red-500/15 text-red-500',
  DELETED: 'bg-surface-2 text-body',
}

function formatTime(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMinutes(value: number | null) {
  if (!value) return '—'
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${hours}h ${minutes}m`
}

export default function Attendance() {
  const [page, setPage] = useState(1)
  const { getToday, getAttendanceList, checkIn, checkOut } = useAttendance({
    listParams: { page, limit: PAGE_SIZE },
  })

  const today = getToday.data
  const hasStartedToday = Boolean(today && 'id' in today)
  const isInSession = hasStartedToday && 'summary' in today! && today.summary.currentStatus === 'IN_SESSION'

  const handleCheckIn = () => {
    checkIn.mutate({})
  }

  const handleCheckOut = () => {
    if (!today || !('id' in today)) return
    checkOut.mutate({ id: today.id })
  }

  const columns: TableColumn<Attendance>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => formatDate(row.date),
    },
    {
      key: 'firstCheckIn',
      header: 'Check-in',
      render: (row) => formatTime(row.firstCheckIn),
    },
    {
      key: 'lastCheckOut',
      header: 'Check-out',
      render: (row) => formatTime(row.lastCheckOut),
    },
    {
      key: 'totalMinutes',
      header: 'Hours Worked',
      render: (row) => formatMinutes(row.totalMinutes),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[row.status]}`}>
          {STATUS_LABEL[row.status]}
          {row.isLate && row.status !== 'ABSENT' ? ' · Late' : ''}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card title="Today">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent">
              <FiClock size={18} />
            </div>
            <div>
              <Typography variant="body-sm" color="body">
                {isInSession ? 'Currently checked in' : hasStartedToday ? 'Checked out' : 'Not checked in yet'}
              </Typography>
              <Typography variant="h6">
                {hasStartedToday && 'firstCheckIn' in today!
                  ? `In: ${formatTime(today.firstCheckIn)}${
                      today.lastCheckOut ? `  ·  Out: ${formatTime(today.lastCheckOut)}` : ''
                    }`
                  : '—'}
              </Typography>
            </div>
          </div>

          {(checkIn.isError || checkOut.isError) && (
            <Typography variant="body-sm" className="text-red-500">
              {getErrorMessage(checkIn.error ?? checkOut.error)}
            </Typography>
          )}

          {isInSession ? (
            <Button
              variant="danger"
              leftIcon={<FiLogOut size={16} />}
              loading={checkOut.isPending}
              onClick={handleCheckOut}
            >
              Check Out
            </Button>
          ) : (
            <Button leftIcon={<FiLogIn size={16} />} loading={checkIn.isPending} onClick={handleCheckIn}>
              Check In
            </Button>
          )}
        </div>
      </Card>

      <Card title="Attendance History">
        <Table
          columns={columns}
          data={getAttendanceList.data?.records ?? []}
          rowKey={(row) => row.id}
          loading={getAttendanceList.isLoading}
          emptyMessage="No attendance records yet."
          pagination
          page={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={getAttendanceList.data?.meta.totalRecords ?? 0}
        />
      </Card>
    </div>
  )
}
