import { type ReactNode } from 'react'
import { cn } from './lib/cn'

interface NavItemProps {
  icon: ReactNode
  label: string
  /** Active (selected) state — drives the highlighted icon box + label colour. */
  active?: boolean
  onClick?: () => void
  className?: string
}

/**
 * A vertical nav-rail item: an icon in a rounded box with a tiny label beneath. Presentational
 * (renders a button) — apps that route should wrap it (e.g. compute `active` from the router and
 * navigate in `onClick`), see Peek's NavItem.
 */
export function NavItem({ icon, label, active = false, onClick, className }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('group flex flex-col gap-0.5 items-center px-2 py-0.5 w-full cursor-pointer', className)}
    >
      <div
        className={cn(
          'flex items-center justify-center p-2 rounded-lg transition-colors',
          active ? 'bg-bg-selected' : 'group-hover:bg-bg-hover',
        )}
      >
        <span className={cn('flex items-center transition-colors', active ? 'text-text-primary' : 'text-text-secondary')}>
          {icon}
        </span>
      </div>
      <span className={cn('text-[9px] font-medium text-center leading-[115%]', active ? 'text-text-primary' : 'text-text-secondary')}>
        {label}
      </span>
    </button>
  )
}

/** Fixed-width vertical nav rail; holds NavItems (or any slot content). */
export function NavRail({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <nav className={cn('w-16 flex flex-col gap-2 items-start px-2 py-3 shrink-0', className)}>
      {children}
    </nav>
  )
}
