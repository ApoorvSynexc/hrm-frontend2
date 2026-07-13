import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { FiLoader, FiSearch, FiX } from 'react-icons/fi'
import { useFloatingPosition } from '../../hooks'

export type SearchableSelectSize = 'sm' | 'md' | 'lg'

export type SearchableSelectProps<T> = {
  // UI Props
  label?: string
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  size?: SearchableSelectSize
  fullWidth?: boolean
  className?: string

  // Data Props
  data: T[]
  selectedKey: string
  /**
   * The full selected object, used to render the display label without
   * waiting for it to reappear in a fresh `data` search result. Falls back
   * to looking `selectedKey` up inside `data` when omitted.
   */
  selectedItem?: T | null
  isLoading?: boolean

  // Callback Props
  onSearch: (searchTerm: string) => void
  onSelect: (item: T) => void
  onRemove: () => void

  // Configuration Props
  minCharRequired?: number
  debounceTime?: number
  displayFormat?: (item: T) => string
  renderItem?: (item: T) => ReactNode
  getOptionKey?: (item: T) => string
  noOptionsMessage?: string
}

const SIZE_CLASS: Record<SearchableSelectSize, string> = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-3.5',
}

function defaultGetOptionKey<T>(item: T): string {
  const candidate = item as unknown as { id?: string; value?: string }
  return candidate.id ?? candidate.value ?? String(item)
}

function defaultDisplayFormat<T>(item: T): string {
  const candidate = item as unknown as { label?: string; name?: string }
  return candidate.label ?? candidate.name ?? String(item)
}

export function SearchableSelect<T>({
  label,
  placeholder = 'Search…',
  error,
  helperText,
  disabled = false,
  required = false,
  size = 'md',
  fullWidth = true,
  className = '',
  data,
  selectedKey,
  selectedItem,
  isLoading = false,
  onSearch,
  onSelect,
  onRemove,
  minCharRequired = 2,
  debounceTime = 300,
  displayFormat = defaultDisplayFormat,
  renderItem,
  getOptionKey = defaultGetOptionKey,
  noOptionsMessage = 'No results found',
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const generatedId = useId()
  const inputId = `${generatedId}-input`
  const describedBy = error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined

  const resolvedSelected = selectedItem ?? data.find((item) => getOptionKey(item) === selectedKey) ?? null
  const position = useFloatingPosition(open, inputRef)

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
        setIsSearching(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setIsSearching(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const startSearch = () => {
    if (disabled) return
    setIsSearching(true)
    setQuery('')
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = e.target.value
    setQuery(nextQuery)
    setOpen(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (nextQuery.trim().length < minCharRequired) return
    debounceRef.current = setTimeout(() => onSearch(nextQuery.trim()), debounceTime)
  }

  const selectItem = (item: T) => {
    onSelect(item)
    setIsSearching(false)
    setOpen(false)
    setQuery('')
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove()
    setQuery('')
  }

  const showDisplayValue = Boolean(resolvedSelected) && !isSearching
  const belowMinChars = query.trim().length < minCharRequired

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? 'w-full' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-heading">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div
        className={`flex w-full items-center gap-2 rounded-lg border bg-surface text-heading outline-none transition-colors ${
          SIZE_CLASS[size]
        } ${error ? 'border-red-500' : 'border-border focus-within:border-accent'} ${
          disabled ? 'cursor-not-allowed opacity-60' : ''
        }`}
      >
        <FiSearch size={14} className="shrink-0 text-body" />

        {showDisplayValue ? (
          <button
            type="button"
            disabled={disabled}
            onClick={startSearch}
            className="flex-1 truncate text-left"
          >
            {resolvedSelected ? displayFormat(resolvedSelected) : ''}
          </button>
        ) : (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            disabled={disabled}
            value={query}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            aria-autocomplete="list"
            aria-expanded={open}
            role="combobox"
            onFocus={() => setOpen(true)}
            onChange={handleChange}
            className="w-full flex-1 bg-transparent outline-none placeholder:text-body/60"
          />
        )}

        {isLoading && <FiLoader size={14} className="shrink-0 animate-spin text-body" />}

        {resolvedSelected && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={handleRemove}
            className="shrink-0 rounded p-0.5 text-body transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {open &&
        !showDisplayValue &&
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
            {belowMinChars ? (
              <li className="px-3 py-2 text-sm text-body">
                Type at least {minCharRequired} character{minCharRequired === 1 ? '' : 's'} to search
              </li>
            ) : isLoading ? (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-body">
                <FiLoader size={14} className="animate-spin" /> Searching…
              </li>
            ) : data.length === 0 ? (
              <li className="px-3 py-2 text-sm text-body">{noOptionsMessage}</li>
            ) : (
              data.map((item) => {
                const key = getOptionKey(item)
                const isSelected = key === selectedKey
                return (
                  <li key={key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectItem(item)}
                      className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                        isSelected ? 'bg-accent-bg text-accent' : 'text-heading'
                      }`}
                    >
                      {renderItem ? renderItem(item) : displayFormat(item)}
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
