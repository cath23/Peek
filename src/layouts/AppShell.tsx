import { useState, type ReactNode } from 'react'
import { TopBar } from '@/components/TopBar'
import { NavRail } from '@/components/NavRail'

interface AppShellProps {
  leftPanel?: ReactNode
  rightPanel?: ReactNode
  threadPanel?: ReactNode
}

export function AppShell({ leftPanel, rightPanel, threadPanel }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-screen overflow-hidden bg-bg-base relative">
      <TopBar onMenuToggle={() => setCollapsed((c) => !c)} />

      {/* Main area — offset below TopBar */}
      <div className="flex h-full pt-[52px] pb-4 pr-4 transition-[padding] duration-300 ease-in-out"
        style={{ paddingLeft: collapsed ? 16 : 0 }}
      >
        {/* NavRail — collapses to 0 width */}
        <div
          className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out"
          style={{ width: collapsed ? 0 : 64, opacity: collapsed ? 0 : 1 }}
        >
          <NavRail />
        </div>

        {/* App card */}
        <div className="flex flex-1 min-w-0 bg-bg-surface rounded-2xl overflow-hidden">
          {/* Left panel — collapses to 0 width */}
          {leftPanel && (
            <div
              className="shrink-0 border-r border-border-subtle flex flex-col overflow-hidden transition-[width,opacity] duration-300 ease-in-out"
              style={{ width: collapsed ? 0 : 290, opacity: collapsed ? 0 : 1, borderRightWidth: collapsed ? 0 : 1 }}
            >
              {leftPanel}
            </div>
          )}

          {/* Right panel (conversation area) */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {rightPanel}
          </div>

          {/* Thread panel */}
          {threadPanel && (
            <div className="shrink-0 w-[380px] border-l border-border-subtle flex flex-col overflow-hidden">
              {threadPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
