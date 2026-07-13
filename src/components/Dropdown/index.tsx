import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiChevronDown } from 'react-icons/fi'
import { useFloatingPosition } from '../../hooks'

export type DropdownSize = 'sm' | 'md' | 'lg'

export type DropdownOption = {
  label: string
  value: string
  disabled?: boolean
}

export type DropdownProps = {
  label?: string
  placeholder?: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  size?: DropdownSize
  fullWidth?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
}

const SIZE_CLASS: Record<DropdownSize, string> = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-3.5',
}

export function Dropdown({
  label,
  placeholder = 'Select…',
  options,
  value,
  onChange,
  error,
  helperText,
  size = 'md',
  fullWidth = true,
  disabled = false,
  required = false,
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const generatedId = useId()
  const triggerId = `${generatedId}-trigger`
  const describedBy = error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined

  const selected = options.find((option) => option.value === value)
  const position = useFloatingPosition(open, triggerRef)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        rootRef.current &&
        !rootRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selectOption = (option: DropdownOption) => {
    if (option.disabled) return
    onChange(option.value)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? 'w-full' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={triggerId} className="mb-1.5 block text-sm font-medium text-heading">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-lg border bg-surface text-left text-heading outline-none transition-colors ${
          SIZE_CLASS[size]
        } ${error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'} ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        }`}
      >
        <span className={selected ? '' : 'text-body/60'}>{selected ? selected.label : placeholder}</span>
        <FiChevronDown
          size={15}
          className={`shrink-0 text-body transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: position.top,
              bottom: position.bottom,
              left: position.left,
              width: position.width,
            }}
            className="z-[60] max-h-60 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-body">No options</li>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => selectOption(option)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                        option.disabled
                          ? 'cursor-not-allowed text-body/40'
                          : 'text-heading hover:bg-surface-2'
                      } ${isSelected ? 'bg-accent-bg text-accent' : ''}`}
                    >
                      {option.label}
                      {isSelected && <FiCheck size={14} />}
                    </button>
                  </li>
                )
              })
            )}
          </ul>,
          document.body,
        )}

      {error ? (
        <p id={`${generatedId}-error`} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${generatedId}-helper`} className="mt-1 text-xs text-body">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
