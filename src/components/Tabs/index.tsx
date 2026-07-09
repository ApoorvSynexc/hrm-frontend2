import type { ReactNode } from 'react'

export type TabItem = {
  key: string
  label: string
  icon?: ReactNode
}

export type TabsVariant = 'underline' | 'pill'

export type TabsProps = {
  items: TabItem[]
  active: string
  onChange: (key: string) => void
  variant?: TabsVariant
  className?: string
}

export function Tabs({ items, active, onChange, variant = 'underline', className = '' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1 ${className}`.trim()}>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            aria-current={item.key === active ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              item.key === active
                ? 'bg-surface text-heading shadow-sm'
                : 'text-body hover:text-heading'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-6 border-b border-border ${className}`.trim()}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          aria-current={item.key === active ? 'page' : undefined}
          className={`inline-flex items-center gap-1.5 border-b-2 px-0.5 py-3 text-xs font-semibold tracking-wider uppercase transition-colors ${
            item.key === active
              ? 'border-accent text-accent'
              : 'border-transparent text-body hover:text-heading'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}
