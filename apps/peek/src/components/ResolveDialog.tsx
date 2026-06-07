import { useState } from 'react'
import { Button, DialogShell, InputLabel, TextArea } from '@nostr-for-business/ui'

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
        <InputLabel>Resolution message (optional)</InputLabel>
        <TextArea
          autoFocus
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Summarize the outcome or decision..."
          className="h-[109px]"
        />
      </div>
    </DialogShell>
  )
}
