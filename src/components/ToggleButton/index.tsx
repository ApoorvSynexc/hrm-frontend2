export type ToggleButtonSize = 'sm' | 'md' | 'lg'

export type ToggleButtonProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  size?: ToggleButtonSize
  label?: string
  className?: string
}

const TRACK_SIZE_CLASS: Record<ToggleButtonSize, string> = {
  sm: 'h-4.5 w-8',
  md: 'h-5.5 w-10',
  lg: 'h-6.5 w-12',
}

const THUMB_SIZE_CLASS: Record<ToggleButtonSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const THUMB_TRANSLATE_CLASS: Record<ToggleButtonSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-[1.125rem]',
  lg: 'translate-x-[1.375rem]',
}

export function ToggleButton({
  checked,
  onChange,
  disabled = false,
  loading = false,
  size = 'md',
  label,
  className = '',
}: ToggleButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={loading}
      disabled={isDisabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors outline-none ${
        TRACK_SIZE_CLASS[size]
      } ${checked ? 'bg-accent' : 'bg-surface-2'} ${
        isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${className}`.trim()}
    >
      <span
        className={`inline-block translate-x-0.5 rounded-full bg-white shadow transition-transform ${
          THUMB_SIZE_CLASS[size]
        } ${checked ? THUMB_TRANSLATE_CLASS[size] : ''}`}
      />
    </button>
  )
}
