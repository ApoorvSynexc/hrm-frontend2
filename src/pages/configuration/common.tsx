import type { ReactNode } from 'react'
import { Typography } from '../../components'

export function ModuleHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body-sm" color="body" className="mt-1">
          {description}
        </Typography>
      </div>
      {action}
    </div>
  )
}
