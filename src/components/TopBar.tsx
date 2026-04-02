import { IconMenu2, IconHelpCircle } from '@tabler/icons-react'
import { IconButton } from './ui/IconButton'
import { Avatar } from './ui/Avatar'
import { SearchInput } from './ui/SearchInput'
import avatarSrc from '@/assets/avatar.png'

interface TopBarProps {
  onMenuToggle?: () => void
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 h-[52px] flex items-center pl-5 pr-[26px] z-10 pointer-events-none">
      {/* Left */}
      <div className="pointer-events-auto">
        <IconButton tooltip="Toggle menu" onClick={onMenuToggle} aria-label="Toggle menu">
          <IconMenu2 size={16} stroke={1.5} />
        </IconButton>
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center pointer-events-auto">
        <SearchInput shortcut="⌘ K" className="w-[290px]" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-[6px] pointer-events-auto">
        <IconButton tooltip="Help" tooltipPlacement="bottom" aria-label="Help">
          <IconHelpCircle size={16} stroke={1.5} />
        </IconButton>
        <Avatar size={36} src={avatarSrc} alt="Your avatar" />
      </div>
    </div>
  )
}
