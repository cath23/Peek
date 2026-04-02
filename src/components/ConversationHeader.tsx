import { IconStar, IconDotsVertical, IconTimeline } from '@tabler/icons-react'
import { TopicState } from './ui/TopicState'
import { Avatar } from './ui/Avatar'
import { IconButton } from './ui/IconButton'
import { cn } from '@/lib/utils'

interface ConversationHeaderProps {
  avatarSrc?: string
  name?: string
  /** When true, shows topic-mode layout: TopicState icon, status counts, members, timeline button */
  topicMode?: boolean
  isResolved?: boolean
  isPrivate?: boolean
  openCount?: number
  resolvedCount?: number
  className?: string
}

/** 3 overlapping 24px avatars with border-bg-surface outline — matches Figma members component */
function AvatarGroup() {
  return (
    <div className="flex items-center pr-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="-mr-2 relative shrink-0 size-6 rounded-sm overflow-hidden border-2 border-bg-surface"
        >
          <Avatar size={24} />
        </div>
      ))}
    </div>
  )
}

export function ConversationHeader({
  avatarSrc,
  name,
  topicMode = false,
  isResolved = false,
  isPrivate = false,
  openCount = 0,
  resolvedCount = 0,
  className,
}: ConversationHeaderProps) {
  return (
    <div
      className={cn(
        'h-12 shrink-0 flex items-center justify-between',
        'pl-5 pr-4 py-2 border-b border-border-subtle',
        className
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-2 overflow-hidden">
        {topicMode ? (
          <TopicState
            type="topic"
            status={isResolved ? 'resolved' : 'unresolved'}
            isPrivate={isPrivate}
          />
        ) : (
          <Avatar size={16} src={avatarSrc} alt={name} />
        )}
        {name && (
          <span className="text-body-2-strong text-text-primary truncate">{name}</span>
        )}
      </div>

      {/* Right */}
      <div className="flex gap-3 items-center shrink-0">
        {topicMode && (
          <>
            {/* Open / resolved counts */}
            <div className="flex items-center gap-2">
              <span className="text-caption text-text-secondary whitespace-nowrap">
                {openCount} open
              </span>
              <div className="w-[3px] h-[3px] rounded-full bg-text-muted shrink-0" />
              <span className="text-caption text-success-default whitespace-nowrap">
                {resolvedCount} resolved
              </span>
            </div>

            {/* Members */}
            <div className="bg-bg-elevated border border-border-default rounded-sm flex gap-2 items-center pl-[2px] pr-2 py-[2px]">
              <AvatarGroup />
              <span className="text-caption text-text-secondary">4</span>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex gap-1 items-center">
          {topicMode && (
            <IconButton tooltip="Timeline" aria-label="Timeline">
              <IconTimeline size={16} stroke={1.5} />
            </IconButton>
          )}
          <IconButton tooltip="Favorite" aria-label="Favorite">
            <IconStar size={16} stroke={1.5} />
          </IconButton>
          <IconButton tooltip="More actions" aria-label="More actions">
            <IconDotsVertical size={16} stroke={1.5} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
