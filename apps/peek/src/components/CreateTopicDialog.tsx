import { useState } from 'react'
import { IconLock } from '@tabler/icons-react'
import { Button, DialogShell, InputLabel, TextInput } from '@nostr-for-business/ui'
import { PersonChipInput } from './ui/PersonChipInput'
import type { Person } from '@/data/peopleData'

export interface StartTopicResult {
  title: string
  invitees: Person[]
}

interface CreateTopicDialogProps {
  defaultTitle?: string
  defaultInvitees?: Person[]
  /** When set, the dialog renders the DM-to-huddle privacy banner. */
  dmContext?: { participants: Person[] }
  /** Label for the confirm button. Defaults to "Start topic". */
  confirmLabel?: string
  onConfirm: (data: StartTopicResult) => void
  onCancel: () => void
}

export function CreateTopicDialog({
  defaultTitle = '',
  defaultInvitees = [],
  dmContext,
  confirmLabel = 'Start topic',
  onConfirm,
  onCancel,
}: CreateTopicDialogProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [invitees, setInvitees] = useState<Person[]>(defaultInvitees)

  const canConfirm = title.trim().length > 0

  return (
    <DialogShell
      title="Start topic"
      onClose={onCancel}
      footer={
        <>
          <Button variant="muted" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm({ title, invitees })}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="pl-5 pr-4 py-4 flex flex-col gap-6 border-b border-border-subtle overflow-y-auto">

        {/* Title */}
        <div className="flex flex-col gap-2">
          <InputLabel required>Title</InputLabel>
          <TextInput
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's this topic about?"
          />
        </div>

        {/* Invite people */}
        <div className="flex flex-col gap-2">
          <InputLabel>Invite people</InputLabel>
          <PersonChipInput
            value={invitees}
            onChange={setInvitees}
            placeholder="Search people..."
          />
        </div>

        {/* DM-to-huddle privacy banner */}
        {dmContext && (
          <div className="flex items-start gap-2 border border-warning-default rounded-lg px-3 py-2.5">
            <IconLock size={16} stroke={1.5} className="text-text-primary shrink-0 mt-0.5" />
            <p className="text-body-2 text-text-primary leading-[1.4]">
              This DM becomes a private huddle inside the new topic. Only you and the other DM participants can see it — the topic itself is public.
            </p>
          </div>
        )}

      </div>
    </DialogShell>
  )
}
