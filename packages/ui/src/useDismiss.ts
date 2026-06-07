import { useEffect, useRef, type RefObject } from 'react'

type DismissTarget = RefObject<HTMLElement | null> | HTMLElement | null

interface UseDismissOptions {
  /** When false, no listeners are attached (e.g. while the popover is closed). Default true. */
  enabled?: boolean
  onDismiss: () => void
  /** A click inside any of these (the surface + its anchor) does NOT dismiss. Refs or elements. */
  ignore: DismissTarget[]
  /** Also dismiss on the Escape key. Default false. */
  escape?: boolean
}

/**
 * Dismiss-on-outside-interaction hook: calls `onDismiss` on a mousedown outside every element
 * in `ignore` (and optionally on Escape). Consolidates the outside-click effect hand-rolled in
 * Peek's menus/popovers. Reads the latest callback/targets at event time, so it only
 * (re)subscribes when `enabled`/`escape` change.
 */
export function useDismiss({ enabled = true, onDismiss, ignore, escape = false }: UseDismissOptions) {
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss
  const ignoreRef = useRef(ignore)
  ignoreRef.current = ignore

  useEffect(() => {
    if (!enabled) return

    const isInside = (node: Node) =>
      ignoreRef.current.some((target) => {
        const el = target && ('current' in target ? target.current : target)
        return el?.contains(node)
      })

    const onMouseDown = (e: MouseEvent) => {
      if (!isInside(e.target as Node)) onDismissRef.current()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismissRef.current()
    }

    document.addEventListener('mousedown', onMouseDown)
    if (escape) document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      if (escape) document.removeEventListener('keydown', onKeyDown)
    }
  }, [enabled, escape])
}
