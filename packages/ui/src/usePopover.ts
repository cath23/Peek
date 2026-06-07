import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'

type Anchor = RefObject<HTMLElement | null> | HTMLElement | null

interface UsePopoverOptions {
  /** Px gap between the anchor and the popover. Default 6. */
  gap?: number
  /** z-index for the fixed popover. Default 50. */
  zIndex?: number
  /** When set, flip the popover above the anchor if there are fewer than this many px below. */
  flipHeight?: number
}

/**
 * Positions a fixed, right-aligned popover relative to an `anchor` (ref or element). Returns
 * a style object to spread onto the popover, or null while closed/unmeasured. Measures in a
 * layout effect (before paint) when `open` flips true; if `flipHeight` is given and there
 * isn't that much room below the anchor, it anchors above instead.
 */
export function usePopover(
  anchor: Anchor,
  open: boolean,
  { gap = 6, zIndex = 50, flipHeight }: UsePopoverOptions = {},
): CSSProperties | null {
  const [style, setStyle] = useState<CSSProperties | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null)
      return
    }
    const el = anchor && ('current' in anchor ? anchor.current : anchor)
    if (!el) {
      setStyle(null)
      return
    }
    const rect = el.getBoundingClientRect()
    const right = window.innerWidth - rect.right
    const flip = flipHeight != null && window.innerHeight - rect.bottom < flipHeight
    setStyle(
      flip
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + gap, right, zIndex }
        : { position: 'fixed', top: rect.bottom + gap, right, zIndex },
    )
  }, [open, anchor, gap, zIndex, flipHeight])

  return style
}
