import type { Meta } from '@storybook/react-vite'
import {
  AppShell, IconButton, SearchInput, PanelHeader, EmptyState,
  SidePanel, SidePanelHeader, NavRail, NavItem,
} from '@nostr-for-business/ui'
import {
  IconLayoutSidebar, IconHome, IconUsers, IconHash, IconInbox, IconX,
} from '@tabler/icons-react'

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>

export default meta

/** Top bar — receives collapse controls from AppShell via render-prop. */
function TopBar({ toggleCollapsed }: { collapsed: boolean; toggleCollapsed: () => void }) {
  return (
    <div className="absolute top-0 inset-x-0 h-[52px] flex items-center gap-3 px-4">
      <IconButton aria-label="Toggle sidebar" onClick={toggleCollapsed}>
        <IconLayoutSidebar size={16} stroke={1.5} />
      </IconButton>
      <div className="flex-1 flex justify-center">
        <SearchInput className="w-[280px]" shortcut="⌘ K" />
      </div>
      <div className="size-9 rounded-full bg-bg-inset" aria-label="Account" />
    </div>
  )
}

/** Left nav rail (side menu) — the shared NavRail/NavItem. */
function SideNav() {
  return (
    <NavRail>
      <NavItem icon={<IconHome size={16} stroke={1.5} />} label="Home" active />
      <NavItem icon={<IconHash size={16} stroke={1.5} />} label="Topics" />
      <NavItem icon={<IconUsers size={16} stroke={1.5} />} label="People" />
    </NavRail>
  )
}

/** Left column — header + (empty) scroll area. Fill the body slot in a real app. */
function LeftColumn() {
  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="Sidebar" chevron prop1stAction prop1stActionTooltip="New" />
      <div className="flex-1 overflow-y-auto" />
    </div>
  )
}

/** Main column — header + empty state. */
function MainColumn() {
  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="Main" />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon={<IconInbox size={16} stroke={1.5} />} message="Nothing selected" />
      </div>
    </div>
  )
}

/** Right side panel (thread/detail) — header + (empty) body. */
function RightPanel() {
  return (
    <SidePanel>
      <SidePanelHeader>
        <span className="text-body-2-strong text-text-primary">Panel</span>
        <IconButton aria-label="Close"><IconX size={16} stroke={1.5} /></IconButton>
      </SidePanelHeader>
      <div className="flex-1" />
    </SidePanel>
  )
}

/**
 * The shared app layout: fixed top bar + collapsible nav rail + a rounded surface holding a
 * left column, a main column, and an optional right panel. Every region is a slot — this story
 * shows the structure with empty columns; real apps fill them (see Peek/AppShell).
 */
export const Default = {
  render: () => (
    <AppShell
      topBar={(api) => <TopBar {...api} />}
      navRail={<SideNav />}
      leftPanel={<LeftColumn />}
      rightPanel={<MainColumn />}
      threadPanel={<RightPanel />}
    />
  ),
}

/** Without the right panel — two-column layout only. Use the top-bar button to collapse the rail. */
export const TwoColumn = {
  render: () => (
    <AppShell
      topBar={(api) => <TopBar {...api} />}
      navRail={<SideNav />}
      leftPanel={<LeftColumn />}
      rightPanel={<MainColumn />}
    />
  ),
}
