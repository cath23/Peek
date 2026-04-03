import { useRef, useEffect } from 'react'
import { IconX } from '@tabler/icons-react'
import { Avatar } from './ui/Avatar'
import { IconButton } from './ui/IconButton'
import { ThreadReplyCard } from './ThreadReplyCard'
import { ComposeBox, type SendPayload } from './ui/ComposeBox'
import { DateDivider } from './ui/DateDivider'
import type { ConversationData } from '@/data/topicData'
import type { ReplyData } from '@/data/replyData'

// ── Pinned Initial Message (compact) ──

interface PinnedMessageProps {
  authorName: string
  authorAvatarSrc?: string
  timestamp: string
  body: string
}

function PinnedMessage({ authorName, authorAvatarSrc, timestamp, body }: PinnedMessageProps) {
  // Strip newlines and show single-line truncated text
  const flatBody = body.replace(/\n/g, ' ')

  return (
    <div className="bg-bg-elevated border border-border-default rounded-lg overflow-hidden">
      <div className="flex flex-col p-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Avatar size={24} src={authorAvatarSrc} alt={authorName} />
          <span className="text-body-2-strong text-text-primary whitespace-nowrap">{authorName}</span>
          <span className="text-caption text-text-muted whitespace-nowrap">{timestamp}</span>
        </div>
        {/* Truncated body */}
        <div className="pl-8 pr-2 pt-1 pb-2">
          <p className="text-caption text-text-secondary truncate leading-[1.2]">
            {flatBody}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Thread Panel ──

interface ThreadPanelProps {
  conversation: ConversationData
  replies: ReplyData[]
  sentReplies: ReplyData[]
  isResolved?: boolean
  onClose: () => void
  onSendReply: (payload: SendPayload) => void
  onDeleteReply?: (id: string) => void
}

export function ThreadPanel({
  conversation,
  replies,
  sentReplies,
  isResolved = false,
  onClose,
  onSendReply,
  onDeleteReply,
}: ThreadPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const allReplies = [...replies, ...sentReplies]

  // Scroll to bottom when new replies are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [allReplies.length])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 shrink-0 flex items-center justify-between pl-5 pr-4 py-2 border-b border-border-subtle">
        <span className="text-body-2-strong text-text-primary">Replies</span>
        <div className="flex items-center gap-2">
          {isResolved && (
            <span className="text-caption text-success-default">Resolved</span>
          )}
          <IconButton tooltip="Close" aria-label="Close thread" onClick={onClose}>
            <IconX size={16} stroke={1.5} />
          </IconButton>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col">
        {/* Pinned initial message */}
        <div className="px-4 pt-4 pb-2">
          <PinnedMessage
            authorName={conversation.authorName}
            timestamp={conversation.timestamp}
            body={conversation.body}
          />
        </div>

        {/* Replies divider */}
        <DateDivider label="Replies" className="px-4 py-2" />

        {/* Reply list — chronological top to bottom */}
        <div className="flex flex-col px-4 pb-4 gap-2">
          {allReplies.map((reply) => (
            <ThreadReplyCard
              key={reply.id}
              authorName={reply.authorName}
              timestamp={reply.timestamp}
              body={reply.body}
              onDelete={onDeleteReply ? () => onDeleteReply(reply.id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Compose box */}
      <div className="p-3">
        <ComposeBox onSend={onSendReply} placeholder="reply" />
      </div>
    </div>
  )
}
