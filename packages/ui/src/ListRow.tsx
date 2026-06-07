import { useState, type ReactNode } from 'react'
import { cn } from './lib/cn'

interface ListRowProps {
  /** Leading slot (avatar, status icon, checkbox…). */
  leading?: ReactNode
  title: ReactNode
  /** Optional second line below the title. */
  subtitle?: ReactNode
  /** Trailing slot. Pass a function to receive the row's hover state (reveal actions on hover). */
  trailing?: ReactNode | ((hovered: boolean) => ReactNode)
  selected?: boolean
  onClick?: () => void
  /** Extra classes for the title span (e.g. weight/colour driven by app state). */
  titleClassName?: string
  className?: string
}

/**
 * Generic selectable list row: leading slot + title (+ optional subtitle) + trailing slot,
 * with hover/selected background states. Owns hover state and forwards it to a `trailing`
 * render-prop so callers can reveal actions on hover. Domain content (which icon, which
 * label, which actions) is supplied by the consumer — see Peek's PersonRow.
 */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  selected = false,
  onClick,
  titleClassName,
  className,
}: ListRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 h-8 rounded-lg cursor-pointer transition-colors',
        selected ? 'bg-bg-selected' : hovered ? 'bg-bg-hover' : '',
        className,
      )}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {leading}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className={cn('text-sm truncate', titleClassName)}>{title}</span>
        {subtitle && <span className="text-caption text-text-secondary truncate">{subtitle}</span>}
      </div>
      {typeof trailing === 'function' ? trailing(hovered) : trailing}
    </div>
  )
}
