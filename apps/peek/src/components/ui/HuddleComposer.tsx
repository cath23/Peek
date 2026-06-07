import { useEffect, useRef, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { ShortcutBadge, useDismiss } from '@nostr-for-business/ui'
import { Avatar } from './Avatar'
import { ComposeBox, type SendPayload } from './ComposeBox'
import { PEOPLE, type Person } from '@/data/peopleData'

interface HuddleComposerProps {
  /** Called with the first message + the chosen recipient names when the huddle is created. */
  onSend: (payload: SendPayload, recipients: string[]) => void
  /** Cancel creation (outside click, Escape, or the Cancel button). */
  onCancel: () => void
  /** Suggestion source. Defaults to PEOPLE. */
  people?: Person[]
}

/**
 * V3 huddle-creation variant of the composer: a "To:" recipient picker (chips + autocomplete)
 * with an attached ComposeBox for the first message. Owns its own recipient state; the parent
 * supplies onSend (gets the message + recipients) and onCancel. Extracted from useTopicView.
 */
export function HuddleComposer({ onSend, onCancel, people = PEOPLE }: HuddleComposerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [recipients, setRecipients] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)

  // Cancel on outside-click / Escape (V2 uses a portalled dialog and never renders this).
  useDismiss({ onDismiss: onCancel, ignore: [rootRef], escape: true })

  // Backup refocus: keep the cursor in the To: input as the recipient list changes.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [recipients.length])

  const addRecipient = (name: string) => {
    if (!recipients.includes(name)) setRecipients((prev) => [...prev, name])
    setQuery('')
    setSuggestionIndex(0)
    setTimeout(() => inputRef.current?.focus(), 0)
  }
  const removeRecipient = (name: string) => setRecipients((prev) => prev.filter((n) => n !== name))

  const toSuggestions = people.filter(
    (p) => !recipients.includes(p.name) && p.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div ref={rootRef} className="shrink-0 px-3 pb-3 flex flex-col gap-0">
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 bg-bg-elevated border border-border-default rounded-t-lg">
          <span className="text-caption text-text-muted shrink-0">To:</span>
          <div className="flex-1 flex items-center gap-1 flex-wrap min-h-[24px]">
            {recipients.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent-muted text-text-primary text-sm rounded-sm"
              >
                {name}
                <button
                  onClick={() => removeRecipient(name)}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <IconX size={12} stroke={1.5} />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSuggestionIndex(0)
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => {
                if (document.activeElement !== inputRef.current) setFocused(false)
              }, 150)}
              onKeyDown={(e) => {
                if (toSuggestions.length === 0) return
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSuggestionIndex((i) => (i + 1) % toSuggestions.length)
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSuggestionIndex((i) => (i - 1 + toSuggestions.length) % toSuggestions.length)
                } else if (e.key === 'Enter') {
                  const pick = toSuggestions[suggestionIndex]
                  if (pick) {
                    e.preventDefault()
                    addRecipient(pick.name)
                  }
                }
              }}
              placeholder={recipients.length === 0 ? 'Add people...' : 'Add more...'}
              autoFocus
              className="flex-1 min-w-[80px] bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
          </div>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-caption text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            Cancel
            <ShortcutBadge>ESC</ShortcutBadge>
          </button>
        </div>
        {focused && toSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 bottom-full mb-1 bg-bg-elevated border border-border-default rounded-lg shadow-md py-1 max-h-[200px] overflow-y-auto z-50">
            {toSuggestions.map((person, i) => {
              const isActive = i === suggestionIndex
              return (
                <button
                  key={person.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setSuggestionIndex(i)}
                  onClick={() => addRecipient(person.name)}
                  className={
                    'w-full flex items-center gap-2 px-3 py-1.5 transition-colors cursor-pointer ' +
                    (isActive ? 'bg-bg-hover' : 'hover:bg-bg-hover')
                  }
                >
                  <Avatar size={24} name={person.name} alt={person.name} />
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-text-primary">{person.name}</span>
                    <span className="text-caption text-text-muted">{person.role}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      {recipients.length === 0 ? (
        <div className="border border-t-0 border-border-default rounded-b-lg overflow-hidden">
          <div className="bg-bg-inset border border-border-default rounded-lg p-3 flex flex-col gap-4">
            <div className="min-h-[20px] flex items-center text-caption text-text-muted">
              Add at least one person to start a Huddle
            </div>
            <div className="h-6" />
          </div>
        </div>
      ) : (
        <div className="border border-t-0 border-border-default rounded-b-lg overflow-hidden">
          <ComposeBox onSend={(payload) => onSend(payload, recipients)} placeholder="default" />
        </div>
      )}
    </div>
  )
}
