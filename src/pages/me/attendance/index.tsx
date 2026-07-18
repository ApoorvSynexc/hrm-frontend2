import { useEffect, useMemo, useState } from 'react'
import { FiLogIn, FiLogOut } from 'react-icons/fi'
import { Button, Card, Tabs, Typography } from '../../../components'
import { getErrorMessage } from '../../../lib'
import { useAttendance, type Attendance as AttendanceRecord } from '../../../services'
import { dayjs, formatDate, formatMinutes, formatTime, startOfWeek, toISODate } from '../../../utils/date'
import { AttendanceLogList } from './AttendanceLogList'
import Calendar from './Calendar'
import Regularization from '../regularization'
import { DAILY_TARGET_MINUTES, DURATION_GRADIENT } from './helpers'

const PAGE_SIZE = 10
const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const LOG_TABS = [
  { key: 'log', label: 'Attendance Log' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'requests', label: 'Attendance Requests' },
]

function useLiveClock() {
  const [now, setNow] = useState(() => dayjs())
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function Attendance() {
  const [page, setPage] = useState(1)
  const [logTab, setLogTab] = useState('log')
  const now = useLiveClock()
  const todayISO = toISODate()

  const weekDates = useMemo(() => {
    const start = startOfWeek()
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'))
  }, [])

  const { getToday, getAttendanceList, checkIn, checkOut } = useAttendance({
    listParams: { page, limit: PAGE_SIZE },
  })
  const { getAttendanceList: getWeekList } = useAttendance({
    listParams: { page: 1, limit: 7, startDate: toISODate(weekDates[0]), endDate: toISODate(weekDates[6]) },
  })

  const today = getToday.data
  const hasStartedToday = Boolean(today && 'id' in today)
  const isInSession = hasStartedToday && 'summary' in today! && today.summary.currentStatus === 'IN_SESSION'
  const todayMinutesWorked = hasStartedToday && 'summary' in today! ? today.summary.totalMinutesWorked : 0
  const progressPct = Math.min(100, Math.round((todayMinutesWorked / DAILY_TARGET_MINUTES) * 100))

  const weekRecords = getWeekList.data?.records ?? []
  const weekRecordByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>()
    weekRecords.forEach((r) => map.set(toISODate(r.date), r))
    return map
  }, [weekRecords])
  const presentDays = weekRecords.filter((r) => r.totalMinutes)
  const avgMinutes = presentDays.length
    ? Math.round(presentDays.reduce((sum, r) => sum + (r.totalMinutes ?? 0), 0) / presentDays.length)
    : 0
  const onTimePct = presentDays.length
    ? Math.round((presentDays.filter((r) => !r.isLate).length / presentDays.length) * 100)
    : 0

  const handleCheckIn = () => checkIn.mutate({ checkInMethod: 'WEB' })
  const handleCheckOut = () => {
    if (today && 'id' in today) checkOut.mutate({ id: today.id, checkOutMethod: 'WEB' })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Attendance Stats">
          <Typography variant="overline" color="body">
            This Week
          </Typography>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Typography variant="body-sm" color="body">
                Avg Hrs / Day
              </Typography>
              <Typography variant="h4">{formatMinutes(avgMinutes)}</Typography>
            </div>
            <div>
              <Typography variant="body-sm" color="body">
                On Time Arrival
              </Typography>
              <Typography variant="h4">{onTimePct}%</Typography>
            </div>
          </div>
        </Card>

        <Card title="Timings">
          <div className="flex items-center justify-between">
            {weekDates.map((d, i) => {
              const iso = toISODate(d)
              const isToday = iso === todayISO
              const hasRecord = weekRecordByDate.has(iso)
              return (
                <span
                  key={iso}
                  title={formatDate(d)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isToday
                      ? 'bg-accent text-accent-fg'
                      : hasRecord
                        ? 'bg-surface-2 text-heading'
                        : 'text-body/40'
                  }`}
                >
                  {WEEKDAY_LABELS[i]}
                </span>
              )
            })}
          </div>

          <div className="mt-4">
            <Typography variant="body-sm" color="body">
              {hasStartedToday && 'firstCheckIn' in today!
                ? `Today (${formatTime(today.firstCheckIn)} – ${
                    isInSession ? 'ongoing' : formatTime(today.lastCheckOut)
                  })`
                : 'Not checked in yet today'}
            </Typography>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progressPct}%`, background: DURATION_GRADIENT }}
              />
            </div>
            <Typography variant="caption" color="body" className="mt-1 block">
              Duration: {formatMinutes(todayMinutesWorked)}
            </Typography>
          </div>
        </Card>

        <Card title="Actions">
          <div className="flex flex-col items-center gap-3 text-center">
            <Typography variant="h3" className="font-mono tabular-nums">
              {now.format('hh:mm:ss A')}
            </Typography>

            {isInSession ? (
              <Button
                variant="danger"
                fullWidth
                leftIcon={<FiLogOut size={16} />}
                loading={checkOut.isPending}
                onClick={handleCheckOut}
              >
                Check Out
              </Button>
            ) : (
              <Button
                fullWidth
                leftIcon={<FiLogIn size={16} />}
                loading={checkIn.isPending}
                onClick={handleCheckIn}
              >
                Check In
              </Button>
            )}

            {(checkIn.isError || checkOut.isError) && (
              <Typography variant="body-sm" className="text-red-500">
                {getErrorMessage(checkIn.error ?? checkOut.error)}
              </Typography>
            )}

            <div className="mt-1 flex w-full items-center justify-between border-t border-border pt-3">
              <Typography variant="body-sm" color="body">
                Hours Today
              </Typography>
              <Typography variant="body-sm" className="font-medium text-heading">
                {formatMinutes(todayMinutesWorked)}
              </Typography>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Logs & Requests">
        <Tabs items={LOG_TABS} active={logTab} onChange={setLogTab} className="mb-4" />

        {logTab === 'log' ? (
          <AttendanceLogList
            records={getAttendanceList.data?.records ?? []}
            loading={getAttendanceList.isLoading}
            emptyMessage="No attendance records yet."
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={getAttendanceList.data?.meta.totalRecords ?? 0}
          />
        ) : logTab === 'calendar' ? (
          <Calendar />
        ) : (
          <Regularization />
        )}
      </Card>
    </div>
  )
}
