export { Card, ComingSoon } from '../../components'

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-body/60 uppercase">{label}</p>
      <p className="mt-0.5 text-sm text-heading">{value || '—'}</p>
    </div>
  )
}
