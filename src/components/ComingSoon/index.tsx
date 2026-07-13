import { Typography } from '../Typography'

export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
      <Typography variant="body-sm" color="body">
        {label} coming soon.
      </Typography>
    </div>
  )
}
