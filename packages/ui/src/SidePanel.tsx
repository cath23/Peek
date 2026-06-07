import { forwardRef, type ReactNode } from 'react'
import { cn } from './lib/cn'

/** Full-height side panel column: header + scrollable body + footer (all slots). */
export function SidePanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col h-full', className)}>{children}</div>
}

/** Fixed-height panel header bar (title left, actions right). */
export function SidePanelHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'h-12 shrink-0 flex items-center justify-between pl-5 pr-4 py-2 border-b border-border-subtle z-20 relative bg-bg-surface',
        className
      )}
    >
      {children}
    </div>
  )
}

/** Scrollable panel body. Forwards a ref so callers can control scroll position. */
export const SidePanelBody = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  function SidePanelBody({ children, className }, ref) {
    return (
      <div ref={ref} className={cn('flex-1 overflow-y-auto flex flex-col', className)}>
        {children}
      </div>
    )
  }
)

/** Panel footer region (e.g. a composer). */
export function SidePanelFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-3', className)}>{children}</div>
}
