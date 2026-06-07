import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { DialogShell, Button } from '@nostr-for-business/ui'

const meta = {
  title: 'Overlays/DialogShell',
  component: DialogShell,
  tags: ['autodocs'],
} satisfies Meta<typeof DialogShell>

export default meta

export const Default = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>Open dialog</Button>
        {open && (
          <DialogShell
            title="Resolve"
            onClose={() => setOpen(false)}
            footer={
              <>
                <Button variant="muted" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setOpen(false)}>Resolve</Button>
              </>
            }
          >
            <div className="pl-5 pr-4 py-4 flex flex-col gap-2 border-b border-border-subtle">
              <label className="text-input-label text-text-primary">Resolution message (optional)</label>
              <textarea
                placeholder="Summarize the outcome…"
                className="bg-bg-inset border border-border-default focus:border-border-strong rounded-lg px-3 py-2 text-body-2 text-text-primary placeholder:text-text-muted resize-none outline-none h-[100px] leading-[1.4] transition-colors"
              />
            </div>
          </DialogShell>
        )}
      </>
    )
  },
}
