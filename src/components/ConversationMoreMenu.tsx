import {
  IconCircleDashed,
  IconCircleCheck,
  IconPlus,
  IconArrowBack,
  IconEye,
} from '@tabler/icons-react'
import { Divider } from './ui/Divider'
import { cn } from '@/lib/utils'

interface ConversationMoreMenuProps {
  isTopic?: boolean
  isPrivate?: boolean
  isResolved?: boolean
  showCreateTopic?: boolean
  onCreateTopic?: () => void
  onRevertToConversation?: () => void
  onMakePublic?: () => void
  onResolve?: () => void
  onReopen?: () => void
  onOpenWork?: () => void
  onEditMessage?: () => void
  onViewDetails?: () => void
  onDelete?: () => void
  className?: string
}

function MenuItem({
  icon,
  label,
  shortcut,
  destructive,
  onClick,
}: {
  icon?: React.ReactNode
  label: string
  shortcut?: string
  destructive?: boolean
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-bg-hover w-full',
      )}
      onClick={onClick}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span
        className={cn(
          'flex-1 text-sm truncate',
          destructive ? 'text-error-default' : 'text-text-secondary'
        )}
      >
        {label}
      </span>
      {shortcut && (
        <kbd className="inline-flex items-center justify-center bg-bg-inset border border-border-strong rounded-sm px-1 py-[1px] text-caption text-text-secondary shrink-0">
          {shortcut}
        </kbd>
      )}
    </div>
  )
}

export function ConversationMoreMenu({
  isTopic = false,
  isPrivate = false,
  isResolved = false,
  showCreateTopic = true,
  onCreateTopic,
  onRevertToConversation,
  onMakePublic,
  onResolve,
  onReopen,
  onOpenWork,
  onEditMessage,
  onViewDetails,
  onDelete,
  className,
}: ConversationMoreMenuProps) {
  return (
    <div
      className={cn(
        'bg-bg-elevated border border-border-default rounded-lg shadow-lg w-[244px] p-2 flex flex-col gap-2',
        className
      )}
    >
      <div className="flex flex-col">
        <div className="flex h-[32px] items-center px-2">
          <span className="text-h5 text-text-primary">Utilities</span>
        </div>

        {isTopic ? (
          <>
            <MenuItem
              icon={<IconArrowBack size={16} stroke={1.5} className="text-text-secondary" />}
              label="Revert to conversation"
              onClick={onRevertToConversation}
            />
            {isPrivate && (
              <MenuItem
                icon={<IconEye size={16} stroke={1.5} className="text-text-secondary" />}
                label="Make public"
                onClick={onMakePublic}
              />
            )}
          </>
        ) : showCreateTopic ? (
          <MenuItem
            icon={<IconCircleDashed size={16} stroke={1.5} className="text-text-secondary" />}
            label="Create topic"
            onClick={onCreateTopic}
          />
        ) : null}

        {isResolved ? (
          <MenuItem
            icon={<IconCircleDashed size={16} stroke={1.5} className="text-text-secondary" />}
            label="Reopen"
            onClick={onReopen}
          />
        ) : (
          <MenuItem
            icon={<IconCircleCheck size={16} stroke={1.5} className="text-text-secondary" />}
            label="Resolve"
            shortcut="→"
            onClick={onResolve}
          />
        )}

        <MenuItem
          icon={<IconPlus size={16} stroke={1.5} className="text-text-secondary" />}
          label="Open work"
          onClick={onOpenWork}
        />
      </div>

      <Divider className="mx-0" />

      <div className="flex flex-col">
        {!isTopic && (
          <MenuItem label="Edit message" onClick={onEditMessage} />
        )}
        <MenuItem label="View details" onClick={onViewDetails} />
      </div>

      <Divider className="mx-0" />

      <MenuItem label="Delete" destructive onClick={onDelete} />
    </div>
  )
}
