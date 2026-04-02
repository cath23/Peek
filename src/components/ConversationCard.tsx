import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  IconMessage2,
  IconAlertSquareRounded,
  IconChecks,
  IconArrowNarrowRight,
} from '@tabler/icons-react'
import { Avatar } from './ui/Avatar'
import { Chip } from './ui/Chip'
import { Reaction as ReactionPill } from './ui/Reaction'
import { TopicState } from './ui/TopicState'
import { ConversationQuickMenu } from './ConversationQuickMenu'
import { ConversationMoreMenu } from './ConversationMoreMenu'
import { ResolveDialog } from './ResolveDialog'
import { CreateTopicDialog } from './CreateTopicDialog'
import { cn } from '@/lib/utils'

interface ReactionData {
  emoji: string
  count: number
  owner: 'yours' | 'others'
}

interface ConversationCardProps {
  authorName: string
  authorAvatarSrc?: string
  timestamp: string
  body: string
  reactions?: ReactionData[]
  replyCount?: number
  hasNewReply?: boolean
  hasNewMessage?: boolean
  isUrgent?: boolean
  // Resolved state
  isResolved?: boolean
  resolvedBy?: string
  resolutionMessage?: string
  // Topic state
  isTopic?: boolean
  topicTitle?: string
  isPrivate?: boolean
  showCreateTopic?: boolean
  onResolvedChange?: (resolved: boolean) => void
  onReply?: () => void
  onMore?: () => void
  className?: string
}

