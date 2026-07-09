import type { ElementType, HTMLAttributes, ReactNode } from 'react'

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'overline'

export type TypographyColor = 'heading' | 'body' | 'accent' | 'muted'

export type TypographyProps = {
  variant?: TypographyVariant
  color?: TypographyColor
  as?: ElementType
  className?: string
  children: ReactNode
} & Omit<HTMLAttributes<HTMLElement>, 'color'>

const VARIANT_TAG: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  overline: 'span',
}

const VARIANT_CLASS: Record<TypographyVariant, string> = {
  h1: 'text-4xl font-semibold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-medium',
  h6: 'text-base font-medium',
  body: 'text-base font-normal',
  'body-sm': 'text-sm font-normal',
  caption: 'text-xs font-normal',
  overline: 'text-xs font-medium uppercase tracking-wide',
}

const COLOR_CLASS: Record<TypographyColor, string> = {
  heading: 'text-heading',
  body: 'text-body',
  accent: 'text-accent',
  muted: 'text-body opacity-70',
}

export function Typography({
  variant = 'body',
  color,
  as,
  className = '',
  children,
  ...rest
}: TypographyProps) {
  const Component = as ?? VARIANT_TAG[variant]
  const resolvedColor: TypographyColor = color ?? (variant.startsWith('h') ? 'heading' : 'body')

  return (
    <Component
      className={`${VARIANT_CLASS[variant]} ${COLOR_CLASS[resolvedColor]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  )
}
