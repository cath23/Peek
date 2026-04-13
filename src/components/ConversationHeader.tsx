import { type ReactNode } from 'react'
import { IconStar, IconDotsVertical } from '@tabler/icons-react'
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
  openCount?: number
  resolvedCount?: number
  /** Hide counts and members pill (e.g. when Huddles tab is active) */
  hideTopicMeta?: boolean
  tabs?: ReactNode
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
  openCount = 0,
  resolvedCount = 0,
  hideTopicMeta = false,
  tabs,
  className,
}: ConversationHeaderProps) {
  return (
    <div className={cn('shrink-0 border-b border-border-subtle', className)}>
      {/* Row 1: title + actions */}
      <div className="h-12 flex items-center justify-between pl-5 pr-4 py-2">
        {/* Left */}
        <div className="flex items-center gap-2 overflow-hidden">
          {topicMode ? (
            <TopicState
              type="topic"
              status={isResolved ? 'resolved' : 'unresolved'}
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
          {topicMode && !hideTopicMeta && (
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
            <IconButton tooltip="Favorite" aria-label="Favorite">
              <IconStar size={16} stroke={1.5} />
            </IconButton>
            <IconButton tooltip="More actions" aria-label="More actions">
              <IconDotsVertical size={16} stroke={1.5} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Row 2: tabs */}
      {tabs && (
        <div className="pl-5 pr-4 pb-2">
          {tabs}
        </div>
      )}
    </div>
  )
}
