import { useState } from 'react'
import { createPortal } from 'react-dom'
import { IconX, IconLock, IconEye, IconSearch } from '@tabler/icons-react'
import { IconButton } from './ui/IconButton'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'

interface CreateTopicDialogProps {
  defaultTitle?: string
  defaultDescription?: string
  defaultPrivacy?: 'private' | 'public'
  /** Label for the confirm button. Defaults to "Create topic". Use "Publish" for make-public flow. */
  confirmLabel?: string
  onConfirm: (data: { title: string; description: string; privacy: 'private' | 'public' }) => void
  onCancel: () => void
}

export function CreateTopicDialog({
  defaultTitle = '',
  defaultDescription = '',
  defaultPrivacy = 'private',
  confirmLabel = 'Create topic',
  onConfirm,
  onCancel,
}: CreateTopicDialogProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [description, setDescription] = useState(defaultDescription)
  const [privacy, setPrivacy] = useState<'private' | 'public'>(defaultPrivacy)

  const canConfirm = title.trim().length > 0

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onCancel} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="w-[502px] bg-bg-elevated border border-border-subtle rounded-lg shadow-lg pointer-events-auto flex flex-col overflow-hidden">

          {/* Header */}
          <div className="h-12 flex items-center justify-between pl-5 pr-4 border-b border-border-subtle shrink-0">
            <span className="text-h4 text-text-primary">Create topic</span>
            <IconButton aria-label="Close" onClick={onCancel}>
              <IconX size={16} stroke={1.5} />
            </IconButton>
          </div>

          {/* Content */}
          <div className="pl-5 pr-4 py-4 flex flex-col gap-6 border-b border-border-subtle overflow-y-auto">

            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-input-label text-text-primary flex items-center">
                Title
                <span className="text-error-default ml-0.5">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's this topic about?"
                className="bg-bg-inset border border-border-default focus:border-border-strong rounded-lg px-3 py-2 text-body-2 text-text-primary placeholder:text-text-muted outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-input-label text-text-primary">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context..."
                className="bg-bg-inset border border-border-default focus:border-border-strong rounded-lg px-3 py-2 text-body-2 text-text-primary placeholder:text-text-muted resize-none outline-none h-[88px] leading-[1.4] transition-colors"
              />
            </div>

            {/* Privacy */}
            <div className="flex flex-col gap-2">
              <label className="text-input-label text-text-primary">Privacy</label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={cn(
                    'flex flex-col gap-1 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer',
                    privacy === 'private'
                      ? 'bg-bg-selected border-accent-primary'
                      : 'bg-transparent border-border-default hover:bg-bg-hover'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <IconLock size={16} stroke={1.5} className="text-text-secondary shrink-0" />
                    <span className="text-body-2 text-text-primary">Private</span>
                  </div>
                  <span className="text-caption text-text-secondary pl-6">
                    Only you and invited members can see
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={cn(
                    'flex flex-col gap-1 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer',
                    privacy === 'public'
                      ? 'bg-bg-selected border-accent-primary'
                      : 'bg-transparent border-border-default hover:bg-bg-hover'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <IconEye size={16} stroke={1.5} className="text-text-secondary shrink-0" />
                    <span className="text-body-2 text-text-primary">Public</span>
                  </div>
                  <span className="text-caption text-text-secondary pl-6">
                    Anyone in the organization can see
                  </span>
                </button>
              </div>
            </div>

            {/* Invite people or teams */}
            <div className="flex flex-col gap-2">
              <label className="text-input-label text-text-primary">
                Invite people or teams
              </label>
              <div className="relative">
                <IconSearch
                  size={16}
                  stroke={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search people or teams..."
                  className="w-full bg-bg-inset border border-border-default focus:border-border-strong rounded-lg pl-9 pr-3 py-2 text-body-2 text-text-primary placeholder:text-text-muted outline-none transition-colors"
                />
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="h-12 flex items-center justify-end gap-2 pl-5 pr-4 shrink-0">
            <Button variant="muted" onClick={onCancel}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!canConfirm}
              onClick={() => canConfirm && onConfirm({ title, description, privacy })}
            >
              {confirmLabel}
            </Button>
          </div>

        </div>
      </div>
    </>,
    document.body
  )
}
