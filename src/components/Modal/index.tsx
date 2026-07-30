import { useEffect, type ReactNode } from 'react'
import { FiX } from 'react-icons/fi'
import { Typography } from '../Typography'

export type ModalSize = 'md' | 'lg' | 'xl' | '2xl'

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Rendered right-aligned below the body — usually action buttons. */
  footer?: ReactNode
  /** Rendered in the header, between the title and the close button — e.g. year navigation. */
  headerExtra?: ReactNode
  /** Controls max-width. Defaults to 'md' (max-w-md) for compact forms. */
  size?: ModalSize
}

const SIZE_CLASS: Record<ModalSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
}

export function Modal({ open, onClose, title, children, footer, headerExtra, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[90vh] w-full flex-col rounded-xl border border-border bg-surface shadow-lg ${SIZE_CLASS[size]}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <Typography variant="h6">{title}</Typography>
            {headerExtra}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
