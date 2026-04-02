import {
  IconCircleDashed,
  IconCircleCheck,
  IconUsers,
  IconBrackets,
  IconLockFilled,
} from '@tabler/icons-react'
import { Avatar } from './Avatar'
import { cn } from '@/lib/utils'

export type TopicStateType = 'topic' | 'DM' | 'team' | 'group' | 'view'
export type TopicStateStatus = 'unresolved' | 'resolved' | 'default'

interface TopicStateProps {
  type: TopicStateType
  status?: TopicStateStatus
  isPrivate?: boolean
  avatarSrc?: string
  memberCount?: number
  className?: string
}

export function TopicState({
  type,
  status = 'default',
  isPrivate = false,
  avatarSrc,
  memberCount,
  className,
}: TopicStateProps) {
  return (
    <div className={cn('relative shrink-0 flex items-center justify-center w-4 h-4', className)}>
      {type === 'topic' && status === 'resolved' ? (
        <IconCircleCheck size={16} stroke={1.5} className="text-success-default" />
      ) : type === 'topic' ? (
        <IconCircleDashed size={16} stroke={1.5} className="text-text-secondary" />
      ) : type === 'DM' ? (
        <Avatar size={16} src={avatarSrc} />
      ) : type === 'team' ? (
        <IconUsers size={16} stroke={1.5} className="text-text-secondary" />
      ) : type === 'group' ? (
        <div className="flex items-center justify-center bg-bg-inset rounded-sm px-[2px] min-w-[16px] h-[16px]">
          <span className="text-[11px] font-medium text-text-secondary leading-none">
            {memberCount ?? 0}
          </span>
        </div>
      ) : type === 'view' ? (
        <IconBrackets size={16} stroke={1.5} className="text-text-secondary" />
      ) : null}

      {type === 'topic' && isPrivate && (
        <div className="absolute left-[9px] top-[7px] bg-bg-surface rounded-full p-[1px]">
          <IconLockFilled size={10} className="text-text-primary" />
        </div>
      )}
    </div>
  )
}
