import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from '@tabler/icons-react'
import { IconButton } from './IconButton'

interface DialogShellProps {
  title: string
  onClose: () => void
  /** Dialog body. The caller styles its own inner padding/sections. */
  children: ReactNode
  /** Footer content (typically the action buttons). Omit for a footer-less dialog. */
  footer?: ReactNode
  /** Card width in px. Defaults to 502. */
  width?: number
  className?: string
}

/**
 * Modal dialog skeleton: portal + backdrop + centered card with a titled header
 * (with close button) and an optional footer. The body and footer are slots.
 */
export function DialogShell({ title, onClose, children, footer, width = 502, className }: DialogShellProps) {
  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          style={{ width }}
          className={
            'bg-bg-elevated border border-border-subtle rounded-lg shadow-lg pointer-events-auto flex flex-col overflow-hidden' +
            (className ? ' ' + className : '')
          }
        >
          {/* Header */}
          <div className="h-12 flex items-center justify-between pl-5 pr-4 border-b border-border-subtle shrink-0">
            <span className="text-h4 text-text-primary">{title}</span>
            <IconButton tooltip="Close" aria-label="Close" onClick={onClose}>
              <IconX size={16} stroke={1.5} />
            </IconButton>
          </div>

          {/* Body */}
          {children}

          {/* Footer */}
          {footer && (
            <div className="h-12 flex items-center justify-end gap-2 pl-5 pr-4 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
