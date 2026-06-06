import { useState } from 'react'
import { Button, DialogShell } from '@nostr-for-business/ui'
import { PersonChipInput } from './ui/PersonChipInput'
import type { Person } from '@/data/peopleData'

export interface StartHuddleResult {
  invitees: Person[]
}

interface StartHuddleDialogProps {
  onConfirm: (data: StartHuddleResult) => void
  onCancel: () => void
}

/**
 * V2 huddle creation entry point. Members-only — no title, no first message.
 * The new huddle is empty at creation; the user lands inside it and writes
 * their first message via the huddle's compose box.
 */
export function StartHuddleDialog({ onConfirm, onCancel }: StartHuddleDialogProps) {
  const [invitees, setInvitees] = useState<Person[]>([])

  const canConfirm = invitees.length > 0

  return (
    <DialogShell
      title="Start huddle"
      onClose={onCancel}
      footer={
        <>
          <Button variant="muted" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm({ invitees })}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="pl-5 pr-4 py-4 flex flex-col gap-6 border-b border-border-subtle overflow-y-auto">
        <div className="flex flex-col gap-2">
          <label className="text-input-label text-text-primary flex items-center">
            Invite people
            <span className="text-error-default ml-0.5">*</span>
          </label>
          <PersonChipInput
            value={invitees}
            onChange={setInvitees}
            placeholder="Search people..."
          />
        </div>
      </div>
    </DialogShell>
  )
}
