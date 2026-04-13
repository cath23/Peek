import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconMessage2, IconDotsVertical } from '@tabler/icons-react'
import { Avatar } from './ui/Avatar'
import { Divider } from './ui/Divider'
import { IconButton } from './ui/IconButton'
import { cn } from '@/lib/utils'
import type { Huddle } from '@/data/huddleData'

interface HuddleCardProps {
  huddle: Huddle
  isSelected?: boolean
  onClick?: () => void
  onReply?: () => void
  onDelete?: () => void
  className?: string
}

export function MemberAvatars({ count, borderClass }: { count: number; borderClass?: string }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'relative shrink-0 size-6 rounded-sm overflow-hidden border-2',
            i > 0 && '-ml-2',
            borderClass ?? 'border-bg-surface'
          )}
        >
          <Avatar size={24} />
        </div>
      ))}
    </div>
  )
}

export function HuddleCard({
  huddle,
  isSelected = false,
  onClick,
  onReply,
  onDelete,
  className,
}: HuddleCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const memberLabel =
    huddle.members.length <= 2
      ? huddle.members.join(', ')
      : `${huddle.members[0]} + ${huddle.members.length - 1}`

  const bodyText = huddle.conversation.body

  const replyCount = huddle.conversation.replyCount ?? 0

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    const btn = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const MENU_HEIGHT = 100
    const right = window.innerWidth - btn.right
    if (window.innerHeight - btn.bottom < MENU_HEIGHT) {
      setMenuPos({ bottom: window.innerHeight - btn.top + 4, right })
    } else {
      setMenuPos({ top: btn.bottom + 4, right })
    }
    setShowMenu((v) => !v)
  }

  const handleDelete = () => {
    setShowMenu(false)
    onDelete?.()
  }

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const close = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      setShowMenu(false)
      setMenuPos(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showMenu])

  return (
    <>
      <div
        className={cn(
          'relative flex flex-col p-2 rounded-lg cursor-pointer transition-colors h-[130px]',
          'border',
          isSelected
            ? 'bg-bg-selected border-border-subtle'
            : isHovered
              ? 'bg-bg-hover border-border-default'
              : 'bg-bg-surface border-border-subtle',
          className
        )}
        onClick={(e) => {
          if (showMenu) return
          const target = e.target as HTMLElement
          if (target.closest('button, [role="button"], [data-interactive]')) return
          onClick?.()
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (showMenu) return
          setIsHovered(false)
        }}
      >
        {/* Header: avatars + names + timestamp */}
        <div className="flex items-center gap-2">
          <MemberAvatars
            count={huddle.members.length}
            borderClass={isSelected ? 'border-bg-selected' : isHovered ? 'border-bg-hover' : 'border-bg-surface'}
          />
          <span className="text-body-2-strong text-text-primary truncate flex-1">
            {memberLabel}
          </span>
          <span className="text-caption text-text-muted whitespace-nowrap shrink-0">
            {huddle.lastActivity}, {huddle.conversation.timestamp}
          </span>
        </div>

        {/* Message preview — 2 lines with ellipsis */}
        <div className="pt-1 flex-1 min-h-0 overflow-hidden">
          <p className="text-caption text-text-secondary leading-[1.4] line-clamp-2">
            {bodyText.split('\n').filter(Boolean).map((line, i) => {
              const cleaned = line.replace(/^[-•]\s/, '• ').replace(/^\d+\.\s/, (m) => m)
              return (
                <span key={i}>
                  {i > 0 && <br />}
                  {cleaned}
                </span>
              )
            })}
          </p>
        </div>

        {/* Footer: replies — 24px total height */}
        {replyCount > 0 && (
          <div className="flex items-center gap-2 text-text-muted h-6">
            <IconMessage2 size={14} stroke={1.5} className="shrink-0" />
            <span className="text-caption">
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </span>
          </div>
        )}

        {/* Quick menu on hover */}
        {isHovered && (
          <div className="absolute right-[3px] top-[3px]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-bg-elevated border border-border-subtle rounded-sm shadow-sm flex items-start gap-1 p-1">
              <IconButton tooltip="Reply" aria-label="Reply" onClick={() => { onReply?.(); onClick?.() }}>
                <IconMessage2 size={16} stroke={1.5} />
              </IconButton>
              <div className="w-px self-stretch bg-border-subtle" />
              <IconButton tooltip="More actions" aria-label="More actions" onClick={handleMore}>
                <IconDotsVertical size={16} stroke={1.5} />
              </IconButton>
            </div>
          </div>
        )}
      </div>

      {/* More menu (portalled) */}
      {showMenu && menuPos &&
        createPortal(
          <div
            ref={menuRef}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseLeave={() => { setShowMenu(false); setMenuPos(null); setIsHovered(false) }}
            style={{
              position: 'fixed',
              ...(menuPos.top !== undefined ? { top: menuPos.top } : {}),
              ...(menuPos.bottom !== undefined ? { bottom: menuPos.bottom } : {}),
              right: menuPos.right,
              zIndex: 50,
            }}
          >
            <div className="bg-bg-elevated border border-border-default rounded-lg shadow-lg w-[244px] p-2 flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-bg-hover">
                  <span className="flex-1 text-sm text-text-secondary">View details</span>
                </div>
              </div>
              <Divider className="mx-0" />
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-bg-hover"
                onClick={handleDelete}
              >
                <span className="flex-1 text-sm text-error-default">Delete</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
