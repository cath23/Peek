import { type ReactNode } from 'react'
import { cn } from './lib/cn'

interface ShortcutBadgeProps {
  children: ReactNode
  className?: string
}

/**
 * Keyboard-shortcut chip (a `<kbd>`): inset background, subtle border, 12px secondary text.
 * Used in menus, search inputs, and command hints. Tweak per-site via `className`
 * (e.g. `bg-transparent` for an inline hint, `min-w-[18px]` for a fixed-width key).
 * Font uses an explicit arbitrary size so tailwind-merge can't drop it beside the colour.
 */
export function ShortcutBadge({ children, className }: ShortcutBadgeProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center bg-bg-inset border border-border-strong rounded-sm px-1 py-[1px] text-[12px] leading-[1.2] text-text-secondary shrink-0',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