export function ConversationCard({
  authorName,
  authorAvatarSrc,
  timestamp,
  body,
  reactions,
  replyCount,
  hasNewReply = false,
  hasNewMessage = false,
  isUrgent = false,
  isResolved: initialResolved = false,
  resolvedBy: initialResolvedBy = '',
  resolutionMessage: initialResolutionMessage = '',
  isTopic: initialIsTopic = false,
  topicTitle: initialTopicTitle = '',
  isPrivate: initialIsPrivate = false,
  showCreateTopic = true,
  onResolvedChange,
  onReply,
  onMore,
  className,
}: ConversationCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [moreMenuPos, setMoreMenuPos] = useState<{ top: number; right: number } | null>(null)

  // Resolved state
  const [resolved, setResolved] = useState(initialResolved)
  const [resolvedBy, setResolvedBy] = useState(initialResolvedBy)
  const [resolutionMsg, setResolutionMsg] = useState(initialResolutionMessage)
  const [showResolveDialog, setShowResolveDialog] = useState(false)

  // Topic state
  const [isTopic, setIsTopic] = useState(initialIsTopic)
  const [topicTitle, setTopicTitle] = useState(initialTopicTitle)
  const [topicPrivate, setTopicPrivate] = useState(initialIsPrivate)
  const [showTopicDialog, setShowTopicDialog] = useState(false)
  const [topicDialogPrivacy, setTopicDialogPrivacy] = useState<'private' | 'public'>('private')

  const handleMore = (rect: DOMRect) => {
    setMoreMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setShowMoreMenu((v) => !v)
    onMore?.()
  }

  const handleResolveConfirm = (message: string) => {
    setResolved(true)
    setResolvedBy('You')
    setResolutionMsg(message)
    setShowResolveDialog(false)
    onResolvedChange?.(true)
  }

  const handleReopen = () => {
    setResolved(false)
    setResolvedBy('')
    setResolutionMsg('')
    setShowMoreMenu(false)
    onResolvedChange?.(false)
  }

  const openCreateTopic = () => {
    setTopicDialogPrivacy('private')
    setShowMoreMenu(false)
    setShowTopicDialog(true)
  }

  const openMakePublic = () => {
    setTopicDialogPrivacy('public')
    setShowMoreMenu(false)
    setShowTopicDialog(true)
  }

  const handleTopicConfirm = (data: { title: string; description: string; privacy: 'private' | 'public' }) => {
    setIsTopic(true)
    setTopicTitle(data.title)
    setTopicPrivate(data.privacy === 'private')
    setShowTopicDialog(false)
  }

  const handleRevertToConversation = () => {
    setIsTopic(false)
    setTopicTitle('')
    setTopicPrivate(false)
    setShowMoreMenu(false)
  }

  return (
    <>
      <div
        className={cn(
          'relative rounded-lg transition-colors',
          isHovered
            ? 'bg-bg-hover border border-border-default'
            : 'bg-bg-surface border border-border-subtle',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowMoreMenu(false); setMoreMenuPos(null) }}
      >
        {/* ── Topic header (topic type only) ── */}
        {isTopic && (
          <div className="flex items-start gap-2 px-2 py-3 pb-2">
            {/* Left: 24px column — icon + connector. px-1 puts icon left-edge at x=8, same as avatar. */}
            <div className="flex flex-col items-center gap-1 w-6 shrink-0">
              <TopicState
                type="topic"
                status={resolved ? 'resolved' : 'unresolved'}
                isPrivate={topicPrivate}
              />
              {/* Connector: flex-1 fills column, min-h-[24px] ensures it's always visible */}
              <div className="w-px bg-border-default flex-1 min-h-[24px]" />
            </div>
            {/* Right: title in an explicit h-4 row so it aligns center-to-center with the 16px icon */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="h-4 flex items-center">
                <span className="text-h5 text-text-primary">{topicTitle}</span>
              </div>
              {resolved && (
                <div className="flex items-center gap-2 mt-1 py-1">
                  <IconChecks size={16} stroke={1.5} className="text-success-default shrink-0" />
                  <span className="text-menu text-success-default whitespace-nowrap">
                    {resolvedBy || 'Someone'} resolved
                  </span>
                  {resolutionMsg && (
                    <>
                      <IconArrowNarrowRight size={12} stroke={1.5} className="text-text-primary shrink-0" />
                      <span className="text-menu text-text-primary truncate">{resolutionMsg}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Resolution banner (conversation type only) ── */}
        {!isTopic && resolved && (
          <div className="flex items-center gap-2 px-3 py-2 pb-1">
            <IconChecks size={16} stroke={1.5} className="text-success-default shrink-0" />
            <span className="text-menu text-success-default whitespace-nowrap">
              {resolvedBy || 'Someone'} resolved
            </span>
            {resolutionMsg && (
              <>
                <IconArrowNarrowRight size={12} stroke={1.5} className="text-text-primary shrink-0" />
                <span className="text-menu text-text-primary truncate">{resolutionMsg}</span>
              </>
            )}
          </div>
        )}

        {/* ── Message box ── */}
        <div className={cn('flex flex-col items-start p-2', isTopic && 'pt-0')}>
          {/* Header */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2 shrink-0">
              <Avatar size={24} src={authorAvatarSrc} alt={authorName} />
              <span className="text-body-2-strong text-text-primary whitespace-nowrap">
                {authorName}
              </span>
              <span className="text-caption text-text-muted whitespace-nowrap">
                {timestamp}
              </span>
            </div>

            {hasNewMessage && !isUrgent && (
              <Chip type="brand" label="1 new" />
            )}
            {isUrgent && (
              <Chip
                type="warning"
                label="1 new"
                leadingIcon={<IconAlertSquareRounded size={12} stroke={1.5} />}
              />
            )}
          </div>

          {/* Body */}
          <div className="pl-8 pr-2 pt-1 pb-2 w-full">
            <p className="text-sm text-text-secondary leading-[1.4]">{body}</p>
          </div>

          {/* Reactions */}
          {reactions && reactions.length > 0 && (
            <div className="flex items-center gap-2 pl-8 pt-1 pb-2 w-full">
              {reactions.map((r, i) => (
                <ReactionPill key={i} emoji={r.emoji} count={r.count} owner={r.owner} />
              ))}
            </div>
          )}

          {/* Replies */}
          {replyCount != null && replyCount > 0 && (
            <div className="flex items-center gap-2 pl-8 pr-2 py-1.5 w-full">
              <IconMessage2 size={16} stroke={1.5} className="text-text-muted shrink-0" />
              <span className="text-chip text-text-muted">
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </span>
              {hasNewReply && !isUrgent && (
                <>
                  <div className="w-0.5 h-0.5 rounded-full bg-text-muted shrink-0" />
                  <Chip type="brand" label="1 new" />
                </>
              )}
              {hasNewReply && isUrgent && (
                <>
                  <div className="w-0.5 h-0.5 rounded-full bg-text-muted shrink-0" />
                  <Chip
                    type="warning"
                    label="1 new"
                    leadingIcon={<IconAlertSquareRounded size={12} stroke={1.5} />}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Quick menu on hover ── */}
        {isHovered && (
          <div className="absolute right-[3px] top-[3px]">
            <ConversationQuickMenu
              isResolved={resolved}
              onReply={onReply}
              onResolve={() => setShowResolveDialog(true)}
              onReopen={handleReopen}
              onMore={handleMore}
            />
          </div>
        )}

        {/* ── More menu (portalled) ── */}
        {showMoreMenu && moreMenuPos &&
          createPortal(
            <div
              style={{
                position: 'fixed',
                top: moreMenuPos.top,
                right: moreMenuPos.right,
                zIndex: 50,
              }}
            >
              <ConversationMoreMenu
                isTopic={isTopic}
                isPrivate={topicPrivate}
                isResolved={resolved}
                showCreateTopic={showCreateTopic}
                onCreateTopic={openCreateTopic}
                onRevertToConversation={handleRevertToConversation}
                onMakePublic={openMakePublic}
                onResolve={() => { setShowMoreMenu(false); setShowResolveDialog(true) }}
                onReopen={handleReopen}
              />
            </div>,
            document.body
          )}
      </div>

      {/* ── Resolve dialog (portalled) ── */}
      {showResolveDialog && (
        <ResolveDialog
          onResolve={handleResolveConfirm}
          onCancel={() => setShowResolveDialog(false)}
        />
      )}

      {/* ── Create / update topic dialog (portalled) ── */}
      {showTopicDialog && (
        <CreateTopicDialog
          defaultTitle={isTopic ? topicTitle : ''}
          defaultPrivacy={topicDialogPrivacy}
          confirmLabel={isTopic && topicDialogPrivacy === 'public' ? 'Publish' : 'Create topic'}
          onConfirm={handleTopicConfirm}
          onCancel={() => setShowTopicDialog(false)}
        />
      )}
    </>
  )
}
