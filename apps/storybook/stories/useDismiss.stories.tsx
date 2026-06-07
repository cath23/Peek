import { useRef, useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { useDismiss, Menu, MenuItem } from '@nostr-for-business/ui'

const meta = {
  title: 'Hooks/useDismiss',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

/** Open the menu, then click anywhere outside it (or press Escape) to dismiss. */
export const Default = {
  render: () => {
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const btnRef = useRef<HTMLButtonElement>(null)

    useDismiss({
      enabled: open,
      onDismiss: () => setOpen(false),
      ignore: [menuRef, btnRef],
      escape: true,
    })

    return (
      <div className="relative inline-block">
        <button
          ref={btnRef}
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-2 rounded-lg bg-bg-inset border border-border-default text-body-2 text-text-primary"
        >
          {open ? 'Menu open — click outside or press Esc' : 'Open menu'}
        </button>
        {open && (
          <div ref={menuRef} className="absolute top-full mt-1 left-0 z-50">
            <Menu className="w-[200px]">
              <MenuItem label="First action" onClick={() => setOpen(false)} />
              <MenuItem label="Second action" onClick={() => setOpen(false)} />
              <MenuItem label="Third action" onClick={() => setOpen(false)} />
            </Menu>
          </div>
        )}
      </div>
    )
  },
}
