import { useState } from 'react'
import type { HTMLAttributes } from 'react'
import { FiUser } from 'react-icons/fi'

export type AvatarSize = 'sm' | 'md' | 'lg'
export type AvatarShape = 'circle' | 'square'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export type AvatarProps = {
  src?: string
  alt?: string
  name?: string
  size?: AvatarSize
  shape?: AvatarShape
  status?: AvatarStatus
} & Omit<HTMLAttributes<HTMLSpanElement>, 'color'>

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

const SHAPE_CLASS: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-lg',
}

const STATUS_COLOR_CLASS: Record<AvatarStatus, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
}

const STATUS_SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
}

const ICON_SIZE: Record<AvatarSize, number> = {
  sm: 14,
  md: 18,
  lg: 24,
}

function getInitials(name?: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
  ...rest
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(src) && !imageFailed
  const initials = getInitials(name)

  return (
    <span
      className={`relative inline-flex shrink-0 select-none ${SIZE_CLASS[size]} ${className}`.trim()}
      {...rest}
    >
      <span
        className={`flex h-full w-full items-center justify-center overflow-hidden bg-accent-bg font-medium text-accent ${SHAPE_CLASS[shape]}`}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name ?? 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : initials ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          <FiUser size={ICON_SIZE[size]} aria-hidden="true" />
        )}
      </span>
      {status && (
        <span
          role="status"
          aria-label={status}
          className={`absolute right-0 bottom-0 rounded-full ring-2 ring-surface-2 ${STATUS_COLOR_CLASS[status]} ${STATUS_SIZE_CLASS[size]}`}
        />
      )}
    </span>
  )
}
