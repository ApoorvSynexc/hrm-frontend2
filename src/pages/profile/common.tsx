export { Card, ComingSoon } from '../../components'
export { formatDate } from '../../utils/date'

export function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-body/60 uppercase">{label}</p>
      <p className="mt-0.5 text-sm text-heading">{value || '—'}</p>
    </div>
  )
}
