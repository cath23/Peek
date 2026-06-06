import { useState } from 'react'
import { Button, DialogShell } from '@nostr-for-business/ui'

interface ResolveDialogProps {
  onResolve: (message: string) => void
  onCancel: () => void
}

export function ResolveDialog({ onResolve, onCancel }: ResolveDialogProps) {
  const [message, setMessage] = useState('')

  return (
    <DialogShell
      title="Resolve"
      onClose={onCancel}
      footer={
        <>
          <Button variant="muted" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={() => onResolve(message)}>Resolve</Button>
        </>
      }
    >
      <div className="pl-5 pr-4 py-4 flex flex-col gap-2 border-b border-border-subtle">
        <label className="text-input-label text-text-primary">
          Resolution message (optional)
        </label>
        <textarea
          autoFocus
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Summarize the outcome or decision..."
          className="bg-bg-inset border border-border-default focus:border-border-strong rounded-lg px-3 py-2 text-body-2 text-text-primary placeholder:text-text-muted resize-none outline-none h-[109px] leading-[1.4] transition-colors"
        />
      </div>
    </DialogShell>
  )
}
