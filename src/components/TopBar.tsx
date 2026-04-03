import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconMenu2, IconHelpCircle, IconSun, IconMoon, IconDeviceDesktop, IconCheck } from '@tabler/icons-react'
import { IconButton } from './ui/IconButton'
import { Avatar } from './ui/Avatar'
import { SearchInput } from './ui/SearchInput'
import { useTheme, type Theme } from '@/lib/theme'
import avatarSrc from '@/assets/avatar.png'

interface TopBarProps {
  onMenuToggle?: () => void
}

const THEME_OPTIONS: { value: Theme; label: string; icon: React.FC<{ size: number; stroke: number; className?: string }> }[] = [
  { value: 'light', label: 'Light', icon: IconSun },
  { value: 'dark', label: 'Dark', icon: IconMoon },
  { value: 'system', label: 'System', icon: IconDeviceDesktop },
]

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      if (avatarRef.current?.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Position the menu below the avatar
  const rect = avatarRef.current?.getBoundingClientRect()

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
        <button
          ref={avatarRef}
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-full cursor-pointer focus:outline-none"
        >
          <Avatar size={36} src={avatarSrc} alt="Your avatar" />
        </button>
      </div>

      {/* Theme menu */}
      {menuOpen && rect && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 bg-bg-elevated border border-border-default rounded-lg shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.4),0px_10px_15px_-3px_rgba(0,0,0,0.5)] p-1"
          style={{ top: rect.bottom + 6, right: window.innerWidth - rect.right }}
        >
          <div className="flex items-center h-7 px-3">
            <span className="text-[12px] font-medium leading-none text-text-secondary">Theme</span>
          </div>
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = theme === opt.value
            return (
              <div
                key={opt.value}
                className="flex items-center gap-3 h-9 px-3 rounded-lg cursor-pointer transition-colors hover:bg-bg-hover min-w-[160px]"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setTheme(opt.value)
                  setMenuOpen(false)
                }}
              >
                <Icon size={16} stroke={1.5} className="text-text-secondary shrink-0" />
                <span className="flex-1 text-[14px] font-normal leading-[1.4] text-text-primary">{opt.label}</span>
                {active && <IconCheck size={16} stroke={1.5} className="text-text-primary shrink-0" />}
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}
