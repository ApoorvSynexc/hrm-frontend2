import { useEffect, useState, type RefObject } from 'react'

export type FloatingPosition = { top?: number; bottom?: number; left: number; width: number }

/**
 * Computes a fixed-position rect anchored below (or above, if there isn't
 * room) an anchor element — used to portal floating panels (dropdown lists,
 * autocomplete results) to document.body so they aren't clipped by a
 * scrollable ancestor like Modal's body.
 */
export function useFloatingPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  estimatedHeight = 240,
) {
  const [position, setPosition] = useState<FloatingPosition | null>(null)

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < estimatedHeight && rect.top > spaceBelow
      setPosition(
        openUpward
          ? { bottom: window.innerHeight - rect.top + 6, left: rect.left, width: rect.width }
          : { top: rect.bottom + 6, left: rect.left, width: rect.width },
      )
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    // capture:true so scrolling inside a modal body (or any ancestor) also repositions the panel
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return position
}
