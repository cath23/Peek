import type { ReactNode } from 'react'
import { AppShell as BaseAppShell } from '@nostr-for-business/ui'
import { TopBar } from '@/components/TopBar'
import { NavRail } from '@/components/NavRail'

interface AppShellProps {
  leftPanel?: ReactNode
  rightPanel?: ReactNode
  threadPanel?: ReactNode
}

/** Peek's app shell: supplies the Peek TopBar + NavRail to the shared AppShell layout. */
export function AppShell({ leftPanel, rightPanel, threadPanel }: AppShellProps) {
  return (
    <BaseAppShell
      topBar={({ toggleCollapsed }) => <TopBar onMenuToggle={toggleCollapsed} />}
      navRail={<NavRail />}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      threadPanel={threadPanel}
    />
  )
}
