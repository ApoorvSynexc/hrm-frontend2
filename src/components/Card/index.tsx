import type { ReactNode } from 'react'
import { Typography } from '../Typography'

export type CardProps = {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function Card({ title, action, children }: CardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Typography variant="h6">{title}</Typography>
        {action}
      </div>
      {children}
    </div>
  )
}
