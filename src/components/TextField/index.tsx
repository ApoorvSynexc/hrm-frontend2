import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

export type TextFieldSize = 'sm' | 'md' | 'lg'
export type TextFieldVariant = 'outline' | 'filled'

export type TextFieldProps = {
  label?: string
  error?: string
  helperText?: string
  size?: TextFieldSize
  variant?: TextFieldVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>

const SIZE_CLASS: Record<TextFieldSize, string> = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-3.5',
}

const ICON_INSET_CLASS: Record<TextFieldSize, string> = {
  sm: 'left-2.5',
  md: 'left-3',
  lg: 'left-3.5',
}

const ICON_INSET_END_CLASS: Record<TextFieldSize, string> = {
  sm: 'right-2.5',
  md: 'right-3',
  lg: 'right-3.5',
}

const VARIANT_CLASS: Record<TextFieldVariant, string> = {
  outline: 'bg-surface border border-border focus:border-accent',
  filled: 'bg-surface-2 border border-transparent focus:border-accent',
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    error,
    helperText,
    size = 'md',
    variant = 'outline',
    leftIcon,
    rightIcon,
    fullWidth = true,
    id,
    className = '',
    required,
    ...rest
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-heading">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-body ${ICON_INSET_CLASS[size]}`}
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full rounded-lg text-heading outline-none transition-colors placeholder:text-body/60 ${
            SIZE_CLASS[size]
          } ${VARIANT_CLASS[variant]} ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''} ${
            error ? 'border-red-500 focus:border-red-500' : ''
          } ${className}`.trim()}
          {...rest}
        />
        {rightIcon && (
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-body ${ICON_INSET_END_CLASS[size]}`}
          >
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="mt-1 text-xs text-body">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})
