import { type ReactNode } from 'react'
import { TopBar } from '@/components/TopBar'
import { NavRail } from '@/components/NavRail'

interface AppShellProps {
  leftPanel?: ReactNode
  rightPanel?: ReactNode
}

export function AppShell({ leftPanel, rightPanel }: AppShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-bg-base relative">
      <TopBar />

      {/* Main area — offset below TopBar */}
      <div className="flex h-full pt-[52px] pb-4 pr-4">
        <NavRail />

        {/* App card */}
        <div className="flex flex-1 min-w-0 bg-bg-surface rounded-2xl overflow-hidden">
          {/* Left panel */}
          {leftPanel && (
            <div className="w-[290px] shrink-0 border-r border-border-subtle flex flex-col overflow-hidden">
              {leftPanel}
            </div>
          )}

          {/* Right panel */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  )
}
