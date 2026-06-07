import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Meta } from '@storybook/react-vite'
import { usePopover, useDismiss, Menu, MenuItem } from '@nostr-for-business/ui'

const meta = {
  title: 'Hooks/usePopover',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

/**
 * Positions a fixed, right-aligned popover below an anchor (flips above when there's
 * `flipHeight` px or less of room below). Paired with useDismiss for click-outside/Escape.
 */
export const Default = {
  render: () => {
    const [open, setOpen] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const style = usePopover(btnRef, open, { gap: 6, flipHeight: 220 })

    useDismiss({ enabled: open, onDismiss: () => setOpen(false), ignore: [menuRef, btnRef], escape: true })

    return (
      <div className="flex items-start justify-end" style={{ minHeight: 120 }}>
        <button
          ref={btnRef}
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-2 rounded-lg bg-bg-inset border border-border-default text-body-2 text-text-primary"
        >
          {open ? 'Open — click outside / Esc' : 'Open popover'}
        </button>
        {open && style && createPortal(
          <div ref={menuRef} style={style}>
            <Menu className="w-[200px]">
              <MenuItem label="Light" onClick={() => setOpen(false)} />
              <MenuItem label="Dark" onClick={() => setOpen(false)} />
              <MenuItem label="System" onClick={() => setOpen(false)} />
            </Menu>
          </div>,
          document.body,
        )}
      </div>
    )
  },
}
