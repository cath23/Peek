import { IconAlertSquareRounded } from '@tabler/icons-react'
import { cn } from './lib/cn'

interface UnreadIndicatorProps {
  /** Urgent unread → a warning-tinted alert badge instead of the plain accent dot. */
  urgent?: boolean
  className?: string
}

/**
 * Unread notification mark: a small accent dot, or (when `urgent`) a warning alert badge.
 * Just the indicator — the caller owns any positioning wrapper (e.g. a 24px slot).
 */
export function UnreadIndicator({ urgent = false, className }: UnreadIndicatorProps) {
  if (urgent) {
    return (
      <div className={cn('flex items-center p-0.5 rounded-full bg-warning-muted', className)}>
        <IconAlertSquareRounded size={12} stroke={2.5} className="text-warning-default" />
      </div>
    )
  }
  return <div className={cn('w-1.5 h-1.5 rounded-full bg-accent-primary', className)} />
}
