import { useState } from 'react'
import { IconDotsVertical } from '@tabler/icons-react'
import { TopicState, type TopicStateType, type TopicStateStatus } from './TopicState'
import { IconButton } from './IconButton'
import { cn } from '@/lib/utils'

interface PersonRowProps {
  name: string
  type?: TopicStateType
  topicStatus?: TopicStateStatus
  isPrivate?: boolean
  isUnread?: boolean
  isSelected?: boolean
  avatarSrc?: string
  memberCount?: number
  onClick?: () => void
  className?: string
}

export function PersonRow({
  name,
  type = 'topic',
  topicStatus = 'unresolved',
  isPrivate = false,
  isUnread = false,
  isSelected = false,
  avatarSrc,
  memberCount,
  onClick,
  className,
}: PersonRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 h-[32px] rounded-lg cursor-pointer transition-colors',
        isSelected ? 'bg-bg-selected' : isHovered ? 'bg-bg-hover' : '',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TopicState
        type={type}
        status={type === 'topic' ? topicStatus : 'default'}
        isPrivate={isPrivate}
        avatarSrc={avatarSrc}
        memberCount={memberCount}
      />

      <span
        className={cn(
          'flex-1 text-sm truncate',
          isUnread ? 'font-medium' : 'font-normal',
          isSelected || isUnread ? 'text-text-primary' : 'text-text-secondary'
        )}
      >
        {name}
      </span>

      {/* Right slot — fixed 24×24 so layout never shifts */}
      <div className="w-6 h-6 flex items-center justify-center shrink-0">
        {isHovered ? (
          <IconButton
            aria-label="More options"
            onClick={(e) => e.stopPropagation()}
            className="-m-1"
          >
            <IconDotsVertical size={16} stroke={1.5} />
          </IconButton>
        ) : isUnread ? (
          <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
        ) : null}
      </div>
    </div>
  )
}
