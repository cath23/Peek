import { type ReactNode, type HTMLAttributes } from 'react'
import { cn } from './lib/cn'

/** Menu surface — the elevated, bordered popover container. Width is supplied by the
 *  caller via className. Spreads remaining props (e.g. data-* attributes, refs). */
export function Menu({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-bg-elevated border border-border-default rounded-lg shadow-lg p-2 flex flex-col gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface MenuItemProps {
  icon?: ReactNode
  label: string
  shortcut?: string
  destructive?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

/** A single clickable row: optional leading icon, label, optional keyboard shortcut. */
export function MenuItem({
  icon,
  label,
  shortcut,
  destructive,
  disabled,
  onClick,
  className,
}: MenuItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-lg w-full',
        disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-bg-hover',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span
        className={cn(
          'flex-1 text-sm truncate',
          destructive ? 'text-error-default' : 'text-text-secondary'
        )}
      >
        {label}
      </span>
      {shortcut && (
        <kbd className="inline-flex items-center justify-center bg-bg-inset border border-border-strong rounded-sm px-1 py-[1px] text-caption text-text-secondary shrink-0">
          {shortcut}
        </kbd>
      )}
    </div>
  )
}

/** A labelled group within a menu. Renders an optional header above its children. */
export function MenuSection({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {title && (
        <div className="flex h-[32px] items-center px-2">
          <span className="text-h5 text-text-primary">{title}</span>
        </div>
      )}
      {children}
    </div>
  )
}
