const SIZE = 72
const STROKE = 6
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export type BalanceRingProps = {
  label: string
  /** The numerator shown in the center and filled around the ring — e.g. usedDays. */
  value: number
  total: number
  onClick?: () => void
}

/** "8" / "8.5" — day counts can be half-days. */
function formatAmount(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1)
}

/**
 * Circular "value / total" balance indicator — used on Home's My Balances
 * card so the visual language ties into clicking through to
 * BalanceLedgerModal.
 */
export function BalanceRing({ label, value, total, onClick }: BalanceRingProps) {
  const pct = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0
  const offset = CIRCUMFERENCE * (1 - pct)

  const content = (
    <>
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm leading-none font-bold text-heading">{formatAmount(value)}</span>
          <span className="mt-0.5 text-[10px] leading-none text-body">/ {formatAmount(total)}</span>
        </div>
      </div>
      <span className="max-w-20 truncate text-xs text-body">{label}</span>
    </>
  )

  if (!onClick) {
    return <div className="flex flex-col items-center gap-1.5">{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-surface-2"
    >
      {content}
    </button>
  )
}
