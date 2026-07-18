import type { ReactNode } from 'react'
import { FiCheckSquare, FiFlag, FiGift } from 'react-icons/fi'
import { useSession } from '../../../../hooks'
import type { Profile } from '../../../../services'
import { dayjs, formatDate, type Dayjs } from '../../../../utils/date'
import { Card } from '../../common'

type TimelineEvent = {
  id: string
  date: Dayjs
  title: string
  note?: string
  icon: ReactNode
  colorClass: string
}

function ordinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`
}

function anniversariesSince(joiningDate: string): { date: Dayjs; count: number }[] {
  const start = dayjs(joiningDate)
  const now = dayjs()
  const results: { date: Dayjs; count: number }[] = []
  let count = 1
  while (true) {
    const anniversary = start.add(count, 'year')
    if (anniversary.isAfter(now)) break
    results.push({ date: anniversary, count })
    count += 1
  }
  return results
}

function buildEvents(user: Profile): TimelineEvent[] {
  const events: TimelineEvent[] = []

  if (user.joiningDate) {
    events.push({
      id: 'joined',
      date: dayjs(user.joiningDate),
      title: 'Joined the company',
      icon: <FiFlag size={14} />,
      colorClass: 'bg-teal-500',
    })

    for (const { date, count } of anniversariesSince(user.joiningDate)) {
      events.push({
        id: `anniversary-${count}`,
        date,
        title: 'Work Anniversary',
        note: `${ordinal(count)} Work Anniversary`,
        icon: <FiGift size={14} />,
        colorClass: 'bg-amber-500',
      })
    }
  }

  if (user.confirmationDate) {
    events.push({
      id: 'confirmed',
      date: dayjs(user.confirmationDate),
      title: 'Probation Completed',
      icon: <FiCheckSquare size={14} />,
      colorClass: 'bg-purple-500',
    })
  }

  return events.sort((a, b) => b.date.valueOf() - a.date.valueOf())
}

function groupByYear(events: TimelineEvent[]): [string, TimelineEvent[]][] {
  const map = new Map<string, TimelineEvent[]>()
  for (const event of events) {
    const year = String(event.date.year())
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(event)
  }
  return [...map.entries()]
}

export default function Timeline() {
  const { user } = useSession()
  const events = user ? buildEvents(user) : []

  return (
    <Card title="Timeline">
      {events.length === 0 ? (
        <p className="text-sm text-body">No timeline events yet.</p>
      ) : (
        <div className="relative">
          <div className="absolute top-1 bottom-1 left-[13px] w-px bg-border" />
          <div className="flex flex-col gap-6">
            {groupByYear(events).map(([year, yearEvents]) => (
              <div key={year}>
                <span className="mb-3 inline-block rounded bg-surface-2 px-2 py-0.5 text-xs font-semibold text-body">
                  {year}
                </span>
                <div className="flex flex-col gap-5">
                  {yearEvents.map((event) => (
                    <div key={event.id} className="relative flex gap-3">
                      <span
                        className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${event.colorClass}`}
                      >
                        {event.icon}
                      </span>
                      <div className="pt-0.5">
                        <p className="text-sm font-medium text-accent">{event.title}</p>
                        <p className="text-xs text-body">{formatDate(event.date)}</p>
                        {event.note && (
                          <span className="mt-1.5 inline-block rounded bg-surface-2 px-2 py-1 text-xs text-heading">
                            {event.note}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
