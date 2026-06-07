import { IconDotsVertical, IconX } from '@tabler/icons-react'
import { TopicState, type TopicStateType, type TopicStateStatus } from './TopicState'
import { IconButton, ListRow, UnreadIndicator, cn } from '@nostr-for-business/ui'
import { avatarFor } from '@/data/peopleData'

interface PersonRowProps {
  name: string
  type?: TopicStateType
  topicStatus?: TopicStateStatus
  isUnread?: boolean
  isUrgent?: boolean
  isSelected?: boolean
  avatarSrc?: string
  memberCount?: number
  onClick?: () => void
  /** When provided, replaces the hover "more options" 3-dot icon with an X
   *  that calls this handler. Used by Open work rows so users can remove an
   *  item from the list. */
  onRemove?: () => void
  className?: string
}

/** Peek list row: a TopicState leading icon + person/topic name, with a hover action and
 *  an unread indicator, composed over the shared ListRow. */
export function PersonRow({
  name,
  type = 'topic',
  topicStatus = 'unresolved',
  isUnread = false,
  isUrgent = false,
  isSelected = false,
  avatarSrc,
  memberCount,
  onClick,
  onRemove,
  className,
}: PersonRowProps) {
  return (
    <ListRow
      selected={isSelected}
      onClick={onClick}
      className={className}
      titleClassName={cn(
        isUnread ? 'font-medium' : 'font-normal',
        isSelected || isUnread ? 'text-text-primary' : 'text-text-secondary',
      )}
      title={name}
      leading={
        <TopicState
          type={type}
          status={type === 'topic' ? topicStatus : 'default'}
          avatarSrc={avatarSrc ?? (type === 'DM' ? avatarFor(name) : undefined)}
          memberCount={memberCount}
          iconClassName={isSelected || isUnread ? 'text-text-primary' : undefined}
        />
      }
      // Right slot - rendered only when there's something to show, so the title can use
      // the full row width when idle. Slight layout shift on hover is intentional.
      trailing={(hovered) =>
        hovered ? (
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            {onRemove ? (
              <IconButton
                tooltip="Remove from list"
                aria-label="Remove from list"
                onClick={(e) => { e.stopPropagation(); onRemove() }}
                className="-m-1"
              >
                <IconX size={16} stroke={1.5} />
              </IconButton>
            ) : (
              <IconButton
                tooltip="More options"
                aria-label="More options"
                onClick={(e) => e.stopPropagation()}
                className="-m-1"
              >
                <IconDotsVertical size={16} stroke={1.5} />
              </IconButton>
            )}
          </div>
        ) : isUnread ? (
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <UnreadIndicator urgent={isUrgent} />
          </div>
        ) : null
      }
    />
  )
}
