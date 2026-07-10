import { useEffect, type ReactNode } from 'react'
import { FiX } from 'react-icons/fi'
import { Typography } from '../Typography'

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Rendered right-aligned below the body — usually action buttons. */
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col rounded-xl border border-border bg-surface shadow-lg"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <Typography variant="h6">{title}</Typography>
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
