import { useEffect, useMemo, useState } from 'react'
import {
  FiAward,
  FiBarChart2,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiMessageSquare,
  FiMoreVertical,
  FiPlus,
  FiSettings,
  FiThumbsUp,
} from 'react-icons/fi'
import { Avatar, Button, Card, Tabs, Typography } from '../../components'
import { useSession } from '../../hooks'
import { getErrorMessage } from '../../lib'
import { useAttendance, useEmployee, useHoliday } from '../../services'
import { dayjs, formatDate, formatMinutes, toISODate } from '../../utils/date'
import { HolidayListModal } from './HolidayListModal'

const ORG_TABS = [
  { key: 'organization', label: 'Organization' },
  { key: 'team', label: 'My Team' },
]

const COMPOSER_TABS = [
  { key: 'post', label: 'Post', icon: <FiEdit3 size={15} /> },
  { key: 'poll', label: 'Poll', icon: <FiBarChart2 size={15} /> },
  { key: 'praise', label: 'Praise', icon: <FiAward size={15} /> },
]

const CLOCK_IN_MODES = ['Web', 'Work From Home', 'Field Visit']

function useClock() {
  const [now, setNow] = useState(() => dayjs())
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function Home() {
  const { user } = useSession()
  const now = useClock()
  const [orgTab, setOrgTab] = useState('organization')
  const [composerTab, setComposerTab] = useState('post')
  const [clockInMode, setClockInMode] = useState(CLOCK_IN_MODES[0])
  const [clockInMenuOpen, setClockInMenuOpen] = useState(false)
  const [holidayIndex, setHolidayIndex] = useState(0)
  const [holidaysOpen, setHolidaysOpen] = useState(false)

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : ''

  const { getToday, checkIn, checkOut } = useAttendance()
  const { getHolidays } = useHoliday({ listParams: { page: 1, limit: 100 } })
  const { getTeamLeaveAndWfhToday } = useEmployee()
  const onLeaveToday = getTeamLeaveAndWfhToday.data?.leaves ?? []
  const workingRemotelyToday = getTeamLeaveAndWfhToday.data?.workFromHomes ?? []

  const allHolidays = useMemo(
    () => [...(getHolidays.data?.holidays ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    [getHolidays.data],
  )
  const upcomingHolidays = useMemo(() => {
    const todayISO = toISODate()
    return allHolidays.filter((h) => h.status === 'ACTIVE' && h.date.slice(0, 10) >= todayISO)
  }, [allHolidays])
  const currentHolidayIndex = Math.min(holidayIndex, Math.max(upcomingHolidays.length - 1, 0))
  const currentHoliday = upcomingHolidays[currentHolidayIndex]
  const today = getToday.data
  const hasStartedToday = Boolean(today && 'id' in today)
  const isInSession = hasStartedToday && 'summary' in today! && today.summary.currentStatus === 'IN_SESSION'
  const todayMinutesWorked = hasStartedToday && 'summary' in today! ? today.summary.totalMinutesWorked : 0

  const handleCheckIn = () => checkIn.mutate({ checkInMethod: 'WEB' })
  const handleCheckOut = () => {
    if (today && 'id' in today) checkOut.mutate({ id: today.id, checkOutMethod: 'WEB' })
  }

  const goPrevHoliday = () => setHolidayIndex((i) => Math.max(0, i - 1))
  const goNextHoliday = () => setHolidayIndex((i) => Math.min(upcomingHolidays.length - 1, i + 1))

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <div className="shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 px-8 py-10">
        <Typography variant="h2" className="!text-white">
          Welcome back{fullName ? `, ${fullName}` : ''}!
        </Typography>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <Typography variant="h5">Quick Access</Typography>
            <button
              type="button"
              aria-label="Configure quick access"
              className="rounded-lg p-1.5 text-body transition-colors hover:bg-surface-2 hover:text-heading"
            >
              <FiSettings size={16} />
            </button>
          </div>

          <div className="rounded-xl bg-accent p-5 text-accent-fg">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Time Today · {now.format('ddd, DD MMM YYYY')}</span>
              <button type="button" className="text-xs font-semibold hover:underline">
                View All
              </button>
            </div>
            <p className="mt-4 text-[11px] font-medium tracking-wide uppercase opacity-80">
              Current Time
            </p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <span className="text-3xl font-bold tabular-nums">{now.format('hh:mm:ss A')}</span>
              <div className="flex shrink-0 items-center gap-2">
                {isInSession ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="!bg-surface !text-red-600"
                    loading={checkOut.isPending}
                    onClick={handleCheckOut}
                  >
                    Check Out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="!bg-surface !text-accent"
                    loading={checkIn.isPending}
                    onClick={handleCheckIn}
                  >
                    Check In
                  </Button>
                )}
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<FiChevronDown size={14} />}
                    className="!border-accent-fg/40 !text-accent-fg hover:!bg-accent-fg/10"
                    onClick={() => setClockInMenuOpen((v) => !v)}
                  >
                    {clockInMode}
                  </Button>
                  {clockInMenuOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setClockInMenuOpen(false)}
                        className="fixed inset-0 z-10 cursor-default"
                      />
                      <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
                        {CLOCK_IN_MODES.map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setClockInMode(mode)
                              setClockInMenuOpen(false)
                            }}
                            className="flex w-full items-center px-3 py-2 text-left text-sm text-heading hover:bg-surface-2"
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs opacity-80">
              {hasStartedToday ? `Hours today: ${formatMinutes(todayMinutesWorked)}` : 'Not checked in yet today'}
            </p>

            {(checkIn.isError || checkOut.isError) && (
              <p className="mt-2 inline-block rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-700">
                {getErrorMessage(checkIn.error ?? checkOut.error)}
              </p>
            )}
          </div>

          <Card
            title="Holidays"
            action={
              <button
                type="button"
                onClick={() => setHolidaysOpen(true)}
                className="text-xs font-medium text-accent hover:underline"
              >
                View All
              </button>
            }
          >
            {getHolidays.isLoading ? (
              <div className="h-12 w-full animate-pulse rounded-lg bg-surface-2" />
            ) : upcomingHolidays.length === 0 ? (
              <Typography variant="body-sm" color="body" className="py-2 text-center">
                No upcoming holidays.
              </Typography>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous holiday"
                  onClick={goPrevHoliday}
                  disabled={currentHolidayIndex === 0}
                  className="rounded-full p-1.5 text-body transition-colors hover:bg-surface-2 hover:text-heading disabled:pointer-events-none disabled:opacity-30"
                >
                  <FiChevronLeft size={16} />
                </button>
                <div className="text-center">
                  <p className="text-lg font-semibold text-accent">{currentHoliday.name}</p>
                  <p className="mt-0.5 text-xs text-body">{formatDate(currentHoliday.date)}</p>
                </div>
                <button
                  type="button"
                  aria-label="Next holiday"
                  onClick={goNextHoliday}
                  disabled={currentHolidayIndex === upcomingHolidays.length - 1}
                  className="rounded-full p-1.5 text-body transition-colors hover:bg-surface-2 hover:text-heading disabled:pointer-events-none disabled:opacity-30"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </Card>

          <Card title="On Leave Today">
            {getTeamLeaveAndWfhToday.isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-8 w-full animate-pulse rounded-lg bg-surface-2" />
                ))}
              </div>
            ) : onLeaveToday.length === 0 ? (
              <p className="text-sm text-body">No one is on leave today.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {onLeaveToday.map((leave) => (
                  <li key={leave.id} className="flex items-center gap-2.5">
                    <Avatar
                      name={`${leave.employee.firstName} ${leave.employee.lastName}`}
                      src={leave.employee.profile?.url}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-heading">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </span>
                    {(leave.startDateDayPart !== 'FULL_DAY' || leave.endDateDayPart !== 'FULL_DAY') && (
                      <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-body">
                        Half Day
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Working Remotely">
            {getTeamLeaveAndWfhToday.isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-8 w-full animate-pulse rounded-lg bg-surface-2" />
                ))}
              </div>
            ) : workingRemotelyToday.length === 0 ? (
              <p className="text-sm text-body">
                Everyone is at office! No one is working remotely today.
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {workingRemotelyToday.map((wfh) => (
                  <li key={wfh.id} className="flex items-center gap-2.5">
                    <Avatar
                      name={`${wfh.employee.firstName} ${wfh.employee.lastName}`}
                      src={wfh.employee.profile?.url}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-heading">
                      {wfh.employee.firstName} {wfh.employee.lastName}
                    </span>
                    {(wfh.startDateDayPart !== 'FULL_DAY' || wfh.endDateDayPart !== 'FULL_DAY') && (
                      <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-body">
                        Half Day
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto lg:col-span-2">
          <Tabs
            items={ORG_TABS}
            active={orgTab}
            onChange={setOrgTab}
            variant="pill"
            className="w-fit"
          />

          <div className="rounded-xl border border-border bg-surface p-4">
            <Tabs
              items={COMPOSER_TABS}
              active={composerTab}
              onChange={setComposerTab}
              className="mb-3"
            />
            <textarea
              rows={3}
              placeholder="Write your post here and mention your peers"
              className="w-full resize-none rounded-lg border-none bg-transparent text-sm text-heading outline-none placeholder:text-body/60"
            />
          </div>

          <Card
            title="Announcements"
            action={
              <div className="flex items-center gap-2">
                <button type="button" className="text-xs font-medium text-accent hover:underline">
                  View more
                </button>
                <button
                  type="button"
                  aria-label="Add announcement"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-fg"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            }
          >
            <div className="flex gap-4">
              <div className="hidden h-24 w-24 shrink-0 rounded-lg bg-surface-2 sm:block" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading">Team Offsite — Sept 20th</p>
                <p className="mt-1 text-sm text-body">
                  Join us for a day of team-building activities and games. Lunch and transport
                  will be provided for all attendees.
                </p>
                <button type="button" className="mt-1 text-sm text-accent hover:underline">
                  view more
                </button>
                <div className="mt-3 flex items-center gap-4 text-body">
                  <span className="flex items-center gap-1.5 text-xs">
                    <FiThumbsUp size={14} /> 0
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <FiMessageSquare size={14} /> 0
                  </span>
                  <button
                    type="button"
                    aria-label="More options"
                    className="ml-auto hover:text-heading"
                  >
                    <FiMoreVertical size={14} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <HolidayListModal
        open={holidaysOpen}
        onClose={() => setHolidaysOpen(false)}
        holidays={allHolidays}
        loading={getHolidays.isLoading}
      />
    </div>
  )
}
