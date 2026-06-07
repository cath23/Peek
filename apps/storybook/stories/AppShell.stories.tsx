import type { Meta } from '@storybook/react-vite'
import { AppShell, IconButton, SearchInput } from '@nostr-for-business/ui'
import {
  IconLayoutSidebar, IconHome, IconUsers, IconHash, IconX,
} from '@tabler/icons-react'

const meta = {
  title: 'Shells/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>

export default meta

/** A faux top bar — receives collapse controls from AppShell via render-prop. */
function TopBar({ toggleCollapsed }: { collapsed: boolean; toggleCollapsed: () => void }) {
  return (
    <div className="absolute top-0 inset-x-0 h-[52px] flex items-center gap-3 px-4">
      <IconButton aria-label="Toggle sidebar" onClick={toggleCollapsed}>
        <IconLayoutSidebar size={16} stroke={1.5} />
      </IconButton>
      <span className="text-body-2-strong text-text-primary">Peek</span>
      <div className="flex-1" />
      <SearchInput className="w-[240px]" shortcut="⌘ K" />
    </div>
  )
}

function NavRail() {
  return (
    <div className="w-16 h-full flex flex-col items-center gap-2 pt-2">
      {[IconHome, IconUsers, IconHash].map((Icon, i) => (
        <IconButton key={i} aria-label="Nav item">
          <Icon size={16} stroke={1.5} />
        </IconButton>
      ))}
    </div>
  )
}

function LeftPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-12 shrink-0 flex items-center px-5 border-b border-border-subtle">
        <span className="text-body-2-strong text-text-primary">Topics</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {['Design review', 'Q3 roadmap', 'Hiring', 'Bug triage'].map((t) => (
          <div key={t} className="px-3 py-2 rounded-lg hover:bg-bg-hover text-body-2 text-text-secondary cursor-pointer">
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

function RightPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-12 shrink-0 flex items-center px-5 border-b border-border-subtle">
        <span className="text-body-2-strong text-text-primary">Design review</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="text-body-2 text-text-secondary">Message {i + 1}</div>
        ))}
      </div>
    </div>
  )
}

function ThreadPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-border-subtle">
        <span className="text-body-2-strong text-text-primary">Replies</span>
        <IconButton aria-label="Close"><IconX size={16} stroke={1.5} /></IconButton>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-body-2 text-text-secondary">Reply {i + 1}</div>
        ))}
      </div>
    </div>
  )
}

export const Default = {
  render: () => (
    <AppShell
      topBar={(api) => <TopBar {...api} />}
      navRail={<NavRail />}
      leftPanel={<LeftPanel />}
      rightPanel={<RightPanel />}
    />
  ),
}

/** With the optional thread panel docked on the right. Use the top-bar button to collapse. */
export const WithThreadPanel = {
  render: () => (
    <AppShell
      topBar={(api) => <TopBar {...api} />}
      navRail={<NavRail />}
      leftPanel={<LeftPanel />}
      rightPanel={<RightPanel />}
      threadPanel={<ThreadPanel />}
    />
  ),
}
