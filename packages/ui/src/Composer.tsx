import { forwardRef, type ReactNode } from 'react'
import { IconArrowUp } from '@tabler/icons-react'
import { cn } from './lib/cn'

interface ComposerProps {
  /** The editable area (a rich editor, textarea, etc.). */
  children: ReactNode
  /** Left-aligned toolbar controls (attach, etc.). */
  tools?: ReactNode
  onSend?: () => void
  /** Enables the send button. */
  canSend?: boolean
  /** Absolutely-positioned content rendered above the box (e.g. command menus). */
  popover?: ReactNode
  className?: string
}

/**
 * Composer frame: bordered input container with a toolbar row (tools on the left, a send
 * button on the right) and an optional popover layer. The editable surface is a slot, so
 * the editor implementation (Tiptap, textarea, …) lives in the consuming app.
 */
export const Composer = forwardRef<HTMLDivElement, ComposerProps>(function Composer(
  { children, tools, onSend, canSend = false, popover, className },
  ref
) {
  return (
    <div ref={ref} className={cn('relative', className)}>
      {popover}
      <div className="relative bg-bg-inset border border-border-default focus-within:border-border-strong rounded-lg p-3 flex flex-col gap-4 transition-colors">
        {children}

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">{tools}</div>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              onSend?.()
            }}
            disabled={!canSend}
            aria-label="Send"
            className={cn(
              'flex items-center justify-center p-1 rounded-lg transition-colors',
              canSend
                ? 'bg-accent-primary hover:bg-accent-hover text-text-inverse cursor-pointer'
                : 'bg-bg-disabled text-text-disabled pointer-events-none'
            )}
          >
            <IconArrowUp size={16} stroke={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
})
